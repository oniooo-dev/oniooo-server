import { Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { supabase } from '../../config/supabase';
import { Melody } from '../../models/melody';

// Extend the Socket type to include a custom userId property
export interface AuthSocket extends Socket {
    userId?: string;    // Adding the userId property here
    melody?: Melody;    // Attach Melody for each individual users
}

// Middleware for Authentication (no changes here)
export const authenticateSocket = async (socket: AuthSocket, next: (err?: Error) => void) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Authentication error: No token provided'));

    const secret = process.env.SUPABASE_JWT_SECRET;
    if (!secret) return next(new Error('Server configuration error'));

    try {
        const decoded = jwt.verify(token, secret) as jwt.JwtPayload;
        const { data: session, error: sessionError } = await supabase.auth.getUser(token);

        if (sessionError || !session) return next(new Error('Authentication error: Invalid token'));

        socket.userId = session.user.id;
        socket.melody = new Melody(socket.userId);
        console.log(`User authenticated with ID: ${socket.userId}`);
        next();
    } catch (err) {
        next(new Error('Authentication error: JWT verification failed'));
    }
};