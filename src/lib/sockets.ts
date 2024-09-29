import { Server as SocketIOServer } from 'socket.io';
import { Server as HttpServer } from 'http';
import dotenv from 'dotenv';

dotenv.config();

const allowedOrigins = [
    'https://oniooo.com',
    'https://www.oniooo.com',
    'http://localhost:3000'
];

// Use environment variable if available, otherwise use the allowedOrigins array
const corsOrigin = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : allowedOrigins;

const createSocketServer = (httpServer: HttpServer) => {
    const io = new SocketIOServer(httpServer, {
        cors: {
            origin: corsOrigin,
            methods: ['GET', 'POST'],
            credentials: true
        },
    });

    return io;
};

export default createSocketServer;