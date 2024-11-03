/**
 * Messages Helper Functions for Supabase
*/

import { supabase } from "../config/supabase";
import { DatabaseError } from "../types/errors";

// Save a text message from Melody
export async function saveMessageToDatabase(chatId: string, userId: string, content: string) {
    const { data, error } = await supabase
        .from('melody_messages')
        .insert([{ chat_id: chatId, user_id: userId, type: 'SYSTEM_TEXT', content }])
        .select();

    if (error) {
        console.log('Error creating message:', error);
        throw new DatabaseError(500, 'Error creating message');
    }

    console.log('Message saved to Supabase:', data);
    return data;
}

// Save a text message from Melody
export async function saveMelodyFileToDatabase(chatId: string, userId: string, content: string) {
    const { data, error } = await supabase
        .from('melody_messages')
        .insert([{ chat_id: chatId, user_id: userId, type: 'SYSTEM_FILE', content }])
        .select();

    if (error) {
        console.log('Error creating message:', error);
        throw new DatabaseError(500, 'Error creating message');
    }

    console.log('Message saved to Supabase:', data);
    return data;
}

// Fetch messages of chat by id
export async function loadMessagesFromDatabase(userId: string, chatId: string) {
    // Check if the user is a participant in the chat
    const { error: dbError } = await supabase
        .from('melody_chats')
        .select('*')
        .eq('chat_id', chatId)
        .eq('user_id', userId);

    if (dbError) {
        throw new DatabaseError(500, 'Error fetching chat');
    }

    const { data, error: anotherError } = await supabase
        .from('melody_messages')
        .select('*')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true });

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
}