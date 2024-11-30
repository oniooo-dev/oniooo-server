
/**
 * Mostly just WebSockets Utility Functions
*/

import { AuthSocket } from "./types";
import { llmService } from "../llmServiceSingleton";
import { appendChunkToMessage, createChatInDatabase, createMessagePlaceholder, loadMessagesForLLMFromDatabase, saveMessageToDatabase, extractS3KeyFromUrl, fetchFileAsBase64 } from "../../utils/messages";
import { inspect } from "util";
import { fluxPro, fluxSchnell } from "../../config/minions/fal";
import { kling, luma, suno } from "../../config/minions/piapi";
import { fastUpscale, removeBackground, stableDiffusion } from "../../config/minions/stability";
import fs from 'fs';
import path from 'path';
import os from 'os';

function base64ToBinaryString(base64String: string): string {

    // Create a Buffer from the base64 string
    const buffer = Buffer.from(base64String, 'base64');

    // Convert the Buffer to a binary string
    const binaryString = buffer.toString('binary');

    return binaryString;
}

export class ChatHandler {
    socket: AuthSocket;
    chunkId: number = 0;    // Incrementing ID for each chunk

    constructor(socket: AuthSocket) {
        this.socket = socket;
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

                // Database operations for message persistence
                if (userTextQuery) {
                    await saveMessageToDatabase(chatId, userId, "USER_TEXT", userTextQuery);
                }

                const messageId = await createMessagePlaceholder(chatId, userId, 'SYSTEM_TEXT');
                const previousChatMessages = await loadMessagesForLLMFromDatabase(userId, chatId);

                // Start streaming the response from the LLM
                const stream = llmService.stream(userTextQuery, previousChatMessages, fileURIs);

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
                            }
                            else if (contentBlock.name === "fluxSchnell") {
                                const images = await fluxSchnell(contentBlock.input.prompt, contentBlock.input.num_images);
                                for (const image of images) {
                                    this.socket.emit(
                                        'image_response',
                                        {
                                            imageUrl: image.url,
                                        }
                                    );
                                    this.socket.emit('melody_state_update',
                                        {
                                            melodyState: null
                                        }
                                    );
                                    await saveMessageToDatabase(chatId, userId, "SYSTEM_FILE", image.url);
                                }
                            }
                            else if (contentBlock.name === "stableDiffusionLarge") {
                                console.log('stableDiffusionLarge: ', contentBlock.input);
                                const imageUrl = await stableDiffusion(contentBlock.input.prompt, contentBlock.input.negative_prompt, contentBlock.input.aspect_ratio, 'jpeg');
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
                            }
                            else if (contentBlock.name === "fastUpscale") {
                                try {
                                    // Step 1: Extract the S3 key from the file URI
                                    const s3Key = extractS3KeyFromUrl(fileURIs[0]);

                                    // Step 2: Fetch the file as Base64
                                    const base64Data = await fetchFileAsBase64(s3Key);

                                    // Step 3: Convert Base64 to Binary Buffer
                                    const binaryBuffer = Buffer.from(base64Data, 'base64');

                                    // Step 4: Write Binary Buffer to a Temporary File
                                    const tempDir = os.tmpdir();
                                    const tempFilePath = path.join(tempDir, `image_${Date.now()}.png`);
                                    fs.writeFileSync(tempFilePath, binaryBuffer);

                                    // Step 5: Pass the Temporary File Path to fastUpscale
                                    const imageUrl = await fastUpscale(tempFilePath);

                                    // Step 6: Clean Up the Temporary File
                                    fs.unlinkSync(tempFilePath);

                                    // Emit and save the upscaled image URL
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
                                }
                                catch (error) {
                                    console.error('Error during fastUpscale:', error);
                                    this.socket.emit('error', { message: 'Failed to process image for upscaling.' });
                                }
                            }
                            else if (contentBlock.name === "removeBackground") {
                                try {
                                    const imageUrl = await removeBackground(fileURIs[0]);

                                    // Emit and save the upscaled image URL
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
                                }
                                catch (error) {
                                    console.error('Error during removeBackground:', error);
                                    this.socket.emit('error', { message: 'Failed to process image for removing background.' });
                                }
                            }
                            else if (contentBlock.name === "luma") {
                                console.log('luma: ', contentBlock.input);
                                const videoUrl = await luma(contentBlock.input.prompt);
                                this.socket.emit(
                                    'video_response',
                                    {
                                        videoUrl: videoUrl,
                                    }
                                );
                                this.socket.emit('melody_state_update',
                                    {
                                        melodyState: null
                                    }
                                );
                                await saveMessageToDatabase(chatId, userId, "SYSTEM_FILE", videoUrl as string);
                            }
                            else if (contentBlock.name === "suno") {
                                console.log('suno: ', contentBlock.input);
                                const musicUrl = await suno(contentBlock.input.prompt);
                                this.socket.emit(
                                    'audio_response',
                                    {
                                        audioUrl: musicUrl,
                                    }
                                );
                                this.socket.emit('melody_state_update',
                                    {
                                        melodyState: null
                                    }
                                );
                                await saveMessageToDatabase(chatId, userId, "SYSTEM_FILE", musicUrl as string);
                            }
                            else if (contentBlock.name === "kling") {
                                console.log('kling: ', contentBlock.input);
                                const videoUrl = await kling(contentBlock.input.prompt);
                                this.socket.emit(
                                    'video_response',
                                    {
                                        videoUrl: videoUrl,
                                    }
                                );
                                this.socket.emit('melody_state_update',
                                    {
                                        melodyState: null
                                    }
                                );
                                await saveMessageToDatabase(chatId, userId, "SYSTEM_FILE", videoUrl as string);
                            }
                        }
                    }
                );

                // END STREAM
                stream.on(
                    'end',
                    () => {
                        console.log('Stream ended successfully');
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

    private handleDisconnect =
        (): void => {
            console.log(`User disconnected: ${this.socket.id}`);
        }
}