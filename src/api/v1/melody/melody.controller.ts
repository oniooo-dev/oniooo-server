import { Request, Response } from 'express';

export const fetchSavedModels = (req: Request, res: Response) => {
    const imgUrl = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT1hZxkl7aLUy170veFH3FI9uDbkqoSBjMY2A&s';
    res.status(200).json({
        message: 'Saved models fetched successfully',
        savedModels: [
            { id: 'I like nuts', modelName: 'Model 1', iconUrl: imgUrl },
            { id: 'I like butts', modelName: 'Model 2', iconUrl: imgUrl },
            { id: 'I like noice', modelName: 'Model 3', iconUrl: imgUrl },
        ],
    });
};

// Fetch conversation history
export const fetchConversationHistory = (req: Request, res: Response) => {
    res.status(200).json({
        message: 'Conversation history fetched',
        conversations: [
            { id: '1', title: 'Conversation 1' },
            { id: '2', title: 'Conversation 2' },
            { id: '3', title: 'Conversation 3' },
        ],
    });
};

// Create conversation
export const createConversation = (req: Request, res: Response) => {
    res.status(201).json({
        message: 'Conversation created',
    });
};

// Fetch messages by conversation ID
export const fetchMessagesByConversationId = (req: Request, res: Response) => {
    const conversationId = req.params.conversationId;
    const systemIconUrl = 'https://i.pinimg.com/736x/3a/6a/56/3a6a56863e245d6f7c33acda19f82916.jpg';
    const userIconUrl = 'https://i.pinimg.com/550x/b8/22/fd/b822fd5ee0e84c73f5ade20cb68c8099.jpg';
    res.status(200).json({
        message: 'Conversation Messages fetched',
        conversationMessages: [
            { id: '1', iconUrl: systemIconUrl, senderName: 'Melody', senderType: 'assistant', content: 'Message 1' },
            { id: '2', iconUrl: userIconUrl, senderName: 'Iamfunny123', senderType: 'user', content: 'Message 2' },
            { id: '3', iconUrl: systemIconUrl, senderName: 'Gemini', senderType: 'expert', content: 'Message 3' },
        ],
    });
};

// Create conversation message
export const createConversationMessage = (req: Request, res: Response) => {
    res.status(201).json({
        message: 'Message created',
    });
};

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
