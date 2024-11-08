/**
 * Type definitions for the project
*/

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
    model_name: "gemini" | "claude";
};

type MelodyMessage = {
    message_id: string;
    created_at: string;
    chat_id: string;
    user_id: string;
    type: "USER_TEXT" | "USER_FILE" | "SYSTEM_TEXT" | "SYSTEM_FILE";
    content: string;
};

// Union type for the Model Instances
type ModelInstance = GenerativeModel | AnthropicVertex;