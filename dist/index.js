"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const https_1 = __importDefault(require("https"));
const socket_io_1 = require("socket.io");
const v1_1 = __importDefault(require("./api/v1"));
const config_1 = require("./config");
const middlewares_1 = require("./middlewares");
const socketHandler_1 = require("./sockets/handlers/socketHandler");
// import { loadSSLCertificates } from './utils/ssl';
// Initialize Express server
const app = (0, express_1.default)();
// const options = loadSSLCertificates();
// const server = process.env.NODE_ENV === 'production' ? https.createServer(options, app) : http.createServer(app);
const server = http_1.default.createServer(app);
// Setup middleware and routes
(0, middlewares_1.setupMiddleware)(app);
app.use('/api/v1/', v1_1.default);
// Create and configure the Socket.IO server
const io = new socket_io_1.Server(server, {
    path: '/socket.io'
});
(0, socketHandler_1.setupWebSocket)(io);
// Start listening to requests
server.listen(config_1.port, () => {
    console.log(`Server is running on ${server instanceof https_1.default.Server ? 'https' : 'http'}://localhost:${config_1.port}`);
});
/* Handled with NGinx */
// HTTP to HTTPS redirection only in production
// if (process.env.NODE_ENV === 'production') {
//     http.createServer((req, res) => {
//         res.writeHead(301, { "Location": "https://" + req.headers.host + req.url });
//         res.end();
//     }).listen(80);
// }
