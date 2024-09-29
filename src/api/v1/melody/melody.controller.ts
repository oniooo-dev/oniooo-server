import { NextFunction, Request, Response } from 'express';
import * as MelodyService from './melody.services';
import { MelodyError } from '../../../types/errors';

// Create chat
export const createMelodyChat = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { firstPrompt }: { firstPrompt: string } = req.body;
        const { newChat, newMessage } = await MelodyService.createMelodyChat(firstPrompt);

        if (!newChat) {
            throw new MelodyError(500, 'Internal server error');
        }

        if (!newMessage) {
            throw new MelodyError(500, 'Internal server error');
        }

        res.status(200).json({
            newChat,
            newMessage,
        });
    } catch (error) {
        next(error);
    }
};

// Fetch chat history
export const fetchMelodyChats = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const chats = await MelodyService.fetchChats();

        if (!chats) {
            throw new MelodyError(500, 'Internal server error');
        }

        res.status(200).json({
            chats,
        });
    } catch (error) {
        next(error);
    }
};

// Create chat message
export const createMelodyChatMessage = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { chatId } = req.params;
        const { message } = req.body;
        const newMessage = await MelodyService.createChatMessage(chatId, message);
        res.status(200).json({
            newMessage,
        });
    } catch (error) {
        console.log(error);
        next(error);
    }
};

// Fetch messages by chat ID
export const fetchMelodyChatMessages = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const chatId = req.params.chatId;
        const messages = await MelodyService.fetchChatMessages(chatId);
        res.status(200).json({
            messages,
        });
    } catch (error) {
        next(error);
    }
};

// Update chat title
export const updateMelodyChat = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { chatId } = req.params;
        const { title } = req.body;
        const updatedChat = await MelodyService.updateChatTitle(chatId, title);
        res.status(200).json({
            updatedChat,
        });
    } catch (error) {
        next(error);
    }
};

// Delete chat
export const deleteMelodyChat = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { chatId } = req.params;
        await MelodyService.deleteChat(chatId);
        res.status(200).json({
            message: 'Chat deleted',
        });
    } catch (error) {
        next(error);
    }
};
