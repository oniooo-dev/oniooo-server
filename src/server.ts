import cors from 'cors';
import dotenv from 'dotenv';
import express, { Express } from 'express';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import helmet from 'helmet';
import morgan from 'morgan';
import apiVersion1 from './api/api.routes';
import { errorHandler } from './middleware/handlers';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { generativeModel } from './configs/vertex';

// Load environment variables
dotenv.config();

const port = process.env.PORT || 8080;
const sessionSecretKey = process.env.SESSION_SECRET || 'SOME_SECRET_KEY';
const cookieSecretKey = process.env.COOKIE_SECRET || 'SOME_SECRET_KEY';

const corsOptions = {
    origin: 'http://localhost:3000', // Ensure this matches the frontend URL exactly
    credentials: true, // To allow cookies to be sent and received
    methods: ['GET', 'POST', 'OPTIONS'], // Ensure all needed methods are allowed
};

// Express server
const app: Express = express();
const server = createServer(app);
const io = new SocketIOServer(server, {
    cors: {
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST'],
    },
});

// CORS
app.use(cors(corsOptions));

// Allow preflight requests
app.options('*', cors(corsOptions));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Security Stuff
app.use(helmet());
app.use(morgan('dev'));

// Routes
app.use('/api/v1/', apiVersion1);

// Session Store
app.use(
    session({
        secret: sessionSecretKey,
        saveUninitialized: false, // Don't save uninitialized sessions (users that aren't doing anything)
        resave: false, // Don't save the session if it hasn't changed
        cookie: {
            secure: process.env.NODE_ENV === 'production', // Only send cookies over HTTPS in production
            httpOnly: true, // Don't let JS code access cookies
            maxAge: 24 * 60 * 60 * 1000, // 24 hours (let the user stay logged-in for 24 hours)
        },
    }),
);

// Cookie Parser
// app.use(cookieParser(cookieSecretKey));

// Global Error Handling
app.use(errorHandler);

server.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

// Handle Unauthenticated Users
io.on('connection', (socket) => {
    console.log('Unauthenticated Client connected');

    // Instantiate a chat session
    const chat = generativeModel.startChat();

    // Handle client request to start stream
    socket.on('start_stream', async (prompt: string) => {
        console.log('Received prompt', prompt);

        try {
            // Send a message and receive a stream
            const result = await chat.sendMessageStream(prompt);

            // Process the stream
            for await (const item of result.stream) {
                const dataChunk = item.candidates && item.candidates[0]?.content.parts[0];
                console.log('stream chunk: ', dataChunk);
                socket.emit('receive_stream', dataChunk);
            }
        } catch (error: any) {
            console.error('Error:', error);
            socket.emit('error', error.message);
        }
    });

    // Handle client disconnection
    socket.on('disconnect', () => {
        console.log('Unauthenticated Client disconnected');
    });
});
