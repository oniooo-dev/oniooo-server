import dotenv from 'dotenv';
import { VertexAI, HarmBlockThreshold, HarmCategory, GenerativeModel, ChatSession } from '@google-cloud/vertexai';

dotenv.config();

const project = 'oniooo-app';
const location = 'us-central1';
const textModel = 'gemini-1.5-flash-002';

// Initialize Vertex with your Cloud project and location
const vertexAI = new VertexAI({ project: project, location: location });

// Define safety settings for the model
const safetySettings = [
    {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
];

const generationConfig = {
    maxOutputTokens: 256,
};

const systemInstruction = {
    role: 'system',
    parts: [
        {
            text: "You are Melody, a very cute AI assistant. You are very helpful and friendly. Speak casually with the customer, only search the internet if you need to.",
        },
    ],
};

const googleSearchRetrievalTool = {
    googleSearchRetrieval: {
        disableAttribution: false,
    },
};

// Instantiate the models
export const generativeModel: GenerativeModel = vertexAI.getGenerativeModel({
    model: textModel,
    safetySettings: safetySettings,
    generationConfig: generationConfig,
    systemInstruction: systemInstruction,
    tools: [googleSearchRetrievalTool],
});

export class Melody {
    generativeModel: GenerativeModel;
    chat: ChatSession;

    // For Initialization
    constructor() {
        this.generativeModel = generativeModel;
        this.chat = this.generativeModel.startChat();
    }

    // Send a message and receive a stream
    async sendMessageStream(prompt: string) {
        return this.chat.sendMessageStream(prompt);
    }
}