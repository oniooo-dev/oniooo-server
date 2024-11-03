/**
 * Claude Singleton Module
*/

import { AnthropicVertex } from '@anthropic-ai/vertex-sdk';

class ClaudeSingleton {
    // Static field
    private static instance: AnthropicVertex | null = null;

    // Private constructor
    private constructor() { }    // Prevent initialization

    // Static getter
    static getInstance(): AnthropicVertex {
        if (!ClaudeSingleton.instance) {
            const projectId = 'oniooo-app';
            const region = 'us-east5';

            // Goes through the standard `google-auth-library` flow.
            const client = new AnthropicVertex({
                projectId,
                region,
            });

            ClaudeSingleton.instance = client;
        }
        return ClaudeSingleton.instance;
    }
}

export const claudeModel = ClaudeSingleton.getInstance();