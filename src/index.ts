import cors from 'cors';
import dotenv from 'dotenv';
import express, { Express } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import apiVersion1 from './api/api.routes';
import { errorHandler } from './middleware/handlers';
import { createServer } from 'http';
import { Melody } from './configs/vertex/vertex';
import { getCurrentUser } from './lib/auth';
import { saveMessageToDatabase } from './lib/messages';
import createSocketServer from './lib/sockets';

// Load environment variables
dotenv.config();

const port = process.env.PORT || 8080;

const allowedOrigins = [
    'https://oniooo.com',
    'https://www.oniooo.com',
    'http://localhost:3000'
];

// Use environment variable if available, otherwise use the allowedOrigins array
const corsOrigin = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : allowedOrigins;

const corsOptions: cors.CorsOptions = {
    origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

// Express server
const app: Express = express();
const server = createServer(app);
const io = createSocketServer(server);

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

// Global Error Handling
app.use(errorHandler);

server.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

io.on('connection', (socket) => {
    console.log('Client connected');

    // Initialize Melody and Start Chat
    const melody = new Melody();

    socket.on('start_stream', async (message: { chatId: string, prompt: string }) => {
        // Store the complete message
        let fullMessage = '';

        // Log the user's message
        console.log('User: ', message.prompt);

        try {
            const result = await melody.sendMessageStream(message.prompt);

            for await (const item of result.stream) {
                const dataChunk = item.candidates && item.candidates[0] ? item.candidates[0].content.parts[0] : null;
                console.log('stream chunk: ', dataChunk);
                if (dataChunk) {
                    fullMessage += dataChunk.text; // Append each chunk to the full message
                    socket.emit('receive_stream', dataChunk);
                }
            }

            // After all chunks are received, insert into Supabase
            try {
                const userId = (await getCurrentUser()).user_id;

                // Insert the new message into the database
                console.log('First save attempt');
                saveMessageToDatabase(message.chatId, userId, fullMessage as string);
                socket.emit('receive_stream', "");
            } catch (dbError) {
                console.error('Supabase insertion error:', dbError);
                socket.emit('error', 'Error saving message');
            } finally {
                fullMessage = ''; // Reset for the next message. VERY IMPORTANT
            }

        } catch (error: any) {
            console.error('Error:', error);
            socket.emit('error', error.message);

            try {
                socket.emit('receive_stream', "");

                const userId = (await getCurrentUser()).user_id;
                console.log('Fallback save attempt');

                // Insert the new message into the database
                saveMessageToDatabase(message.chatId, userId, fullMessage);
            } catch (dbError) {
                console.error('Supabase insertion error:', dbError);
                socket.emit('error', 'Error saving message');
            }

            fullMessage = ''; // Reset in case of error. VERY IMPORTANT
        }
    });

    // Handle client disconnection
    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});
