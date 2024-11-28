"use strict";
/**
 * ChatManager Module
*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatManager = void 0;
const vertexai_1 = require("@google-cloud/vertexai");
const messages_1 = require("../../../utils/messages");
const vertex_sdk_1 = require("@anthropic-ai/vertex-sdk");
const geminiConfig_1 = require("../../../config/vertex/geminiConfig");
const fal_1 = require("../../../config/minions/fal");
const piapi_1 = require("../../../config/minions/piapi");
const utils_1 = require("../../../utils/utils");
const geminiSingleton_1 = require("../../../config/vertex/geminiSingleton");
class ChatManager {
    // Constructor
    constructor(userId, modelInstance) {
        this.userId = userId;
        this.modelInstance = modelInstance;
        this.chat = null;
    }
    // Format text messages to the Vertex AI model format (Gemini)
    formatMessages(messages) {
        if (this.modelInstance instanceof vertexai_1.GenerativeModel) {
            return messages.map(message => ({
                parts: [{ text: message.content }],
                role: message.type === 'USER_TEXT' ? 'user' : 'assistant',
            }));
        }
        else if (this.modelInstance instanceof vertex_sdk_1.AnthropicVertex) {
            return messages.map(message => ({
                content: message.content,
                role: message.type === 'USER_TEXT' ? 'user' : 'assistant',
            }));
        }
        else {
            throw new Error("Use Claude or Flash");
        }
    }
    /**
     * Load chat messages from the database, format them.
     * @param chatId - The ID of the chat session to load.
     * @param modelInstance - The Vertex AI generative model instance.
     */
    async loadOrCreateChat(chatId, modelInstance) {
        this.modelInstance = modelInstance;
        // Handle existing chat
        // Load the chat messages
        console.log(`Loading chat session with ID: ${chatId}`);
        const messages = await (0, messages_1.loadMessagesFromDatabase)(this.userId, chatId);
        this.chat = this.formatMessages(messages);
    }
    /**
     * Send a text message to the chat session and get a response.
     * @param prompt - The message prompt to send.
     * @returns - The response from the chat.
     */
    async sendMessage(prompt, socket, chatId, fileUris) {
        // No chat
        if (!this.chat) {
            await this.loadOrCreateChat(chatId, geminiSingleton_1.generativeModel);
        }
        if (!socket.userId) {
            throw new Error('UserID required');
        }
        if (!this.modelInstance) {
            throw new Error('No Model Available.');
        }
        if (this.modelInstance instanceof vertexai_1.GenerativeModel) {
            try {
                const requestFileParts = (fileUris || []).map(uri => ({
                    fileUri: (0, utils_1.convertToGsUri)(uri), // Convert each URI
                    mimeType: (0, utils_1.getMimeType)(uri) // Get the MIME type for each URI
                }))
                    .filter(item => item.fileUri !== null) // Filter out null URIs
                    .map(item => ({
                    fileData: {
                        fileUri: item.fileUri, // TypeScript now knows item.fileUri is not null
                        mimeType: item.mimeType
                    }
                }));
                const requestTextPart = prompt ? { text: prompt } : null;
                // Build the parts array dynamically based on the existence of text or file data
                const parts = [];
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
                const newContent = {
                    parts: parts,
                    role: "user"
                };
                const contentArray = [...this.chat, newContent];
                this.chat = contentArray; // Update local state of chat
                const newGenerateContentRequest = {
                    contents: contentArray,
                    tools: geminiConfig_1.functionDeclarations
                };
                // Get the output from Gemini
                const modelResponse = await this.modelInstance.generateContent(newGenerateContentRequest);
                console.log(JSON.stringify(modelResponse));
                // Ensure the response and candidates are defined before accessing further properties
                if (!modelResponse.response ||
                    !modelResponse.response.candidates ||
                    modelResponse.response.candidates.length === 0 ||
                    !modelResponse.response.candidates[0].content ||
                    !modelResponse.response.candidates[0].content.parts ||
                    modelResponse.response.candidates[0].content.parts.length === 0) {
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
                        (0, messages_1.saveMessageToDatabase)(chatId, socket.userId, textPart);
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
                                const result = await (0, fal_1.fluxPro)(functionCallArgs.prompt);
                                imgUris = await result.data.images;
                                console.log(await imgUris);
                                // Send and save each images
                                for (const imgUri of await imgUris) {
                                    // Send the text part to the frontend
                                    socket.emit('receive_melody_message', { fileUri: imgUri.url });
                                    // Attempt saving the message to Supabase
                                    console.log('Saving file message for user:', socket.userId);
                                    (0, messages_1.saveMelodyFileToDatabase)(chatId, socket.userId, imgUri.url);
                                }
                            }
                            else {
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
                            if ('prompt' in functionCallArgs && typeof functionCallArgs.prompt === 'string' &&
                                'num_images' in functionCallArgs && typeof functionCallArgs.num_images === 'number') {
                                const result = await (0, fal_1.fluxSchnell)(functionCallArgs.prompt, functionCallArgs.num_images);
                                imgUris = await result.data.images;
                                console.log(await imgUris);
                                // Send and save each images
                                for (const imgUri of await imgUris) {
                                    // Send the text part to the frontend
                                    socket.emit('receive_melody_message', { fileUri: imgUri.url });
                                    // Attempt saving the message to Supabase
                                    console.log('Saving file message for user:', socket.userId);
                                    (0, messages_1.saveMelodyFileToDatabase)(chatId, socket.userId, imgUri.url);
                                }
                            }
                            else {
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
                            if ('prompt' in functionCallArgs && typeof functionCallArgs.prompt === 'string') {
                                const result = await (0, piapi_1.luma)(functionCallArgs.prompt);
                                videoUri = await result;
                                console.log(await videoUri);
                                // Send the text part to the frontend
                                socket.emit('receive_melody_message', { fileUri: videoUri });
                                // Attempt saving the message to Supabase
                                console.log('Saving file message for user:', socket.userId);
                                (0, messages_1.saveMelodyFileToDatabase)(chatId, socket.userId, videoUri);
                            }
                            else {
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
                            if ('prompt' in functionCallArgs && typeof functionCallArgs.prompt === 'string') {
                                const result = await (0, piapi_1.suno)(functionCallArgs.prompt);
                                videoUri = await result;
                                console.log(await videoUri);
                                // Send the text part to the frontend
                                socket.emit('receive_melody_message', { fileUri: videoUri });
                                // Attempt saving the message to Supabase
                                console.log('Saving file message for user:', socket.userId);
                                (0, messages_1.saveMelodyFileToDatabase)(chatId, socket.userId, videoUri);
                            }
                            else {
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
            }
            catch (error) {
                console.error('Error in sendMessage:', error); // Log the error for debugging
                throw new Error('Failed to get response from Gemini LLM.'); // Throw a more general error for the caller
            }
        }
        else if (this.modelInstance instanceof vertex_sdk_1.AnthropicVertex) {
            /* Using Claude */
            try {
                // Append new user message to chat
                const newContent = {
                    content: prompt,
                    role: "user"
                };
                const contentArray = [...this.chat, newContent];
                this.chat = contentArray; // Update local state of chat
                const result = await this.modelInstance.messages.create({
                    model: 'claude-3-5-sonnet-v2@20241022', // Use Claude Sonnet 3.5
                    max_tokens: 4096,
                    messages: contentArray
                });
                if (result.content[0].type !== "text") {
                    throw new Error("Claude doesn't want to talk with you.");
                }
                const textPart = result.content[0].text;
                // Send the text part to the frontend
                socket.emit('receive_melody_message', { text: textPart });
                // Attempt saving the message to Supabase
                console.log('Saving message for user:', socket.userId);
                (0, messages_1.saveMessageToDatabase)(chatId, socket.userId, textPart);
            }
            catch (error) {
                console.error('Error in sendMessage:', error);
                throw new Error('Failed to get response from Claude.');
            }
        }
        else {
            // ...
            throw new Error("Invalid Model");
        }
    }
    /**
     * End the current chat session
     */
    endChatSession() {
        if (!this.chat) {
            console.warn('No active chat session to end.');
            return;
        }
        console.log('Ending the chat session...');
        this.chat = null; // Reset chat session
    }
}
exports.ChatManager = ChatManager;
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
};
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
};
