/**
 * Generative Model Module (for Gemini)
*/

import { VertexAI, GenerativeModel } from '@google-cloud/vertexai';
import { vertexAIConfig, safetySettings, generationConfig, systemInstruction } from './vertexConfig';

// Initialize VertexAI instance
const vertexAI = new VertexAI({
    project: vertexAIConfig.project,
    location: vertexAIConfig.location,
});

// Singleton class for managing GenerativeModel
class GenerativeModelSingleton {
    // Static bc Singleton
    private static instance: GenerativeModel | null = null;

    private constructor() { }   // Prevent instantiation

    static getInstance(): GenerativeModel {
        if (!GenerativeModelSingleton.instance) {
            // Create the instance only if it doesn't already exist
            GenerativeModelSingleton.instance = vertexAI.getGenerativeModel({
                model: vertexAIConfig.model,
                safetySettings: safetySettings,
                generationConfig: generationConfig,
                systemInstruction: systemInstruction,
                // tools: [googleSearchRetrievalTool], // Uncomment if needed
            });
        }
        return GenerativeModelSingleton.instance;
    }
}

export const generativeModel = GenerativeModelSingleton.getInstance();