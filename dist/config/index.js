"use strict";
/**
 * Centralize environment and configuation settings
*/
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.corsOptions = exports.jwtSecret = exports.port = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.port = process.env.PORT || 8080;
exports.jwtSecret = process.env.JWT_SECRET || '';
exports.corsOptions = {
    origin: function (origin, callback) {
        // Environment-specific CORS origins
        const allowedOrigins = {
            development: [
                'http://localhost:3000', // Frontend host for local development
                'http://localhost:8080' // Additional local services
            ],
            production: [
                'https://oniooo.com',
                'https://www.oniooo.com',
                'https://api.oniooo.com' // If API subdomain needs to make requests
            ],
            staging: [
                'https://staging.oniooo.com' // Maybe later
            ]
        };
        const env = process.env.NODE_ENV || 'development'; // Defaults to development
        if (!origin || allowedOrigins[env].includes(origin)) {
            callback(null, true);
        }
        else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'] // ???
};
