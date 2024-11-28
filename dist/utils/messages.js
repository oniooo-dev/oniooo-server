"use strict";
/**
 * Messages Helper Functions for Supabase
*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveMessageToDatabase = saveMessageToDatabase;
exports.saveMelodyFileToDatabase = saveMelodyFileToDatabase;
exports.loadMessagesFromDatabase = loadMessagesFromDatabase;
const supabase_1 = require("../config/supabase");
const errors_1 = require("../types/errors");
// Save a text message from Melody
async function saveMessageToDatabase(chatId, userId, content) {
    const { data, error } = await supabase_1.supabase
        .from('melody_messages')
        .insert([{ chat_id: chatId, user_id: userId, type: 'SYSTEM_TEXT', content }])
        .select();
    if (error) {
        console.log('Error creating message:', error);
        throw new errors_1.DatabaseError(500, 'Error creating message');
    }
    console.log('Message saved to Supabase:', data);
    return data;
}
// Save a text message from Melody
async function saveMelodyFileToDatabase(chatId, userId, content) {
    const { data, error } = await supabase_1.supabase
        .from('melody_messages')
        .insert([{ chat_id: chatId, user_id: userId, type: 'SYSTEM_FILE', content }])
        .select();
    if (error) {
        console.log('Error creating message:', error);
        throw new errors_1.DatabaseError(500, 'Error creating message');
    }
    console.log('Message saved to Supabase:', data);
    return data;
}
// Fetch messages of chat by id
async function loadMessagesFromDatabase(userId, chatId) {
    // Check if the user is a participant in the chat
    const { error: dbError } = await supabase_1.supabase
        .from('melody_chats')
        .select('*')
        .eq('chat_id', chatId)
        .eq('user_id', userId);
    if (dbError) {
        throw new errors_1.DatabaseError(500, 'Error fetching chat');
    }
    const { data, error: anotherError } = await supabase_1.supabase
        .from('melody_messages')
        .select('*')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true });
    if (anotherError) {
        throw new errors_1.DatabaseError(500, 'Error fetching messages');
    }
    const messages = data.map((message) => {
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
