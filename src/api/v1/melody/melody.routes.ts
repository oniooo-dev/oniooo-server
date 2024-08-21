import { Router } from 'express';
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

const melodyRoutes = Router();

melodyRoutes.get('/models/saved', fetchOwnedModelsController);
melodyRoutes.post('/models/saved', createOwnedModelController);
melodyRoutes.get('/models/saved/details', fetchModelController);
melodyRoutes.get('/conversations', fetchConversationsController);
melodyRoutes.post('/conversations', createConversationController);
melodyRoutes.get('/conversations/:conversationId/messages', fetchConversationMessagesController);
// melodyRoutes.post('/conversations/:conversationId/messages', createConversationMessageController);
// melodyRoutes.put('/conversations/:conversationId/title', updateConversationTitleController);
// melodyRoutes.delete('/conversations/:conversationId', deleteConversationController);

export default melodyRoutes;
