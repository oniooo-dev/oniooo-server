/**
 * Mostly just WebSockets Utility Functions
*/

import { AuthSocket } from "./types";
import { llmService } from "../llmServiceSingleton";
import { appendChunkToMessage, createChatInDatabase, createMessagePlaceholder, loadMessagesForLLMFromDatabase, saveMessageToDatabase, extractS3KeyFromUrl, fetchFileAsBase64 } from "../../utils/messages";
import { inspect } from "util";
import { clarityUpscaler, fluxPro, fluxSchnell, removeBackground } from "../../config/minions/fal";
import { kling, luma, suno } from "../../config/minions/piapi";
import { fastUpscale, stableDiffusion } from "../../config/minions/stability";
import fs from 'fs';
import path from 'path';
import os from 'os';
import { decreaseMochiBalance, getMochiBalance } from "../../utils/mochis";
import { generateSignedUrl } from "../../utils/messages";
import { AnthropicClient } from "../llm/anthropic/AnthropicClient";

export enum MochiCost {
    TEXT_GENERATION = 1,
    IMAGE_GEN_FLUX_SCHNELL = 1,
    IMAGE_GEN_FLUX_PRO = 8,
    // IMAGE_GEN_STABLE_DIFFUSION = 10,
    // IMAGE_GEN_FAST_UPSCALE = 2,
    IMAGE_GEN_CLARITY_UPSCALE = 1,
    IMAGE_GEN_REMOVE_BACKGROUND = 1,
    VIDEO_GEN_KLING = 30,
    VIDEO_GEN_LUMA = 30,
}

function base64ToBinaryString(base64String: string): string {

    // Create a Buffer from the base64 string
    const buffer = Buffer.from(base64String, 'base64');

    // Convert the Buffer to a binary string
    const binaryString = buffer.toString('binary');

    return binaryString;
}

interface ToolUsage {
    name: string;
    count?: number; // Number of times the tool is used or quantity related to the tool
}

export class ChatHandler {
    socket: AuthSocket;
    chunkId: number = 0;    // Incrementing ID for each chunk
    anthropicClient: AnthropicClient;

    constructor(socket: AuthSocket) {
        this.socket = socket;
        this.anthropicClient = new AnthropicClient();
        this.registerEvents();
    }

    private registerEvents(): void {
        this.socket.on('query_llm', this.handleUserQuery);
        this.socket.on('disconnect', this.handleDisconnect);
    }

