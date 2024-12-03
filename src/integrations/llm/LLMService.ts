/**
 * Currently tightly coupled with the Anthropic Interface (BAD)
*/

import { MessageParam, MessageStream } from "@anthropic-ai/sdk/resources/messages";
import { AnthropicClient } from "./anthropic/AnthropicClient";

export class LLMService {

    // For the Anthropic-SDK
    private client: AnthropicClient;

    constructor(client: AnthropicClient) {

        /**
         * Initializes the LLMService with a specific client.
         * @param client - The LLM client instance.
        */
        this.client = client;
    }

    async generate(prompt: string): Promise<string> {
        return await this.client.generate(prompt);
    }

    stream(userTextQuery: string, chatPreviousMessages: Array<MessageParam>, fileURIs: string[]) {
        return this.client.stream(userTextQuery, chatPreviousMessages, fileURIs);
    }
}