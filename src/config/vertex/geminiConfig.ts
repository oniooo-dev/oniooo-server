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

// Functions Gemini can call
export const functionDeclarations: Tool[] = [
    {
        functionDeclarations: [
            {
                name: "fluxPro",
                description: 'Text to Image Generation. Best for realistic images, or when the prompt involves fine detail, high fidelity, or text within images',
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
                description: 'Text to Image Generation. Demands that need to quickly generate lots of images that do not need to be very detailed but must be produced in bulk (MAX: 4 images) to have quicker results and lower cost.',
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
                    required: ['prompt'],
                }
            },
            {
                name: "luma",
                description: 'Generate a video from a text prompt.',
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
            {
                name: "suno",
                description: 'Generate song/music from a text prompt.',
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
            // {
            //     name: "stableDiffusion",
            //     description: 'Text to Image Generation. Versatile in styles, handling a wider range of visual aesthetics and open-ended creative prompts.',
            //     parameters: {
            //         type: FunctionDeclarationSchemaType.OBJECT,
            //         properties: {
            //             prompt: {
            //                 type: FunctionDeclarationSchemaType.STRING
            //             },
            //             negative_prompt: {
            //                 type: FunctionDeclarationSchemaType.STRING
            //             },
            //             aspect_ratio: {
            //                 type: FunctionDeclarationSchemaType.STRING
            //             },
            //             output_format: {
            //                 type: FunctionDeclarationSchemaType.STRING
            //             }
            //         },
            //         required: ['prompt'],
            //     }
            // },
        ],
    },
];