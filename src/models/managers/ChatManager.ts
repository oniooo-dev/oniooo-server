/**
 * ChatManager Module
*/

import { ChatSession, Content, StartChatParams, GenerativeModel } from '@google-cloud/vertexai';
import { loadMessagesFromDatabase } from '../../utils/messages';

export class ChatManager {
    private userId: string;
    private chat: ChatSession | null;

    // Constructor
    constructor(userId: string) {
        this.userId = userId;
        this.chat = null;   // Initialize Chat Session
    }

    /**
     * Load chat messages from the database, format them, and start a chat session.
     * @param generativeModel - The Vertex AI generative model instance.
     * @param chatId - The ID of the chat session to load.
     */
    async loadOrCreateChat(chatId: string, generativeModel: GenerativeModel): Promise<void> {
        console.log(`Loading chat session with ID: ${chatId}`);
        const messages = await loadMessagesFromDatabase(this.userId, chatId);

        if (messages) {
            // Map to Vertex AI's Content format
            const formattedMessages: Content[] = this.formatMessages(messages);
            const startChatParams: StartChatParams = { history: formattedMessages };

            // Initialize the chat with formatted history
            this.chat = generativeModel.startChat(startChatParams);
            console.log(await this.chat.getHistory());
            console.log("Chat session started with existing messages.");
        } else {
            // Start a new chat session if no history is found
            this.chat = generativeModel.startChat();
            console.log("Started a new chat session.");
        }
    }

    // Format text messages to the Vertex AI model format
    private formatMessages(messages: any[]): Content[] {
        return messages.map(message => ({
            parts: [{ text: message.content }],
            role: message.type === 'USER_TEXT' ? 'user' : 'assistant',
        }));
    }

    /**
     * Send a text message to the chat session and get a response.
     * @param prompt - The message prompt to send.
     * @returns - The response from the chat.
     */
    async sendMessage(prompt: string): Promise<string> {
        if (!this.chat) throw new Error('No active chat session.');

        try {
            const modelResponse = await this.chat.sendMessage(prompt); // Get the output from Gemini

            // Ensure the response and candidates are defined before accessing further properties
            if (
                !modelResponse.response ||
                !modelResponse.response.candidates ||
                modelResponse.response.candidates.length === 0 ||
                !modelResponse.response.candidates[0].content ||
                !modelResponse.response.candidates[0].content.parts ||
                modelResponse.response.candidates[0].content.parts.length === 0
            ) {
                throw new Error('Gemini Error: Missing candidates or content in response.');
            }

            const textOutput = modelResponse.response.candidates[0].content.parts[0].text;

            if (!textOutput) {
                throw new Error('Gemini Error: Text Output is missing.');
            }

            return textOutput;
        } catch (error) {
            console.error('Error in sendMessage:', error); // Log the error for debugging
            throw new Error('Failed to get response from Gemini LLM.'); // Throw a more general error for the caller
        }
    }

    /**
     * End the current chat session.
     */
    endChatSession(): void {
        if (!this.chat) {
            console.warn('No active chat session to end.');
            return;
        }

        console.log('Ending the chat session...');
        this.chat = null;  // Reset chat session
    }
}
