/**
 * Messages Helper Functions for Supabase
*/

import { ImageBlockParam, MessageParam } from "@anthropic-ai/sdk/resources/messages";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import axios from "axios";
import { s3Client } from "../config/aws";
import { supabase } from "../config/supabase";
import { DatabaseError } from "../types/errors";
import { getMimeType } from "./utils";
import dotenv from "dotenv";

dotenv.config();

// Extracts and decodes the S3 object key from a full S3 URL
export function extractS3KeyFromUrl(url: string): string {
    try {
        const urlObj = new URL(url);
        let key = '';

        // Handle different S3 URL formats
        if (urlObj.hostname.includes('.s3.')) {
            // Format: https://melody-files.s3.us-east-1.amazonaws.com/Screenshot 2024-11-23 at 5.54.57 PM.png
            key = urlObj.pathname.slice(1); // Remove leading '/'
        }
        else if (urlObj.pathname.split('/').length > 1) {
            // Format: https://s3.us-east-1.amazonaws.com/melody-files/Screenshot 2024-11-23 at 5.54.57 PM.png
            key = urlObj.pathname.split('/').slice(2).join('/'); // Remove leading '/melody-files/'
        }
        else {
            throw new Error('Unsupported S3 URL format.');
        }

        // Decode once to prevent double encoding
        key = decodeURIComponent(key);

        if (!key) {
            throw new Error('S3 URL does not contain a valid key.');
        }

        return key;
    } catch (error: any) {
        console.error(`Invalid S3 URL provided: ${url}`);
        throw new Error('Failed to extract S3 object key from URL.');
    }
}

// Fetch an image from S3 and convert it to base64
export async function fetchFileAsBase64(fileKey: string): Promise<string> {
    const bucketName = process.env.AWS_S3_BUCKET_NAME;

    // Enhanced Logging for Debugging
    console.log('Fetching image with the following parameters:');
    console.log('Bucket Name:', bucketName);
    console.log('File Key:', fileKey);

    if (!bucketName) {
        throw new Error('AWS_S3_BUCKET_NAME is not defined in environment variables.');
    }

    try {
        const params = {
            Bucket: bucketName, // Your S3 bucket name
            Key: fileKey,
        };

        // Generate a pre-signed URL
        const command = new GetObjectCommand(params);
        const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 60 });

        if (!signedUrl) {
            throw new Error('Failed to generate signed URL');
        }

        // Fetch the image data from the signed URL
        const response = await axios.get(signedUrl, { responseType: 'arraybuffer' });

        // Convert binary data to base64
        const base64 = Buffer.from(response.data, 'binary').toString('base64');

        return base64;
    }
    catch (error: any) {
        console.error(`Error fetching and converting image from S3: ${error.message}`);
        throw error;
    }
}

// Utility function to convert a MelodyMessage to a MessageParam
export async function convertToMessageParam(message: MelodyMessage): Promise<MessageParam | null> {

    // Check if the message content is empty
    if (!message.content || !message.content.trim()) {
        return null;
    }

    // Infer the MIME type from the file URI
    const mimeType =
        message.type === 'USER_FILE' || message.type === 'SYSTEM_FILE'
            ? getMimeType(message.content)
            : undefined;

    const role: "user" | "assistant" =
        message.type === 'USER_TEXT' || message.type === 'USER_FILE'
            ? 'user'
            : 'assistant';

    let content: string;

    const imageMimeTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"] as const;

    if (mimeType && imageMimeTypes.includes(mimeType as typeof imageMimeTypes[number])) {
        try {
            const fileUrl = message.content; // Full S3 URL
            const fileKey = extractS3KeyFromUrl(fileUrl);
            const base64Data = await fetchFileAsBase64(fileKey);

            // Instead of assigning an object, embed the image URL or a reference in the string
            content = `![Image](${fileUrl})`;
        }
        catch (error) {
            console.error('Failed to convert image to base64:', error);
            content = message.content.trim();
        }
    }
    else if (mimeType && mimeType === 'application/pdf') {
        try {
            const fileUrl = message.content; // Full S3 URL
            content = `PDF Document: [View Document](${fileUrl})`;
        }
        catch (error) {
            console.error('Failed to convert document to base64:', error);
            content = message.content.trim();
        }
    }
    else {
        content = message.content.trim();
    }

    const newMessage: MessageParam = {
        role,
        content
    };

    return newMessage;
}

