
/**
 * Claude 3.5 Setup
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

    // Anthropic-SDK
    private anthropicClient: Anthropic;

    constructor() {

        // Grab my ass
        const apiKey = process.env.ANTHROPIC_API_KEY;

        if (!apiKey) {
            throw new Error('Anthropic API key is missing. Please set ANTHROPIC_API_KEY in your environment variables.');
        }

        this.anthropicClient = new Anthropic({ apiKey });
    }

    async generate(prompt: string): Promise<string> {

        // Intended to generate titles
        const message = `Generate a title with some emojis of ONLY 3 to 8 words 
                         based on the following first prompt from the user:[${prompt}], 
                         Please only output the title string.`

        try {

            const response = await this.anthropicClient.beta.messages.create(
                {
                    model: 'claude-3-5-sonnet-20241022',
                    max_tokens: 256,
                    temperature: 0.5,
                    messages: [
                        {
                            role: 'user',
                            content: message
                        } as MessageParam
                    ],
                },
            )

            return extractTextContent(response)[0];
        }
        catch (error) {
            console.error('Error during creation:', error);
            throw new Error('Failed to fetch response from Anthropic.');
        }
    }

    stream(userTextQuery: string, previousChatMessages: Array<MessageParam>, fileURIs: string[]): MessageStream {

        // Append the current prompt to the conversation history
        const messages: Array<MessageParam> = [
            ...previousChatMessages,
            { role: 'user', content: userTextQuery },
        ];

        try {

            // Return the stream object
            return this.anthropicClient.messages.stream(
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
                        When responding, please use clean and proper Markdown formatting for your text. 
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

        }
        catch (error) {
            console.error('Error during streaming:', error);
            throw new Error('Failed to fetch response from Anthropic.');
        }
    }
}