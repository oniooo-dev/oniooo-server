/**
 * Centralize environment and configuation settings
*/

import dotenv from 'dotenv';
import { CorsOptions } from 'cors';

dotenv.config();

type EnvType = 'development' | 'production' | 'staging';

export const port = process.env.PORT || 8080;
export const jwtSecret = process.env.JWT_SECRET || ''

export const corsOptions: CorsOptions = {
    origin: function (origin, callback) {

        // Environment-specific CORS origins
        const allowedOrigins: Record<EnvType, string[]> = {
            development: [
                'http://localhost:3000',  // Frontend host for local development
                'http://localhost:8080'   // Additional local services
            ],
            production: [
                'https://oniooo.com',
                'https://www.oniooo.com',
                'https://api.oniooo.com'  // If API subdomain needs to make requests
            ],
            staging: [
                'https://staging.oniooo.com'    // Maybe later
            ]
        };

        const env = process.env.NODE_ENV as EnvType || 'development';   // Defaults to development

        if (!origin || allowedOrigins[env].includes(origin)) {
            callback(null, true);
        }
        else {
            callback(new Error('Not allowed by CORS'));
        }

    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']       // ???
};