import supabase from '../../../configs/supabase';
import { generativeModel } from '../../../configs/vertex';
import { getCurrentUser } from '../../../lib/auth';
import { DatabaseError } from '../../../types/errors';
import { MelodyChat, MelodyMessage } from '../../../types/types';

export const createMelodyChat = async (friend: string, firstPrompt: string) => {
    // Get the current user's ID
    const userId = (await getCurrentUser()).user_id;

    // Generate a chat title based on the first prompt
    const generateTitleRequest = {
        contents: [
            {
                role: 'user',
                parts: [
                    {
                        text: `PLEASE describe the following words in a SINGLE string of ONLY 3 to 5 words with some emojis:[${firstPrompt}]`,
                    },
                ],
            },
        ],
    };

    const result = await generativeModel.generateContent(generateTitleRequest);
    const title = result.response.candidates?.[0].content?.parts?.[0].text;

    const { data, error: dbError } = await supabase
        .from('melody_chats')
        .insert([{ user_id: userId, friend, title }])
        .select();

    if (dbError) {
        throw new DatabaseError(500, 'Error creating chat');
    }

    // Return the newly created chat to the client
    const newChat: MelodyChat = {
        chat_id: data[0].chat_id,
        started_at: data[0].started_at,
        last_active: data[0].last_active,
        user_id: 'SIKE',
        friend: data[0].friend,
        title: data[0].title,
    };

    // Append the first message to the chat
    const { data: msg, error: dbError2 } = await supabase
        .from('melody_messages')
        .insert([{ chat_id: newChat.chat_id, user_id: userId, type: 'USER_TEXT', content: firstPrompt }])
        .select();

    if (dbError2) {
        throw new DatabaseError(500, 'Error creating message');
    }

    const newMessage: MelodyMessage = {
        message_id: msg[0].message_id,
        created_at: msg[0].created_at,
        chat_id: msg[0].chat_id,
        user_id: msg[0].user_id,
        type: msg[0].type,
        content: msg[0].content,
    };

    return { newChat, newMessage };
};

export const fetchChats = async () => {
    // Get the current user's ID
    const userId = (await getCurrentUser()).user_id;

    const { data, error: dbError } = await supabase.from('melody_chats').select('*').eq('user_id', userId).order('last_active', { ascending: false });

    if (dbError) {
        throw new DatabaseError(500, 'Error fetching chats');
    }

    const chats: MelodyChat[] = data.map((chat: any) => {
        return {
            chat_id: chat.chat_id,
            started_at: chat.started_at,
            last_active: chat.last_active,
            user_id: chat.user_id,
            friend: chat.friend,
            title: chat.title,
        };
    });

    return chats;
};

export const createChatMessage = async (chatId: string, message: string) => {
    const userId = (await getCurrentUser()).user_id;

    // Insert the new message into the database
    const { data, error: dbError } = await supabase
        .from('melody_messages')
        .insert([{ chat_id: chatId, user_id: userId, type: 'USER_TEXT', content: message }])
        .select();

    if (dbError) {
        throw new DatabaseError(500, 'Error creating message');
    }

    // Return the newly created message to the client
    const newMessage: MelodyMessage = {
        message_id: data[0].message_id,
        created_at: data[0].created_at,
        chat_id: data[0].chat_id,
        user_id: data[0].user_id,
        type: data[0].type,
        content: data[0].content,
    };

    return newMessage;
};

export const fetchChatMessages = async (chatId: string) => {
    const userId = (await getCurrentUser()).user_id;

    // Check if the user is a participant in the chat
    const { error: dbError } = await supabase.from('melody_chats').select('*').eq('chat_id', chatId).eq('user_id', userId);

    if (dbError) {
        throw new DatabaseError(500, 'Error fetching chat');
    }

    const { data, error: anotherError } = await supabase.from('melody_messages').select('*').eq('chat_id', chatId);

    if (anotherError) {
        throw new DatabaseError(500, 'Error fetching messages');
    }

    const messages: MelodyMessage[] = data.map((message: any) => {
        return {
            message_id: message.message_id,
            created_at: message.created_at,
            chat_id: message.chat_id,
            user_id: message.user_id,
            type: message.type,
            content: message.content,
        };
    });

    return messages;
};

export const updateChatTitle = async (chatId: string, title: string) => {
    // await updateChatTitle(chatId, title);
};

export const deleteChat = async (chatId: string) => {
    // await deleteChat(chatId);
};
