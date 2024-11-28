"use strict";
/**
 * Generative Model Module (for Gemini)
*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.generativeModel = void 0;
const vertexai_1 = require("@google-cloud/vertexai");
const geminiConfig_1 = require("./geminiConfig");
// Initialize VertexAI instance
const vertexAI = new vertexai_1.VertexAI({
    project: geminiConfig_1.vertexAIConfig.project,
    location: geminiConfig_1.vertexAIConfig.location,
});
// Singleton class for managing GenerativeModel
class GenerativeModelSingleton {
    constructor() { } // Prevent instantiation
    static getInstance() {
        if (!GenerativeModelSingleton.instance) {
            // Create the instance only if it doesn't already exist
            GenerativeModelSingleton.instance = vertexAI.getGenerativeModel({
                model: geminiConfig_1.vertexAIConfig.model,
                safetySettings: geminiConfig_1.safetySettings,
                generationConfig: geminiConfig_1.generationConfig,
                systemInstruction: geminiConfig_1.systemInstruction,
                // tools: [googleSearchRetrievalTool],
            });
        }
        return GenerativeModelSingleton.instance;
    }
}
// Static bc Singleton
GenerativeModelSingleton.instance = null;
exports.generativeModel = GenerativeModelSingleton.getInstance();
