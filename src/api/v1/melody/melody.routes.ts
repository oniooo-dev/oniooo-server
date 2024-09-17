import { Router } from 'express';
<<<<<<< HEAD
import { createMelodyChat, fetchMelodyChats, createMelodyChatMessage, fetchMelodyChatMessages, updateMelodyChat, deleteMelodyChat } from './melody.controller';

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
=======
// import { loginInputValidation, registerInputValidation } from '../../../middleware/auth/input';
import {
    fetchOwnedModelsController,
    createOwnedModelController,
    fetchModelController,
    fetchConversationsController,
    createConversationController,
    fetchConversationMessagesController,
    createConversationMessage,
    updateConversationTitle,
    deleteConversation,
} from './melody.controller';
import { authenticate } from '../../../middleware/authenticate';

const melodyRoutes = Router();

melodyRoutes.use(authenticate);

melodyRoutes.get('/models/saved', fetchOwnedModelsController);
melodyRoutes.post('/models/saved', createOwnedModelController);
melodyRoutes.get('/models/saved/details', fetchModelController);
melodyRoutes.get('/conversations', fetchConversationsController);
melodyRoutes.post('/conversations', createConversationController);
melodyRoutes.get('/conversations/:conversationId/messages', fetchConversationMessagesController);
// melodyRoutes.post('/conversations/:conversationId/messages', createConversationMessageController);
// melodyRoutes.put('/conversations/:conversationId/title', updateConversationTitleController);
// melodyRoutes.delete('/conversations/:conversationId', deleteConversationController);
>>>>>>> b439988407c146b2a072702be56b1ec27cc7a2cc

export default melodyRoutes;
