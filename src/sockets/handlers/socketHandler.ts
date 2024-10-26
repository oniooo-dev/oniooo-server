/**
 * Module to Handle Melody Websocket Server
*/

import { Server } from 'socket.io';
import { authenticateSocket, AuthSocket } from './authHandler';
import { handleChangeChat, handleChatInteration, handleDisconnection } from './chatHandler';

export const setupWebSocket = (io: Server) => {

    // Authenticate users with JWTs
    io.use(authenticateSocket);

    // Handle connection after successful authentication
    io.on('connect', (socket: AuthSocket) => {
        console.log(`User connected with ID: ${socket.userId}`);

        handleChatInteration(socket);
        handleChangeChat(socket);
        handleDisconnection(socket);
    });
};