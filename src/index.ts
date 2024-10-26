import express, { Express } from 'express';
import http from 'http';
import https from 'https';
import { Server as SocketIOServer } from 'socket.io';
import apiVersion1 from './api/v1';
import { port } from './config';
import { setupMiddleware } from './middlewares';
import { setupWebSocket } from './sockets/handlers/socketHandler';
import { loadSSLCertificates } from './utils/ssl';

// Initialize Express server
const app: Express = express();
const options = loadSSLCertificates();
const server = process.env.NODE_ENV === 'production' ? https.createServer(options, app) : http.createServer(app);

// Setup middleware and routes
setupMiddleware(app);
app.use('/api/v1/', apiVersion1);

// Create and configure the Socket.IO server
const io = new SocketIOServer(server);
setupWebSocket(io);

// Start listening to requests
server.listen(port, () => {
    console.log(`Server is running on ${server instanceof https.Server ? 'https' : 'http'}://localhost:${port}`);
});

// HTTP to HTTPS redirection only in production
if (process.env.NODE_ENV === 'production') {
    http.createServer((req, res) => {
        res.writeHead(301, { "Location": "https://" + req.headers.host + req.url });
        res.end();
    }).listen(80);
}