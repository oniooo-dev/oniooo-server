import { NextFunction, Request, Response } from 'express';
import * as MelodyService from './melody.services';
import { MelodyError } from '../../../types/errors';

// Create conversation
export const createConversationController = async (req: Request, res: Response) => {
    const { modelId, firstPrompt } = req.body;
    const newConversation = await MelodyService.createUserConversation(modelId, firstPrompt);

    // ...

    res.status(201).json({
        message: 'Conversation created',
    });
};

export const createOwnedModelController = async (req: Request, res: Response) => {
    const { modelId } = req.body;
    const newOwnedModel = await MelodyService.createUserOwnedModel(modelId);

    // ...

    res.status(201).json({
        message: 'Model saved',
    });
};

// Create conversation message
export const createConversationMessage = (req: Request, res: Response) => {
    res.status(201).json({
        message: 'Message created',
    });
};

export const fetchOwnedModelsController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Attempt to register the user
        const userOwnedModels = await MelodyService.fetchUserOwnedModels();

        // Validate the response from AuthService
        if (!userOwnedModels) {
            throw new MelodyError(500, 'Internal server error');
        }

        res.status(200).json({
            message: 'Saved models fetched',
            userOwnedModels: userOwnedModels,
        });
    } catch (error) {
        next(error);
    }
};

export const fetchModelController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { modelId } = req.body;

        // Attempt to register the user
        const userOwnedModels = await MelodyService.fetchModel(modelId);

        // Validate the response from AuthService
        if (!userOwnedModels) {
            throw new MelodyError(500, 'Internal server error');
        }

        res.status(200).json({
            message: 'Saved models fetched',
            userOwnedModels: userOwnedModels,
        });
    } catch (error) {
        next(error);
    }
};

// Fetch conversation history
export const fetchConversationsController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const conversations = await MelodyService.fetchUserConversations();

        if (!conversations) {
            throw new MelodyError(500, 'Internal server error');
        }

        res.status(200).json({
            message: 'Conversation history fetched',
            conversations: conversations,
        });
    } catch (error) {
        next(error);
    }
};

// Fetch messages by conversation ID
export const fetchConversationMessagesController = (req: Request, res: Response, next: NextFunction) => {
    try {
        const conversationId = req.params.conversationId;
        const systemIconUrl = 'https://i.pinimg.com/736x/3a/6a/56/3a6a56863e245d6f7c33acda19f82916.jpg';
        const userIconUrl = 'https://i.pinimg.com/550x/b8/22/fd/b822fd5ee0e84c73f5ade20cb68c8099.jpg';
        res.status(200).json({
            message: 'Conversation Messages fetched',
            conversationMessages: [
                {
                    id: '1',
                    iconUrl: systemIconUrl,
                    senderName: 'Melody',
                    senderType: 'assistant',
                    content:
                        'Message 1 Message 1 Message 1 Message 1 Message 1 Message 1 Message 1 Message 1 Message 1 Message 1 Message 1 Message 1 Message 1 Message 1 Message 1 Message 1',
                },
                {
                    id: '2',
                    iconUrl: systemIconUrl,
                    senderName: 'Melody',
                    senderType: 'assistant',
                    content:
                        'Message 1 Message 1 Message 1 Message 1 Message 1 Message 1 Message 1 Message 1 Message 1 Message 1 Message 1 Message 1 Message 1 Message 1 Message 1 Message 1',
                },
                {
                    id: '3',
                    iconUrl: userIconUrl,
                    senderName: 'Iamfunny123',
                    senderType: 'user',
                    content:
                        'Message 1 Message 1 Message 1 Message 1 Message 1 Message 1 Message 1 Message 1 Message 1 Message 1 Message 1 Message 1 Message 1 Message 1 Message 1 Message 1',
                },
                {
                    id: '4',
                    iconUrl: systemIconUrl,
                    senderName: 'Gemini',
                    senderType: 'expert',
                    content:
                        'Message 1 Message 1 Message 1 Message 1 Message 1 Message 1 Message 1 Message 1 Message 1 Message 1 Message 1 Message 1 Message 1 Message 1 Message 1 Message 1',
                },
            ],
        });
    } catch (error) {
        next(error);
    }
};

// ...
// ...
// ...

// Update conversation title
export const updateConversationTitle = (req: Request, res: Response) => {
    res.status(200).json({
        message: 'Conversation title updated',
    });
};

// Delete conversation
export const deleteConversation = (req: Request, res: Response) => {
    res.status(200).json({
        message: 'Conversation deleted',
    });
};
