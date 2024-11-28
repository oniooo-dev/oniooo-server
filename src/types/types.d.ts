
/**
 * Type definitions for the project
*/

declare module 'mime-types';

type User = {
    userId: string;
    email: string | undefined;
    iconUrl: string | undefined;
    mochiBalance: number;
};

type MelodyChat = {
    chat_id: string;
    started_at: string;
    last_active: string;
    user_id: string;
    title: string;
};

type MelodyMessage = {
    message_id: string;
    created_at: string;
    chat_id: string;
    user_id: string;
    type: "USER_TEXT" | "USER_FILE" | "SYSTEM_TEXT" | "SYSTEM_FILE";
    content: string;
};