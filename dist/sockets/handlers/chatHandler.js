"use strict";
/**
 * Handlers for Chat Interaction
*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleDisconnection = exports.handleChangeChat = exports.handleChangeModel = exports.handleChatInteration = void 0;
// Initialize chat handling with user ID
const handleChatInteration = (socket) => {
    // Send message to Melody
    socket.on('send_to_melody', async (message) => {
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
        }
        catch (error) {
            console.error('Error during message streaming:', error);
            socket.emit('error', error.message);
        }
    });
};
exports.handleChatInteration = handleChatInteration;
const handleChangeModel = (socket) => {
    socket.on('change_model', async (modelName) => {
        if (!modelName) {
            socket.emit('error', 'modelName is missing');
            return;
        }
        try {
        }
        catch (error) {
        }
    });
};
exports.handleChangeModel = handleChangeModel;
// Handle new chat selection
const handleChangeChat = (socket) => {
    socket.on('change_chat', async (chatId) => {
        var _a;
        if (!chatId) {
            socket.emit('error', 'Chat ID is missing');
            return;
        }
        try {
            await ((_a = socket.melody) === null || _a === void 0 ? void 0 : _a.startChat(chatId)); // Use Melody's ChatManager to switch chat
        }
        catch (error) {
            console.error('Error loading new chat:', error);
            socket.emit('error', error.message);
        }
    });
};
exports.handleChangeChat = handleChangeChat;
// Handle client disconnection
const handleDisconnection = (socket) => {
    socket.on('disconnect', () => {
        console.log(`User with ID ${socket.userId} disconnected`);
    });
};
exports.handleDisconnection = handleDisconnection;
