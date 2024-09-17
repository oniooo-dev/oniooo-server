import dotenv from 'dotenv';
import { VertexAI, HarmBlockThreshold, HarmCategory, FunctionDeclarationSchemaType } from '@google-cloud/vertexai';

dotenv.config();

const project = 'oniooo-app';
const location = 'us-central1';
const textModel = 'gemini-1.5-flash';
const dataStoreId = 'test-melody-datastore_1725667451705';

// Initialize Vertex with your Cloud project and location
const vertexAI = new VertexAI({ project: project, location: location });

// Define safety settings for the model
const safetySettings = [
    {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
];

// Define the retrieval tool
const vertexAIRetrievalTool = {
    retrieval: {
        vertexAiSearch: {
            datastore: `projects/${project}/locations/global/collections/default_collection/dataStores/${dataStoreId}`,
        },
        disableAttribution: false,
    },
};

const functionDeclarations = [];

// Instantiate the models
export const generativeModel = vertexAI.getGenerativeModel({
    model: textModel,
    // The following parameters are optional
    // They can also be passed to individual content generation requests
    safetySettings: safetySettings,
    generationConfig: { maxOutputTokens: 256 },
    systemInstruction: {
        role: 'system',
        parts: [
            {
                text: process.env.VERY_COOL_PROMPT as string,
            },
        ],
    },
    tools: [vertexAIRetrievalTool],
});

export const generativeModelPreview = vertexAI.preview.getGenerativeModel({
    model: textModel,
});

const googleSearchRetrievalTool = {
    googleSearchRetrieval: {},
};
