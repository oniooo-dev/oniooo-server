/**
 * Handlers for Chat Interaction
*/

import { saveMessageToDatabase } from "../../utils/messages";
import { AuthSocket } from "./authHandler";

interface ChatMessage {
    chatId: string;
    prompt: string;
}

// Initialize chat handling with user ID
export const handleChatInteration = (socket: AuthSocket) => {

    // Send message to Melody
    socket.on('send_to_melody', async (message: ChatMessage) => {
        const { chatId, prompt } = message;

        if (!chatId || !prompt) {
            socket.emit('error', 'Message content is empty');
            return;
        }

        console.log('User:', prompt);

        try {
            if (!socket.userId) {
                throw new Error('UserID required');
            }

            if (!socket.melody) {
                throw new Error('Melody Instantiation required');
            }

            const response = await socket.melody.generateContent(prompt);
            socket.emit('receive_melody_message', { text: response });

            // Attempt saving the message to Supabase
            console.log('Saving message for user:', socket.userId);
            saveMessageToDatabase(chatId, socket.userId, response);
        } catch (error: any) {
            console.error('Error during message streaming:', error);
            socket.emit('error', error.message);
        }
    });
};

// Handle new chat selection
export const handleChangeChat = (socket: AuthSocket) => {
    socket.on('change_chat', async (chatId: string) => {
        if (!chatId) {
            socket.emit('error', 'Chat ID is missing');
            return;
        }

        try {
            await socket.melody?.startChat(chatId); // Use Melody's ChatManager to switch chat
        } catch (error: any) {
            console.error('Error loading new chat:', error);
            socket.emit('error', error.message);
        }
    })
}

// Handle client disconnection
export const handleDisconnection = (socket: AuthSocket) => {
    socket.on('disconnect', () => {
        console.log(`User with ID ${socket.userId} disconnected`);
    });
};
