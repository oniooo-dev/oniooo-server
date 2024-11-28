import { LLMService } from './llm/LLMService';
import { AnthropicClient } from './llm/anthropic/AnthropicClient';

const anthropicClient = new AnthropicClient();

// Create a single LLMService instance
export const llmService = new LLMService(anthropicClient);