
/**
 * Middleware for the Express app
*/

import { Express } from 'express';
import express from "express";
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { corsOptions } from '../config/'

// Setup all the middleware for the Express app
export const setupMiddleware = (app: Express): void => {
    app.use(cors(corsOptions));
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(cookieParser());
    app.use(helmet());
    app.use(morgan('dev'));
    app.options('*', cors(corsOptions));  // Allow preflight
};