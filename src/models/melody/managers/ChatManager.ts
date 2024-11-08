/**
 * ChatManager Module
*/

import { Content, FileDataPart, GenerateContentRequest, GenerativeModel, TextPart } from '@google-cloud/vertexai';
import { loadMessagesFromDatabase, saveMelodyFileToDatabase, saveMessageToDatabase } from '../../../utils/messages';
import { AnthropicVertex } from '@anthropic-ai/vertex-sdk';
import { functionDeclarations } from '../../../config/vertex/geminiConfig';
import { fluxPro, fluxSchnell } from '../../../config/minions/fal';
import { AuthSocket } from '../../../sockets/handlers/authHandler';
import { luma, suno } from '../../../config/minions/piapi';
import { convertToGsUri, getMimeType } from '../../../utils/utils';
import { generativeModel } from '../../../config/vertex/geminiSingleton';

interface MessageParam {
    content: string;
    role: 'user' | 'assistant';
}

type ModelContent = Content[] | MessageParam[];

export class ChatManager {
    private userId: string;
    private chat: ModelContent | null;
    private modelInstance: ModelInstance;

    // Constructor
    constructor(userId: string, modelInstance: ModelInstance) {
        this.userId = userId;
        this.modelInstance = modelInstance;
        this.chat = null;
    }

    // Format text messages to the Vertex AI model format (Gemini)
    private formatMessages(messages: MelodyMessage[]): ModelContent {
        if (this.modelInstance instanceof GenerativeModel) {
            return messages.map(message => ({
                parts: [{ text: message.content }],
                role: message.type === 'USER_TEXT' ? 'user' : 'assistant',
            })) as Content[];
        } else if (this.modelInstance instanceof AnthropicVertex) {
            return messages.map(message => ({
                content: message.content,
                role: message.type === 'USER_TEXT' ? 'user' : 'assistant',
            })) as MessageParam[];
        } else {
            throw new Error("Use Claude or Flash");
        }
    }

    /**
     * Load chat messages from the database, format them.
     * @param chatId - The ID of the chat session to load.
     * @param modelInstance - The Vertex AI generative model instance.
     */
    async loadOrCreateChat(chatId: string, modelInstance: ModelInstance): Promise<void> {

        this.modelInstance = modelInstance;

        // Handle existing chat
        // Load the chat messages
        console.log(`Loading chat session with ID: ${chatId}`);
        const messages = await loadMessagesFromDatabase(this.userId, chatId);
        this.chat = this.formatMessages(messages);
    }

