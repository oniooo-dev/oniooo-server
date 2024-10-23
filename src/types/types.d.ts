// Don't play around with the user id
type User = {
    user_id: string;
    username: string;
    email: string | undefined;
    icon_url: string | undefined;
    mochi_balance: number;
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
    type: MessageType;
    content: string;
};
