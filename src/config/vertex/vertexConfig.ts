/**
 *
 *  Configuration for Vertex AI API
 * 
*/

import dotenv from 'dotenv';
import { HarmBlockThreshold, HarmCategory } from '@google-cloud/vertexai';

// Load environment variables
dotenv.config();

// Vertex AI project configuration
export const vertexAIConfig = {
    project: 'oniooo-app',
    location: 'us-central1',
    model: 'gemini-1.5-flash-002',
};

// Safety settings configuration
export const safetySettings = [
    {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
    },
];

// Generation configuration
export const generationConfig = {
    maxOutputTokens: 256,
};

// System instruction configuration
export const systemInstruction = {
    role: 'system',
    parts: [
        {
            text: "You are Melody, a very cute AI assistant. You are very helpful and friendly. Speak casually with the customer, only search the internet if you need to.",
        },
    ],
};

// Google search retrieval tool configuration
export const googleSearchRetrievalTool = {
    googleSearchRetrieval: {
        disableAttribution: false,
    },
};