    /**
     * Send a text message to the chat session and get a response.
     * @param prompt - The message prompt to send.
     * @returns - The response from the chat.
     */
    async sendMessage(prompt: string, socket: AuthSocket, chatId: string, fileUris: string[]): Promise<void> {

        // No chat
        if (!this.chat) {
            await this.loadOrCreateChat(chatId, generativeModel);
        }

        if (!socket.userId) {
            throw new Error('UserID required');
        }

        if (!this.modelInstance) {
            throw new Error('No Model Available.');
        }

        if (this.modelInstance instanceof GenerativeModel) {
            try {
                const requestFileParts = (fileUris || []).map(uri => ({
                    fileUri: convertToGsUri(uri),  // Convert each URI
                    mimeType: getMimeType(uri)    // Get the MIME type for each URI
                }))
                    .filter(item => item.fileUri !== null)  // Filter out null URIs
                    .map(item => ({
                        fileData: {
                            fileUri: item.fileUri as string,  // TypeScript now knows item.fileUri is not null
                            mimeType: item.mimeType
                        }
                    }));

                const requestTextPart: TextPart | null = prompt ? { text: prompt } : null;

                // Build the parts array dynamically based on the existence of text or file data
                const parts: (TextPart | FileDataPart)[] = [];

                if (requestTextPart) {
                    parts.push(requestTextPart);
                }

                if (requestFileParts.length > 0) {
                    parts.push(...requestFileParts);
                }

                // Ensure that there is at least one part (text or file)
                if (parts.length === 0) {
                    throw new Error("At least one of text or file must be provided.");
                }

                // Append new user message to chat
                const newContent: Content = {
                    parts: parts,
                    role: "user"
                }

                const contentArray: Content[] = [...this.chat as Content[], newContent];

                this.chat = contentArray;   // Update local state of chat

                const newGenerateContentRequest: GenerateContentRequest = {
                    contents: contentArray,
                    tools: functionDeclarations
                }

                // Get the output from Gemini
                const modelResponse = await this.modelInstance.generateContent(newGenerateContentRequest);

                console.log(JSON.stringify(modelResponse));

                // Ensure the response and candidates are defined before accessing further properties
                if (
                    !modelResponse.response ||
                    !modelResponse.response.candidates ||
                    modelResponse.response.candidates.length === 0 ||
                    !modelResponse.response.candidates[0].content ||
                    !modelResponse.response.candidates[0].content.parts ||
                    modelResponse.response.candidates[0].content.parts.length === 0
                ) {
                    throw new Error('Gemini Error: Missing candidates or content in response.');
                }

                let textPart;
                let functionCallPart;
                let functionResponsePart;

                // Handle each part of the model response
                for (var part of modelResponse.response.candidates[0].content.parts) {

                    // Select Part type
                    if (part.text) {
                        console.log("Found text part: " + part.text);
                        textPart = part.text;

                        // Send the text part to the frontend
                        socket.emit('receive_melody_message', { text: textPart });

                        // Attempt saving the message to Supabase
                        console.log('Saving message for user:', socket.userId);
                        saveMessageToDatabase(chatId, socket.userId, textPart);
                    }
                    else if (part.functionCall) {

                        // Log the function call part
                        console.log("Found function call: " + part.functionCall);
                        functionCallPart = part.functionCall;

                        // Extract the data
                        const functionCallName = part.functionCall.name;

                        /* Refactor later */
                        if (functionCallName === "fluxPro") {

                            const functionCallArgs = part.functionCall.args;

                            console.log("CALLLLLLLLING FLUX PRO .......");

                            let imgUris;

                            // Update on state
                            socket.emit('melody_state_update', { state: "GENERATING_IMAGE" });

                            if ('prompt' in functionCallArgs && typeof functionCallArgs.prompt === 'string') {
                                const result: any = await fluxPro(functionCallArgs.prompt);

                                imgUris = await result.data.images;

                                console.log(await imgUris);

                                // Send and save each images
                                for (const imgUri of await imgUris) {
                                    // Send the text part to the frontend
                                    socket.emit('receive_melody_message', { fileUri: imgUri.url });

                                    // Attempt saving the message to Supabase
                                    console.log('Saving file message for user:', socket.userId);
                                    saveMelodyFileToDatabase(chatId, socket.userId, imgUri.url);
                                }
                            } else {
                                console.error('Prompt is not available or not a string');
                            }
                        }
                        else if (functionCallName === "fluxSchnell") {

                            // Extract function call arguments
                            const functionCallArgs = part.functionCall.args;

                            console.log("CALLLLLLLLING FLUX SCHNELL .......");

                            let imgUris;

                            // Update on state
                            socket.emit('melody_state_update', { state: "GENERATING_IMAGE" });

                            if (
                                'prompt' in functionCallArgs && typeof functionCallArgs.prompt === 'string' &&
                                'num_images' in functionCallArgs && typeof functionCallArgs.num_images === 'number'
                            ) {
                                const result: any = await fluxSchnell(functionCallArgs.prompt, functionCallArgs.num_images);

                                imgUris = await result.data.images;

                                console.log(await imgUris);

                                // Send and save each images
                                for (const imgUri of await imgUris) {
                                    // Send the text part to the frontend
                                    socket.emit('receive_melody_message', { fileUri: imgUri.url });

                                    // Attempt saving the message to Supabase
                                    console.log('Saving file message for user:', socket.userId);
                                    saveMelodyFileToDatabase(chatId, socket.userId, imgUri.url);
                                }
                            } else {
                                console.error('Prompt is not available or not a string');
                            }
                        }
                        else if (functionCallName === "luma") {

                            // Extract function call arguments
                            const functionCallArgs = part.functionCall.args;

                            console.log("CALLLLLLLLING LUMA .......");

                            let videoUri;

                            // Update on state
                            socket.emit('melody_state_update', { state: "GENERATING_VIDEO" });

                            if (
                                'prompt' in functionCallArgs && typeof functionCallArgs.prompt === 'string'
                            ) {
                                const result: any = await luma(functionCallArgs.prompt);

                                videoUri = await result;

                                console.log(await videoUri);
                            } else {
                                console.error('Prompt is not available or not a string');
                            }
                        }
                        else if (functionCallName === "suno") {

                            // Extract function call arguments
                            const functionCallArgs = part.functionCall.args;

                            console.log("CALLLLLLLLING SUNO .......");

                            let videoUri;

                            // Update on state
                            socket.emit('melody_state_update', { state: "GENERATING_MUSIC" });

                            if (
                                'prompt' in functionCallArgs && typeof functionCallArgs.prompt === 'string'
                            ) {
                                const result: any = await suno(functionCallArgs.prompt);

                                videoUri = await result;

                                console.log(await videoUri);
                            } else {
                                console.error('Prompt is not available or not a string');
                            }
                        }

                        // Do a follow-up of the function response
                        // ...

                    }
                    else if (part.functionResponse) {
                        console.log("Found function response: " + part.functionResponse);
                        functionResponsePart = part.functionResponse;
                    }
                }
            } catch (error) {
                console.error('Error in sendMessage:', error); // Log the error for debugging
                throw new Error('Failed to get response from Gemini LLM.'); // Throw a more general error for the caller
            }
        } else if (this.modelInstance instanceof AnthropicVertex) {

            /* Using Claude */
            try {
                // Append new user message to chat
                const newContent: MessageParam = {
                    content: prompt,
                    role: "user"
                }

                const contentArray: MessageParam[] = [...this.chat as MessageParam[], newContent];

                this.chat = contentArray;   // Update local state of chat

                const result = await this.modelInstance.messages.create({
                    model: 'claude-3-5-sonnet-v2@20241022', // Use Claude Sonnet 3.5
                    max_tokens: 4096,
                    messages: contentArray
                })

                if (result.content[0].type !== "text") {
                    throw new Error("Claude doesn't want to talk with you.");
                }

                const textPart = result.content[0].text;

                // Send the text part to the frontend
                socket.emit('receive_melody_message', { text: textPart });

                // Attempt saving the message to Supabase
                console.log('Saving message for user:', socket.userId);
                saveMessageToDatabase(chatId, socket.userId, textPart);
            } catch (error) {
                console.error('Error in sendMessage:', error);
                throw new Error('Failed to get response from Claude.');
            }
        } else {
            // ...
            throw new Error("Invalid Model");
        }
    }

