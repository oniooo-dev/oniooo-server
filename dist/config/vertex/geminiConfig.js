"use strict";
/**
 *  Configuration for Vertex AI API
*/
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.functionDeclarations = exports.googleSearchRetrievalTool = exports.systemInstruction = exports.generationConfig = exports.safetySettings = exports.vertexAIConfig = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const vertexai_1 = require("@google-cloud/vertexai");
// Load environment variables
dotenv_1.default.config();
// Vertex AI project configuration
exports.vertexAIConfig = {
    project: 'oniooo-app',
    location: 'us-central1',
    model: 'gemini-1.5-pro-002',
};
// Safety settings configuration
exports.safetySettings = [
    {
        category: vertexai_1.HarmCategory.HARM_CATEGORY_UNSPECIFIED,
        threshold: vertexai_1.HarmBlockThreshold.BLOCK_NONE,
    },
];
// Generation configuration
exports.generationConfig = {
    maxOutputTokens: 8192,
};
// System instruction configuration
exports.systemInstruction = {
    role: 'system',
    parts: [
        {
            text: "You are Melody, a very cute girl. You are very helpful and friendly. Speak casually with the customer. They might ask for you to make function calls, please do not reveal the names of the functions, but rather choose them based on the provided descriptions.",
        },
    ],
};
// Google search retrieval tool configuration
exports.googleSearchRetrievalTool = {
    googleSearchRetrieval: {
        disableAttribution: false,
    },
};
// Functions Gemini can call
exports.functionDeclarations = [
    {
        functionDeclarations: [
            {
                name: "fluxPro",
                description: 'Text to Image Generation. Best for realistic images, or when the prompt involves fine detail, high fidelity, or text within images',
                parameters: {
                    type: vertexai_1.FunctionDeclarationSchemaType.OBJECT,
                    properties: {
                        prompt: {
                            type: vertexai_1.FunctionDeclarationSchemaType.STRING
                        },
                    },
                    required: ['prompt'],
                },
            },
            {
                name: "fluxSchnell",
                description: 'Text to Image Generation. Demands that need to quickly generate lots of images that do not need to be very detailed but must be produced in bulk (MAX: 4 images) to have quicker results and lower cost.',
                parameters: {
                    type: vertexai_1.FunctionDeclarationSchemaType.OBJECT,
                    properties: {
                        prompt: {
                            type: vertexai_1.FunctionDeclarationSchemaType.STRING
                        },
                        num_images: {
                            type: vertexai_1.FunctionDeclarationSchemaType.INTEGER
                        }
                    },
                    required: ['prompt'],
                }
            },
            {
                name: "luma",
                description: 'Generate a video from a text prompt.',
                parameters: {
                    type: vertexai_1.FunctionDeclarationSchemaType.OBJECT,
                    properties: {
                        prompt: {
                            type: vertexai_1.FunctionDeclarationSchemaType.STRING
                        },
                    },
                    required: ['prompt'],
                }
            },
            {
                name: "suno",
                description: 'Generate a song or music from a text prompt.',
                parameters: {
                    type: vertexai_1.FunctionDeclarationSchemaType.OBJECT,
                    properties: {
                        prompt: {
                            type: vertexai_1.FunctionDeclarationSchemaType.STRING
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
