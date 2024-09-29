import { VertexAI, FunctionDeclarationSchemaType } from '@google-cloud/vertexai';

export const functionDeclarations = [
    {
        function_declarations: [
            {
                name: 'generateQuickImages',
                description: 'generate an image quickly',
                parameters: {
                    type: FunctionDeclarationSchemaType.OBJECT,
                    properties: {
                        location: { type: FunctionDeclarationSchemaType.STRING },
                        unit: {
                            type: FunctionDeclarationSchemaType.STRING,
                            enum: ['celsius', 'fahrenheit'],
                        },
                    },
                    required: ['location'],
                },
            },
        ],
    },
];

const functionResponseParts = [
    {
        functionResponse: {
            name: 'get_current_weather',
            response: { name: 'get_current_weather', content: { weather: 'super nice' } },
        },
    },
];