/**
 * Handlers for Chat Interaction
*/

import { AuthSocket } from "./authHandler";

interface ChatMessage {
    chatId: string;
    prompt: string;
    fileUris: string[];
}

// Initialize chat handling with user ID
export const handleChatInteration = (socket: AuthSocket) => {

    // Send message to Melody
    socket.on('send_to_melody', async (message: ChatMessage) => {
        const { chatId, prompt, fileUris } = message;

        // ...
        if (!chatId || (!prompt && !fileUris)) {
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

            // Request to Melody
            await socket.melody.generateContent(prompt, socket, chatId, fileUris);
        } catch (error: any) {
            console.error('Error during message streaming:', error);
            socket.emit('error', error.message);
        }
    });
};

export const handleChangeModel = (socket: AuthSocket) => {
    socket.on('change_model', async (modelName: string) => {
        if (!modelName) {
            socket.emit('error', 'modelName is missing');
            return;
        }

        try {

        } catch (error) {

        }
    })
}

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
