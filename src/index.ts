import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import express, { Express } from 'express';
import session from 'express-session';
import helmet from 'helmet';
import morgan from 'morgan';

// Routes
// import apiRoutes from './api/v1/api.routes';

// Load environment variables
dotenv.config();
const port = process.env.PORT || 8080;

// Express server
const app: Express = express();

// Cookies
app.use(cookieParser());

// Session to store refresh token
app.use(
    session({
        secret: process.env.SESSION_SECRET_KEY || 'secret',
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            secure: true,
            maxAge: 60 * 60 * 1000,
        },
    }),
);

// CORS
app.use(
    cors({
        // Allow only client-side origin
        origin: 'http://localhost:3000',

        // Allow credentials
        credentials: true,
    }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Security (no clue what they do)
app.use(helmet());
app.use(morgan('dev'));

// Routes
// app.use('/api/v1/', apiRoutes);

app.get('/api/ping', (req, res) => {
    res.status(200).json({ message: 'pong' });
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

export default app;