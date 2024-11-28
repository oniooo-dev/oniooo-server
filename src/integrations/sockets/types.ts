import { Socket } from "socket.io";

// Extend the Socket type to include a custom userId property
export interface AuthSocket extends Socket {
    userId?: string;    // Adding the userId property here
}

export interface ChatMessage {
    chatId: string;
    userId: string;
    text: string;
    fileUris: string[]; // Assuming every message should include file URIs, even if it's an empty array
}