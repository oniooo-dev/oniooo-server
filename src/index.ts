import cors from 'cors';
import dotenv from 'dotenv';
import express, { Express, NextFunction, Request, Response } from 'express';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import helmet from 'helmet';
import morgan from 'morgan';
import apiVersion1 from './api/api.routes';
import { errorHandler } from './middleware/handlers';

// Load environment variables
dotenv.config();

const port = process.env.PORT || 8080;
const sessionSecretKey = process.env.SESSION_SECRET || 'SOME_SECRET_KEY';
const cookieSecretKey = process.env.COOKIE_SECRET || 'SOME_SECRET_KEY';

// Express server
const app: Express = express();

// Session Store
app.use(
    session({
        secret: sessionSecretKey,
        saveUninitialized: false, // Don't save uninitialized sessions (users that aren't doing anything)
        resave: false, // Don't save the session if it hasn't changed
        cookie: {
            secure: process.env.NODE_ENV === 'production',
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000, // 24 hours
        },
    }),
);

// CORS
app.use(
    cors({
        origin: 'http://localhost:3000', // Allow only this client-side origin
        credentials: true, // Allow credentials (cookies, authorization headers, etc.)
    }),
);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(cookieSecretKey));

// Security Stuff
app.use(helmet());
app.use(morgan('dev'));

// Routes
app.use('/api/v1/', apiVersion1);

// Global Error Handling
app.use(errorHandler);

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
