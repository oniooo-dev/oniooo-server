/**
 * 
 * Centralize environment and configuation settings
 * 
*/

import dotenv from 'dotenv';
import { CorsOptions } from 'cors';

dotenv.config();

export const port = process.env.PORT || 8080;
export const jwtSecret = process.env.JWT_SECRET || ''

export const corsOptions: CorsOptions = {
    origin: function (origin, callback) {
        const allowedOrigins = [
            'https://oniooo.com',
            'https://www.oniooo.com',
            'http://localhost:3000',
            'https://api.oniooo.com',
        ];
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};