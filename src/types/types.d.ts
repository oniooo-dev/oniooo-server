type User = {
    user_id: string;
    username: string;
    email: string | undefined;
    icon_url: string | undefined;
};

type MelodyChat = {
    chat_id: string;
    started_at: string;
    last_active: string;
    user_id: string;
    friend: Friend;
    title: string;
};

export enum MessageTypes {
    USER_TEXT,
    USER_FILE,
    SYSTEM_TEXT,
    SYSTEM_FILE,
}

type MelodyMessage = {
    message_id: string;
    created_at: string;
    chat_id: string;
    user_id: string;
    type: MessageTypes;
    content: string;
};
