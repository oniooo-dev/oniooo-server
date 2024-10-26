/**
 * Melody Module Implementation
*/

import { generativeModel } from "../config/vertex";
import { ChatManager } from "./managers/ChatManager";

export class Melody {
    private chatManager: ChatManager;

    // Constructor
    constructor(userId: string) {
        this.chatManager = new ChatManager(userId);  // Inject ChatManager
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
    async generateContent(prompt: string): Promise<string> {
        try {
            const output = await this.chatManager.sendMessage(prompt);
            return output;  // Text output
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