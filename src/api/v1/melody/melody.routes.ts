import { Router } from 'express';
// import { loginInputValidation, registerInputValidation } from '../../../middleware/auth/input';
import {
    fetchSavedModels,
    fetchConversationHistory,
    createConversation,
    fetchMessagesByConversationId,
    createConversationMessage,
    updateConversationTitle,
    deleteConversation,
} from './melody.controller';

const melodyRoutes = Router();

melodyRoutes.get('/models/saved', fetchSavedModels);
melodyRoutes.get('/conversations', fetchConversationHistory);
melodyRoutes.post('/conversations', createConversation);
melodyRoutes.get('/conversations/:conversationId/messages', fetchMessagesByConversationId);
melodyRoutes.post('/conversations/:conversationId/messages', createConversationMessage);
melodyRoutes.put('/conversations/:conversationId/title', updateConversationTitle);
melodyRoutes.delete('/conversations/:conversationId', deleteConversation);

export default melodyRoutes;
