"use strict";
/**
 * Service Layer for Melody API Route
*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteChat = exports.updateChatTitle = exports.fetchChatMessages = exports.createChatMessage = exports.fetchChats = exports.createMelodyChat = void 0;
const supabase_1 = require("../../../config/supabase");
const geminiSingleton_1 = require("../../../config/vertex/geminiSingleton");
const errors_1 = require("../../../types/errors");
const messages_1 = require("../../../utils/messages");
const createMelodyChat = async (userId, firstPrompt, modelName) => {
    var _a, _b, _c;
    // Generate a chat title based on the first prompt
    const generateTitleRequest = {
        contents: [
            {
                role: 'user',
                parts: [
                    {
                        text: `Generate a title with some emojis of ONLY 3 to 8 words based on the following first prompt from the user:[${firstPrompt}], Please only output the title string.`,
                    },
                ],
            },
        ],
    };
    const result = await geminiSingleton_1.generativeModel.generateContent(generateTitleRequest);
    const title = (_c = (_b = (_a = result.response.candidates) === null || _a === void 0 ? void 0 : _a[0].content) === null || _b === void 0 ? void 0 : _b.parts) === null || _c === void 0 ? void 0 : _c[0].text;
    const { data, error: dbError } = await supabase_1.supabase
        .from('melody_chats')
        .insert([{ user_id: userId, title: title, model_name: modelName }])
        .select();
    if (dbError) {
        throw new errors_1.DatabaseError(500, 'Error creating chat');
    }
    // Return the newly created chat to the client
    const newChat = {
        chat_id: data[0].chat_id,
        started_at: data[0].started_at,
        last_active: data[0].last_active,
        user_id: 'SIKE',
        title: data[0].title,
        model_name: modelName
    };
    // Append the first message to the chat
    const { data: msg, error: dbError2 } = await supabase_1.supabase
        .from('melody_messages')
        .insert([{ chat_id: newChat.chat_id, user_id: userId, type: 'USER_TEXT', content: firstPrompt }])
        .select();
    if (dbError2) {
        throw new errors_1.DatabaseError(500, 'Error creating message');
    }
    const newMessage = {
        message_id: msg[0].message_id,
        created_at: msg[0].created_at,
        chat_id: msg[0].chat_id,
        user_id: msg[0].user_id,
        type: msg[0].type,
        content: msg[0].content,
    };
    return { newChat, newMessage };
};
exports.createMelodyChat = createMelodyChat;
const fetchChats = async (userId) => {
    const { data, error: dbError } = await supabase_1.supabase
        .from('melody_chats')
        .select('*')
        .eq('user_id', userId)
        .order('last_active', { ascending: false });
    if (dbError) {
        throw new errors_1.DatabaseError(500, 'Error fetching chats');
    }
    const chats = data.map((chat) => {
        return {
            chat_id: chat.chat_id,
            started_at: chat.started_at,
            last_active: chat.last_active,
            user_id: chat.user_id,
            title: chat.title,
            model_name: chat.model_name
        };
    });
    return chats;
};
exports.fetchChats = fetchChats;
const createChatMessage = async (userId, chatId, message) => {
    // Insert the new message into the database
    const { data, error: dbError } = await supabase_1.supabase
        .from('melody_messages')
        .insert([{ chat_id: chatId, user_id: userId, type: 'USER_TEXT', content: message }])
        .select();
    if (dbError) {
        throw new errors_1.DatabaseError(500, 'Error creating message');
    }
    // Return the newly created message to the client
    const newMessage = {
        message_id: data[0].message_id,
        created_at: data[0].created_at,
        chat_id: data[0].chat_id,
        user_id: data[0].user_id,
        type: data[0].type,
        content: data[0].content,
    };
    return newMessage;
};
exports.createChatMessage = createChatMessage;
const fetchChatMessages = async (userId, chatId) => {
    return await (0, messages_1.loadMessagesFromDatabase)(userId, chatId);
};
exports.fetchChatMessages = fetchChatMessages;
const updateChatTitle = async (chatId, title) => {
    // await updateChatTitle(chatId, title);
};
exports.updateChatTitle = updateChatTitle;
const deleteChat = async (chatId) => {
    // await deleteChat(chatId);
};
exports.deleteChat = deleteChat;