// Simple token count estimator
function estimateTokenCount(text: string): number {
    return text.split(' ').length; // Simplified token estimation based on word count
}

export async function createChatInDatabase(userId: string, title: string): Promise<MelodyChat> {

    // Create the chat in the database
    const { data: newChat, error: dbError } = await supabase
        .from('melody_chats')
        .insert([
            {
                created_at: new Date().toISOString(),   // Latest chat timestamp (guarantee order)
                user_id: userId,
                title: title
            }
        ])
        .select()
        .single();

    if (dbError) {
        console.log('Error creating chat in the database:', dbError);
        throw new DatabaseError(500, 'Error creating chat in the database');
    }

    // Return the new chat
    return newChat;
}

export async function saveMessageToDatabase(
    chatId: string,         // chatId
    userId: string,         // userId
    type: string,           // type e.g. USER_TEXT, USER_FILE, SYSTEM_TEXT, SYSTEM_FILE
    content: string         // text or fileURI
) {

    // Save the message to the database
    const { data: savedMessage, error: dbError } = await supabase
        .from('melody_messages')
        .insert([
            {
                created_at: new Date().toISOString(),   // Latest message timestamp (guarantee order)
                chat_id: chatId,
                user_id: userId,
                type: type,
                content: content
            }
        ])
        .select();

    if (dbError) {
        console.log('Error creating message:', dbError);
        throw new DatabaseError(500, 'Error creating message in the database');
    }

    console.log('Message saved to Supabase:', savedMessage);

    // Update the chat timestamp
    const { error: updateError } = await supabase
        .from('melody_chats')
        .update({ updated_at: new Date().toISOString() })
        .eq('chat_id', chatId);

    if (updateError) {
        console.log('Error updating chat timestamp:', updateError);
        throw new DatabaseError(500, 'Error updating chat timestamp in the database');
    }

    return savedMessage;
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

    const messages: MelodyMessage[] = data.map(
        (message: any) => {
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

// Fetch messages for LLM from chat by id, considering token limits
export async function loadMessagesForLLMFromDatabase(userId: string, chatId: string, contextWindow: number = 20000): Promise<Array<MessageParam>> {
    let tokensUsed = 0;
    const messages: Array<MessageParam> = [];

    const { data: melodyMessages, error } = await supabase
        .from('melody_messages')
        .select('*')
        .eq('chat_id', chatId)
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

    if (error) {
        throw new DatabaseError(500, 'Error fetching messages');
    }

    for (const melodyMessage of melodyMessages) {

        // Convert the message to a MessageParam
        const message = await convertToMessageParam(melodyMessage);

        // Skip if message is null
        if (!message) {
            continue;
        }

        const estimatedTokens = estimateTokenCount(melodyMessage.content);

        // Break if the context window is exceeded
        if (tokensUsed + estimatedTokens > contextWindow) {
            break;
        }

        tokensUsed += estimatedTokens;
        messages.push(message);
    }

    return messages;
}

export async function createMessagePlaceholder(chatId: string, userId: string, type: string): Promise<string> {

    // Create a message placeholder in the database
    const { data, error } = await supabase
        .from('melody_messages')
        .insert([
            {
                created_at: new Date().toISOString(),
                chat_id: chatId,
                user_id: userId,
                type: type,
                content: ''
            }
        ])
        .select()
        .single();

    if (error) {
        console.error('Error creating message placeholder:', error.message);
        throw new Error('Failed to create message placeholder');
    }

    console.log('Created message placeholder with ID:', data.message_id);
    return data.message_id;
}

export async function appendChunkToMessage(messageId: string, chunk: string): Promise<void> {

    // Append the chunk to the message
    const { error } = await supabase.rpc('append_to_message', {
        in_message_id: messageId,
        in_chunk: chunk
    });

    if (error) {
        console.error('Error appending chunk to message:', error.message);
        throw new Error('Failed to append chunk to message');
    }

    // console.log('Appended chunk to message ID:', messageId);
}