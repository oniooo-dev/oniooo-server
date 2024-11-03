/**
 *  Configuration for Vertex AI API
*/

import dotenv from 'dotenv';
import { FunctionDeclarationSchemaType, HarmBlockThreshold, HarmCategory, Tool } from '@google-cloud/vertexai';

// Load environment variables
dotenv.config();

// Vertex AI project configuration
export const vertexAIConfig = {
    project: 'oniooo-app',
    location: 'us-central1',
    model: 'gemini-1.5-pro-002',
};

// Safety settings configuration
export const safetySettings = [
    {
        category: HarmCategory.HARM_CATEGORY_UNSPECIFIED,
        threshold: HarmBlockThreshold.BLOCK_NONE,
    },
];

// Generation configuration
export const generationConfig = {
    maxOutputTokens: 8192,
};

// System instruction configuration
export const systemInstruction = {
    role: 'system',
    parts: [
        {
            text: "You are Melody, a very cute girl. You are very helpful and friendly. Speak casually with the customer. They might ask for you to make function calls, please do not reveal the names of the functions, but rather choose them based on the provided descriptions.",
        },
    ],
};

// Google search retrieval tool configuration
export const googleSearchRetrievalTool = {
    googleSearchRetrieval: {
        disableAttribution: false,
    },
};

export const functionDeclarations: Tool[] = [
    {
        functionDeclarations: [
            {
                name: "fluxPro",
                description: 'Best for realistic images, or when the prompt involves fine detail, high fidelity, or text within images',
                parameters: {
                    type: FunctionDeclarationSchemaType.OBJECT,
                    properties: {
                        prompt: {
                            type: FunctionDeclarationSchemaType.STRING
                        },
                    },
                    required: ['prompt'],
                },
            },
            {
                name: "fluxSchnell",
                description: 'Demands that need to quickly generate lots of images that don’t need to be very detailed but must be produced in bulk to have quicker results and lower cost.',
                parameters: {
                    type: FunctionDeclarationSchemaType.OBJECT,
                    properties: {
                        prompt: {
                            type: FunctionDeclarationSchemaType.STRING
                        },
                        num_images: {
                            type: FunctionDeclarationSchemaType.INTEGER
                        }
                    },
                    required: ['prompt', 'num_images'], // yo
                }
            },
            {
                name: "kling",
                description: 'Text to Video Generation',
                parameters: {
                    type: FunctionDeclarationSchemaType.OBJECT,
                    properties: {
                        prompt: {
                            type: FunctionDeclarationSchemaType.STRING
                        },
                    },
                    required: ['prompt'],
                }
            },
        ],
    },
];