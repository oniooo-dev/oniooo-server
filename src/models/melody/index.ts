/**
 * Melody Module Implementation
*/

import { Socket } from "socket.io";
import { generativeModel } from "../../config/vertex";
import { claudeModel } from "../../config/vertex";
import { ChatManager } from "./managers/ChatManager";

export class Melody {
    private chatManager: ChatManager;

    // Constructor
    constructor(userId: string) {
        this.chatManager = new ChatManager(userId, claudeModel);        // Inject ChatManager
    }

    /**
     * Start a new chat session or load an existing one by chat ID.
     * @param chatId - ID of the chat session to load from the database.
    */
    async startChat(chatId: string): Promise<void> {
        try {
            // Use ChatManager to load or create the chat session
            await this.chatManager.loadOrCreateChat(chatId, generativeModel);
            console.log(`Chat session started or switched to chat ID: ${chatId}`);
        } catch (error) {
            console.error('Error in startChat:', error);
            throw error;
        }
    }

    /**
     * Send a message to the current chat session.
     * @param prompt - The message prompt to send.
     * @returns - The response from the model.
     */
    async generateContent(prompt: string, socket: Socket, chatId: string): Promise<void> {
        try {
            // Update on state
            socket.emit('melody_state_update', { state: "TYPING" });

            // Dispatch Request to ChatManager
            await this.chatManager.sendMessage(prompt, socket, chatId);
        } catch (error) {
            console.error('Error in generateContent:', error);
            throw error;
        }
    }

    /**
     * End the current chat session.
     */
    async endChat(): Promise<void> {
        this.chatManager.endChatSession();
    }
}