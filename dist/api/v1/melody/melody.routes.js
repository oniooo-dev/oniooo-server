"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const melody_controllers_1 = require("./melody.controllers");
const melodyRoutes = (0, express_1.Router)();
// Handle chat routes
melodyRoutes.post('/chats', melody_controllers_1.createMelodyChat);
melodyRoutes.get('/chats', melody_controllers_1.fetchMelodyChats);
// Handle chat message routes
melodyRoutes.post('/chats/:chatId/messages', melody_controllers_1.createMelodyChatMessage);
melodyRoutes.get('/chats/:chatId/messages', melody_controllers_1.fetchMelodyChatMessages);
// ...
melodyRoutes.put('/chats/:chatId', melody_controllers_1.updateMelodyChat);
melodyRoutes.delete('/chats/:chatId', melody_controllers_1.deleteMelodyChat);
exports.default = melodyRoutes;
