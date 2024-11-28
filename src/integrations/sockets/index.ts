
/**
 * Module to Handle Melody Websocket Server
*/

import { Server } from 'socket.io';
import { supabase } from '../../config/supabase';
import { ChatHandler } from './ChatHandler';
import { AuthSocket } from './types';

// Middleware for Authentication
export const authenticateSocket = async (socket: AuthSocket, next: (err?: Error) => void) => {

    // Get the token from the socket handshake
    const token = socket.handshake.auth.token;

    if (!token) {
        return next(new Error('Authentication error: No token provided'));
    }

    // Get the JWT secret from the environment variables
    const secret = process.env.SUPABASE_JWT_SECRET;

    if (!secret) {
        return next(new Error('Server configuration error'));
    }

    try {

        // Get the user session from the token
        const { data: session, error: sessionError } = await supabase.auth.getUser(token);

        if (sessionError || !session) {
            return next(new Error('Authentication error: Invalid token'));
        }

        socket.userId = session.user.id;
        console.log(`User authenticated with ID: ${socket.userId}`);
        next();
    }
    catch (err) {
        next(new Error('Authentication error: JWT verification failed'));
    }
};


// Setup the WebSocket Server
export const setupWebSocket = (io: Server) => {

    // Authenticate users with JWTs
    io.use(authenticateSocket);

    // Handle connection after successful authentication
    io.on('connect', (socket: AuthSocket) => {
        console.log(`User connected with ID: ${socket.userId}`);

        new ChatHandler(socket);
    });
};