"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateSocket = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const supabase_1 = require("../../config/supabase");
const melody_1 = require("../../models/melody");
// Middleware for Authentication (no changes here)
const authenticateSocket = async (socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token)
        return next(new Error('Authentication error: No token provided'));
    const secret = process.env.SUPABASE_JWT_SECRET;
    if (!secret)
        return next(new Error('Server configuration error'));
    try {
        const decoded = jsonwebtoken_1.default.verify(token, secret);
        const { data: session, error: sessionError } = await supabase_1.supabase.auth.getUser(token);
        if (sessionError || !session)
            return next(new Error('Authentication error: Invalid token'));
        socket.userId = session.user.id;
        socket.melody = new melody_1.Melody(socket.userId);
        console.log(`User authenticated with ID: ${socket.userId}`);
        next();
    }
    catch (err) {
        next(new Error('Authentication error: JWT verification failed'));
    }
};
exports.authenticateSocket = authenticateSocket;