    /**
     * End the current chat session
     */
    endChatSession(): void {
        if (!this.chat) {
            console.warn('No active chat session to end.');
            return;
        }

        console.log('Ending the chat session...');
        this.chat = null;  // Reset chat session
    }
}

const response = {
    "response": {
        "candidates": [{
            "content": {
                "role": "model",
                "parts": [
                    {
                        "text": "Okay, a red ball!  Let's see if I can get `fluxPro` to make that for us.  I'll try using the prompt \"a red ball\".\n\n\n"
                    },
                    {
                        "functionCall": { "name": "fluxPro", "args": { "prompt": "a red ball" } }
                    }
                ]
            }, "finishReason": "STOP", "avgLogprobs": -0.14947804345024956, "index": 0
        }],
        "usageMetadata": {
            "promptTokenCount": 369, "candidatesTokenCount": 45, "totalTokenCount": 414
        },
        "modelVersion": "gemini-1.5-flash-002"
    }
}

const flux = {
    images: [
        {
            url: 'https://fal.media/files/kangaroo/GoSPqE1jXgRNi4PyFFbHH_e7772b13e5b0485e83fb64d7a9b7209e.jpg',
            width: 1024,
            height: 768,
            content_type: 'image/jpeg'
        }
    ],
    timings: {},
    seed: 1413980907,
    has_nsfw_concepts: [false],
    prompt: 'A bright red bouncy ball'
}