    private handleUserQuery =
        async (
            data: {
                chatId: string,                                 // Chat ID
                userTextQuery: string,                          // User Text Query
                fileURIs: string[]                              // Uploaded File URIs
            }
        ): Promise<void> => {
            try {

                // Get the user ID from the socket
                const userId = this.socket.userId;
                if (!userId) {
                    throw new Error('User ID is required');
                }

                // Extract the data from the message
                let { chatId, userTextQuery, fileURIs } = data;
                console.log(`User: ${userTextQuery}`);
                console.log('File URIs: ', fileURIs);

                // Create the chat in the database if it doesn't exist
                if (!chatId) {

                    // Generate the title for the chat
                    const title = await llmService.generate(userTextQuery);

                    // Create the chat in the database
                    const newChat = await createChatInDatabase(userId, title);

                    // Update the chat ID
                    chatId = newChat.chat_id;

                    // Emit the new chat ID back to the client
                    this.socket.emit(
                        'new_chat_created',
                        {
                            chatId: chatId
                        }
                    );
                }

                for (const fileURI of fileURIs) {
                    await saveMessageToDatabase(chatId, userId, "USER_FILE", fileURI);
                }

                let mochiAmount = 0;
                const mochiBalance = await getMochiBalance(userId);

                // Check if the mochi balance retrieval was successful
                if (!mochiBalance.success) {
                    this.socket.emit(
                        'error',
                        {
                            message: 'Failed to retrieve mochi balance.'
                        }
                    );
                    return;
                }

                console.log('mochiBalance: ', mochiBalance.balance);

                // Database operations for message persistence
                if (userTextQuery) {

                    console.log('userTextQuery: ', userTextQuery);

                    // Text generation is used
                    mochiAmount = Math.max(mochiAmount, MochiCost.TEXT_GENERATION);

                    console.log('mochiAmount: ', mochiAmount);
                    console.log('mochiBalance: ', mochiBalance.balance);


                    if (!mochiBalance.balance) {
                        this.socket.emit(
                            'error',
                            {
                                message: 'INSUFFICIENT_MOCHI_BALANCE'
                            }
                        );
                        return;
                    }

                    // Check if the user has enough mochi balance
                    if (mochiBalance.balance < mochiAmount) { // Updated condition
                        console.log('mochiBalance: ', mochiBalance.balance, 'MochiCost: ', mochiAmount);
                        this.socket.emit(
                            'error',
                            {
                                message: 'INSUFFICIENT_MOCHI_BALANCE'
                            }
                        );
                        return;
                    }
                    else {
                        await saveMessageToDatabase(chatId, userId, "USER_TEXT", userTextQuery);
                    }
                }

                const messageId = await createMessagePlaceholder(chatId, userId, 'SYSTEM_TEXT');
                const previousChatMessages = await loadMessagesForLLMFromDatabase(userId, chatId);

                // Start streaming the response from the LLM
                const { stream } = llmService.stream(userTextQuery, previousChatMessages, fileURIs);

                this.socket.emit('melody_state_update',
                    {
                        melodyState: "THINKING"
                    }
                );

                // TEXT STREAM
                stream.on(
                    'text',
                    async (chunk) => {

                        // MELODY STARTS YAPPIN'
                        this.socket.emit('melody_state_update',
                            {
                                melodyState: null
                            }
                        );

                        // Increment the chunk ID
                        const currentChunkId = this.chunkId++;

                        // Append the chunk to the message in the database
                        console.log('Claude: ', chunk);
                        await appendChunkToMessage(messageId, chunk);

                        // Emit the chunk to the client
                        this.socket.emit(
                            'llm_response',
                            {
                                text: chunk,
                                chunkId: currentChunkId
                            }
                        );
                    }
                )

                // TOOL USE STREAM
                stream.on(
                    'contentBlock',
                    async (contentBlock: any) => {

                        if (contentBlock.type === "tool_use") {

                            this.socket.emit('melody_state_update',
                                {
                                    melodyState: "CREATING"
                                }
                            );

                            // TOOL USE - UPDATE MELODY CHAT STATE HERE

                            /// Log the tool use
                            console.log(`toolUse: ${inspect(contentBlock)}`);

                            if (contentBlock.name === "fluxPro") {

                                // Check if the user has enough mochi balance
                                if (mochiBalance.balance && mochiBalance.balance < MochiCost.IMAGE_GEN_FLUX_PRO) {
                                    this.socket.emit(
                                        'error',
                                        {
                                            message: 'INSUFFICIENT_MOCHI_BALANCE'
                                        }
                                    );
                                    return;
                                }

                                const imageUrl = await fluxPro(contentBlock.input.prompt);
                                this.socket.emit(
                                    'image_response',
                                    {
                                        imageUrl: imageUrl,
                                    }
                                );
                                this.socket.emit('melody_state_update',
                                    {
                                        melodyState: null
                                    }
                                );
                                await saveMessageToDatabase(chatId, userId, "SYSTEM_FILE", imageUrl);
                                mochiAmount = Math.max(mochiAmount, MochiCost.IMAGE_GEN_FLUX_PRO);
                            }
                            else if (contentBlock.name === "fluxSchnell") {

                                const numImages = contentBlock.input.num_images || 1; // Default to 1 if not specified

                                // Check if the user has enough mochi balance
                                if (mochiBalance.balance && mochiBalance.balance < MochiCost.IMAGE_GEN_FLUX_SCHNELL * numImages) {
                                    this.socket.emit(
                                        'error',
                                        {
                                            message: 'INSUFFICIENT_MOCHI_BALANCE'
                                        }
                                    );
                                    return;
                                }

                                const images = await fluxSchnell(contentBlock.input.prompt, numImages);

                                // Emit the images to the client
                                for (const image of images) {

                                    // Emit the image to the client
                                    this.socket.emit(
                                        'image_response',
                                        {
                                            imageUrl: image.url,
                                        }
                                    );

                                    // Update the melody state
                                    this.socket.emit('melody_state_update',
                                        {
                                            melodyState: null
                                        }
                                    );

                                    // Save the image URL to the database
                                    await saveMessageToDatabase(chatId, userId, "SYSTEM_FILE", image.url);
                                }
                                mochiAmount = Math.max(mochiAmount, MochiCost.IMAGE_GEN_FLUX_SCHNELL * numImages);
                            }
                            else if (contentBlock.name === "clarityUpscaler") {

                                // Check if the user has enough mochi balance
                                if (mochiBalance.balance && mochiBalance.balance < MochiCost.IMAGE_GEN_CLARITY_UPSCALE) {
                                    this.socket.emit(
                                        'error',
                                        {
                                            message: 'INSUFFICIENT_MOCHI_BALANCE'
                                        }
                                    );
                                    return;
                                }

                                // Upscale the image
                                const fileKey = extractS3KeyFromUrl(fileURIs[0]);
                                const signedUrl = await generateSignedUrl(fileKey);
                                const imageUrl = await clarityUpscaler(signedUrl);

                                // Emit the image to the client
                                this.socket.emit(
                                    'image_response',
                                    {
                                        imageUrl: imageUrl,
                                    }
                                );

                                // Update the melody state
                                this.socket.emit('melody_state_update',
                                    {
                                        melodyState: null
                                    }
                                );

                                // Save the image URL to the database
                                await saveMessageToDatabase(chatId, userId, "SYSTEM_FILE", imageUrl);
                                mochiAmount = Math.max(mochiAmount, MochiCost.IMAGE_GEN_CLARITY_UPSCALE);
                            }
                            else if (contentBlock.name === "removeBackground") {

                                // Check if the user has enough mochi balance
                                if (mochiBalance.balance && mochiBalance.balance < MochiCost.IMAGE_GEN_REMOVE_BACKGROUND) {
                                    this.socket.emit(
                                        'error',
                                        {
                                            message: 'INSUFFICIENT_MOCHI_BALANCE'
                                        }
                                    );
                                    return;
                                }

                                // Remove the background
                                const fileKey = extractS3KeyFromUrl(fileURIs[0]);
                                const signedUrl = await generateSignedUrl(fileKey);
                                const imageUrl = await removeBackground(signedUrl);

                                // Emit the image to the client
                                this.socket.emit(
                                    'image_response',
                                    {
                                        imageUrl: imageUrl,
                                    }
                                );

                                // Update the melody state
                                this.socket.emit('melody_state_update',
                                    {
                                        melodyState: null
                                    }
                                );

                                // Save the image URL to the database
                                await saveMessageToDatabase(chatId, userId, "SYSTEM_FILE", imageUrl);
                                mochiAmount = Math.max(mochiAmount, MochiCost.IMAGE_GEN_REMOVE_BACKGROUND);
                            }
                            else if (contentBlock.name === "luma") {

                                // Check if the user has enough mochi balance
                                if (mochiBalance.balance && mochiBalance.balance < MochiCost.VIDEO_GEN_LUMA) {
                                    this.socket.emit(
                                        'error',
                                        {
                                            message: 'INSUFFICIENT_MOCHI_BALANCE'
                                        }
                                    );
                                    return;
                                }

                                // Generate the video
                                const videoUrl = await luma(contentBlock.input.prompt);

                                // Emit the video URL to the client
                                this.socket.emit(
                                    'video_response',
                                    {
                                        videoUrl: videoUrl,
                                    }
                                );

                                // Update the melody state
                                this.socket.emit('melody_state_update',
                                    {
                                        melodyState: null
                                    }
                                );

                                // Save the video URL to the database
                                await saveMessageToDatabase(chatId, userId, "SYSTEM_FILE", videoUrl as string);
                                mochiAmount = Math.max(mochiAmount, MochiCost.VIDEO_GEN_LUMA);
                            }
                            else if (contentBlock.name === "kling") {

                                // Check if the user has enough mochi balance
                                if (mochiBalance.balance && mochiBalance.balance < MochiCost.VIDEO_GEN_KLING) {
                                    this.socket.emit(
                                        'error',
                                        {
                                            message: 'INSUFFICIENT_MOCHI_BALANCE'
                                        }
                                    );
                                    return;
                                }

                                // Generate the video
                                const videoUrl = await kling(contentBlock.input.prompt);

                                // Emit the video URL to the client
                                this.socket.emit(
                                    'video_response',
                                    {
                                        videoUrl: videoUrl,
                                    }
                                );

                                // Update the melody state
                                this.socket.emit('melody_state_update',
                                    {
                                        melodyState: null
                                    }
                                );

                                // Save the video URL to the database
                                await saveMessageToDatabase(chatId, userId, "SYSTEM_FILE", videoUrl as string);
                                mochiAmount = Math.max(mochiAmount, MochiCost.VIDEO_GEN_KLING);
                            }
                            // else if (contentBlock.name === "stableDiffusionLarge") {

                            //     // Check if the user has enough mochi balance
                            //     if (mochiBalance.balance && mochiBalance.balance < MochiCost.IMAGE_GEN_STABLE_DIFFUSION) {
                            //         this.socket.emit(
                            //             'error',
                            //             {
                            //                 message: 'INSUFFICIENT_MOCHI_BALANCE'
                            //             }
                            //         );
                            //         return;
                            //     }

                            //     const imageUrl = await stableDiffusion(contentBlock.input.prompt, contentBlock.input.negative_prompt, contentBlock.input.aspect_ratio, 'jpeg');
                            //     this.socket.emit(
                            //         'image_response',
                            //         {
                            //             imageUrl: imageUrl,
                            //         }
                            //     );
                            //     this.socket.emit('melody_state_update',
                            //         {
                            //             melodyState: null
                            //         }
                            //     );
                            //     await saveMessageToDatabase(chatId, userId, "SYSTEM_FILE", imageUrl);
                            //     mochiAmount = Math.max(mochiAmount, MochiCost.IMAGE_GEN_STABLE_DIFFUSION);
                            // }
                            // else if (contentBlock.name === "fastUpscale") {
                            //     // Check if the user has enough mochi balance
                            //     if (mochiBalance.balance && mochiBalance.balance < MochiCost.IMAGE_GEN_FAST_UPSCALE) {
                            //         this.socket.emit('error', { message: 'Insufficient mochi balance.' });
                            //         return;
                            //     }

                            //     try {
                            //         // Step 1: Extract the S3 key from the file URI
                            //         const s3Key = extractS3KeyFromUrl(fileURIs[0]);

                            //         // Step 2: Fetch the file as Base64
                            //         const base64Data = await fetchFileAsBase64(s3Key);

                            //         // Step 3: Convert Base64 to Binary Buffer
                            //         const binaryBuffer = Buffer.from(base64Data, 'base64');

                            //         // Step 4: Write Binary Buffer to a Temporary File
                            //         const tempDir = os.tmpdir();
                            //         const tempFilePath = path.join(tempDir, `image_${Date.now()}.png`);
                            //         fs.writeFileSync(tempFilePath, binaryBuffer);

                            //         // Step 5: Pass the Temporary File Path to fastUpscale
                            //         const imageUrl = await fastUpscale(tempFilePath);

                            //         // Step 6: Clean Up the Temporary File
                            //         fs.unlinkSync(tempFilePath);

                            //         // Emit and save the upscaled image URL
                            //         this.socket.emit(
                            //             'image_response',
                            //             {
                            //                 imageUrl: imageUrl,
                            //             }
                            //         );
                            //         this.socket.emit('melody_state_update',
                            //             {
                            //                 melodyState: null
                            //             }
                            //         );
                            //         await saveMessageToDatabase(chatId, userId, "SYSTEM_FILE", imageUrl);
                            //         mochiAmount = Math.max(mochiAmount, MochiCost.IMAGE_GEN_FAST_UPSCALE);
                            //     }
                            //     catch (error) {
                            //         console.error('Error during fastUpscale:', error);
                            //         this.socket.emit('error', { message: 'Failed to process image for upscaling.' });
                            //     }
                            // }
                            // else if (contentBlock.name === "removeBackground") {
                            //     try {
                            //         const imageUrl = await removeBackground(fileURIs[0]);

                            //         // Emit and save the upscaled image URL
                            //         this.socket.emit(
                            //             'image_response',
                            //             {
                            //                 imageUrl: imageUrl,
                            //             }
                            //         );
                            //         this.socket.emit('melody_state_update',
                            //             {
                            //                 melodyState: null
                            //             }
                            //         );
                            //         await saveMessageToDatabase(chatId, userId, "SYSTEM_FILE", imageUrl);
                            //     }
                            //     catch (error) {
                            //         console.error('Error during removeBackground:', error);
                            //         this.socket.emit('error', { message: 'Failed to process image for removing background.' });
                            //     }
                            // }
                            // else if (contentBlock.name === "suno") {
                            //     console.log('suno: ', contentBlock.input);
                            //     const musicUrl = await suno(contentBlock.input.prompt);
                            //     this.socket.emit(
                            //         'audio_response',
                            //         {
                            //             audioUrl: musicUrl,
                            //         }
                            //     );
                            //     this.socket.emit('melody_state_update',
                            //         {
                            //             melodyState: null
                            //         }
                            //     );
                            //     await saveMessageToDatabase(chatId, userId, "SYSTEM_FILE", musicUrl as string);
                            // }

                            // Collect tool usage
                            // if (contentBlock.name === "fluxSchnell") {
                            //     toolUsages.push(contentBlock.name);
                            // }

                            // Deduct mochi from user's balance
                            const deductionSuccess = await decreaseMochiBalance(userId, mochiAmount);

                            // Check if the mochi deduction was successful
                            if (!deductionSuccess) {
                                this.socket.emit('error', { message: 'Insufficient mochi balance.' });
                                return;
                            }

                            this.socket.emit(
                                'mochi_balance_update',
                                {
                                    mochiAmount: mochiAmount - 1
                                }
                            );
                        }
                        else {
                            // Deduct mochi from user's balance
                            const deductionSuccess = await decreaseMochiBalance(userId, mochiAmount);

                            // Check if the mochi deduction was successful
                            if (!deductionSuccess) {
                                this.socket.emit('error', { message: 'Insufficient mochi balance.' });
                                return;
                            }

                            this.socket.emit(
                                'mochi_balance_update',
                                {
                                    mochiAmount: 1
                                }
                            );
                        }
                    }
                );

                // END STREAM
                stream.on(
                    'end',
                    async () => {
                        this.socket.emit('llm_response_end');
                    }
                );

                // ERROR STREAM
                stream.on(
                    'error',
                    (err) => {
                        console.error('Stream error:', err);
                        this.socket.emit('error', { message: 'An error occurred during streaming' });
                        this.socket.emit('llm_response_end');
                    }
                );
            }
            catch (error) {
                console.error('Error processing message:', error);
                this.socket.emit('error', 'Invalid message format');
            }
        };

    private handleDisconnect = (): void => {
        console.log(`User disconnected: ${this.socket.id}`);
    }
}