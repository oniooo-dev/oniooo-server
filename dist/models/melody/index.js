"use strict";
/**
 * Melody Module Implementation
*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.Melody = void 0;
const vertex_1 = require("../../config/vertex");
const vertex_2 = require("../../config/vertex");
const ChatManager_1 = require("./managers/ChatManager");
class Melody {
    // Constructor
    constructor(userId) {
        this.chatManager = new ChatManager_1.ChatManager(userId, vertex_2.claudeModel); // Inject ChatManager
    }
    /**
     * Start a new chat session or load an existing one by chat ID.
     * @param chatId - ID of the chat session to load from the database.
    */
    async startChat(chatId) {
        try {
            // Use ChatManager to load or create the chat session
            await this.chatManager.loadOrCreateChat(chatId, vertex_1.generativeModel);
            console.log(`Chat session started or switched to chat ID: ${chatId}`);
        }
        catch (error) {
            console.error('Error in startChat:', error);
            throw error;
        }
    }
    /**
     * Send a message to the current chat session.
     * @param prompt - The message prompt to send.
     * @returns - The response from the model.
     */
    async generateContent(prompt, socket, chatId, fileUris) {
        try {
            // Update on state
            socket.emit('melody_state_update', { state: "TYPING" });
            // Dispatch Request to ChatManager
            await this.chatManager.sendMessage(prompt, socket, chatId, fileUris);
        }
        catch (error) {
            console.error('Error in generateContent:', error);
            throw error;
        }
    }
    /**
     * End the current chat session.
     */
    async endChat() {
        this.chatManager.endChatSession();
    }
}
exports.Melody = Melody;
