import { Router } from 'express';
import { createMelodyChat, fetchMelodyChats, createMelodyChatMessage, fetchMelodyChatMessages, updateMelodyChat, deleteMelodyChat } from './melody.controllers';

const melodyRoutes = Router();

// Handle chat routes
melodyRoutes.post('/chats', createMelodyChat);
melodyRoutes.get('/chats', fetchMelodyChats);

// Handle chat message routes
melodyRoutes.post('/chats/:chatId/messages', createMelodyChatMessage);
melodyRoutes.get('/chats/:chatId/messages', fetchMelodyChatMessages);

// ...
melodyRoutes.put('/chats/:chatId', updateMelodyChat);
melodyRoutes.delete('/chats/:chatId', deleteMelodyChat);

export default melodyRoutes;