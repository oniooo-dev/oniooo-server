/**
 * Claude 3.5 Setup with Multiple API Keys and Retry Logic
 */

import Anthropic from '@anthropic-ai/sdk';
import { ContentBlock, MessageParam, MessageStream, TextBlock } from '@anthropic-ai/sdk/resources/messages';
import dotenv from 'dotenv';
import { tools } from '../../../utils/tools';

dotenv.config();

// Function to extract text content
function extractTextContent(response: { content: ContentBlock[] }): string[] {
    return response.content
        .filter((block): block is TextBlock => block.type === 'text')
        .map((textBlock) => textBlock.text);
}

export class AnthropicClient {
    private apiKeys: string[];
    private clients: Anthropic[];
    private currentKeyIndex: number;

    constructor() {
        const apiKeysEnv = process.env.ANTHROPIC_API_KEYS;
        if (!apiKeysEnv) {
            throw new Error('Anthropic API keys are missing. Please set ANTHROPIC_API_KEYS in your environment variables.');
        }

        this.apiKeys = apiKeysEnv.split(',').map(key => key.trim()).filter(key => key.length > 0);
        if (this.apiKeys.length === 0) {
            throw new Error('No valid Anthropic API keys found.');
        }

        // Initialize Anthropic clients for each key
        this.clients = this.apiKeys.map(apiKey => new Anthropic({ apiKey }));
        this.currentKeyIndex = 0;
    }

    /**
     * Selects the next available client in a round-robin fashion.
     */
    private getNextClient(): Anthropic {
        this.currentKeyIndex = (this.currentKeyIndex + 1) % this.clients.length;
        return this.clients[this.currentKeyIndex];
    }

    /**
     * Checks if the error is an overloaded error from Anthropic.
     */
    private isOverloadedError(error: any): boolean {
        return error && error.error && error.error.type === 'overloaded_error';
    }

    /**
     * Generates a response using Anthropic's API with retry logic.
     */
    async generate(prompt: string, maxRetries: number = this.clients.length): Promise<string> {
        let attempt = 0;
        let lastError: any;

        while (attempt < maxRetries) {
            const client = this.clients[this.currentKeyIndex];
            try {
                const message = `Generate a title with some emojis of ONLY 3 to 8 words 
                                 based on the following first prompt from the user:[${prompt}], 
                                 Please only output the title string.`;

                const response = await client.beta.messages.create({
                    model: 'claude-3-5-sonnet-20241022',
                    max_tokens: 256,
                    temperature: 0.5,
                    messages: [
                        {
                            role: 'user',
                            content: message
                        } as MessageParam
                    ],
                });

                return extractTextContent(response)[0];
            }
            catch (error) {
                console.error(`Error during generate with key index ${this.currentKeyIndex}:`, error);
                lastError = error;

                if (this.isOverloadedError(error)) {
                    // Switch to the next key for retry
                    this.getNextClient();
                    attempt++;
                }
                else {
                    // If it's a different error, don't retry
                    throw error;
                }
            }
        }

        // After exhausting all retries, throw the last encountered error
        throw lastError;
    }

    /**
     * Streams a response using Anthropic's API with retry logic.
     */
    stream(userTextQuery: string, previousChatMessages: Array<MessageParam>, fileURIs: string[], maxRetries: number = this.clients.length): { stream: MessageStream, clientIndex: number } {
        let attempt = 0;
        let selectedClientIndex = this.currentKeyIndex;
        let lastError: any;

        const initiateStream = (): { stream: MessageStream, clientIndex: number } => {
            const client = this.clients[this.currentKeyIndex];
            const messages: Array<MessageParam> = [
                ...previousChatMessages,
                { role: 'user', content: userTextQuery },
            ];

            try {
                const stream = client.messages.stream(
                    {
                        model: 'claude-3-5-sonnet-20241022',
                        max_tokens: 4096,
                        messages: messages,
                        tools: tools,
                        system: `
                            You are Melody. You should act cutely and helpfully.
                            Please try to keep your responses concise and to the point.
                            Help the user with their query, you can write great answers, code.
                            Only use tools if the user explicitly asks for it.
                            When responding, please use extensive Markdown formatting for your text. 
                            This includes using:
                            - Bold for emphasis on key terms (**bold**)
                            - Italics for secondary emphasis or for highlighting new or technical terms (*italics*)
                            - Headers for section titles
                            - Bullet points for lists
                            - Numbered lists for steps or sequential information
                            - Blockquotes for quotes or important notes
                            - Code blocks for any code snippets or commands
                            - Links for any URLs
                        `
                    },
                    {
                        headers: {
                            'anthropic-beta': 'pdfs-2024-09-25',
                        },
                    }
                );

                return { stream, clientIndex: this.currentKeyIndex };
            }
            catch (error) {
                console.error(`Error initiating stream with key index ${this.currentKeyIndex}:`, error);
                throw error;
            }
        }

        // Attempt to initiate the stream with retries
        while (attempt < maxRetries) {
            try {
                const { stream, clientIndex } = initiateStream();
                return { stream, clientIndex };
            }
            catch (error) {
                lastError = error;

                if (this.isOverloadedError(error)) {
                    // Switch to the next key for retry
                    this.getNextClient();
                    attempt++;
                }
                else {
                    // If it's a different error, don't retry
                    throw error;
                }
            }
        }

        // After exhausting all retries, throw the last encountered error
        throw lastError;
    }
}