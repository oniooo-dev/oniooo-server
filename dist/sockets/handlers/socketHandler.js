"use strict";
/**
 * Module to Handle Melody Websocket Server
*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupWebSocket = void 0;
const authHandler_1 = require("./authHandler");
const chatHandler_1 = require("./chatHandler");
const setupWebSocket = (io) => {
    // Authenticate users with JWTs
    io.use(authHandler_1.authenticateSocket);
    // Handle connection after successful authentication
    io.on('connect', (socket) => {
        console.log(`User connected with ID: ${socket.userId}`);
        (0, chatHandler_1.handleChatInteration)(socket);
        (0, chatHandler_1.handleChangeChat)(socket);
        (0, chatHandler_1.handleDisconnection)(socket);
    });
};
exports.setupWebSocket = setupWebSocket;
