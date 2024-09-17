import { FunctionDeclarationSchemaType, GenerativeModel, HarmBlockThreshold, HarmCategory, VertexAI } from '@google-cloud/vertexai';

const project = 'your-cloud-project';
const location = 'us-central1';
const textModel = 'gemini-1.5-flash-001';
// const visionModel = 'gemini-1.0-pro-vision';

const vertexAI = new VertexAI({ project: project, location: location });

const safetySettings = [{
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
}]

const generationConfig = {
    maxOutputTokens: 256,
}

const systemInstruction = {
    role: 'system',
    parts: [{ "text": `For example, you are a helpful customer service agent.` }]
}

// Instantiate Gemini models
const generativeModel = vertexAI.getGenerativeModel({
    model: textModel,
    // The following parameters are optional
    // They can also be passed to individual content generation requests
    safetySettings: safetySettings,
    generationConfig: generationConfig,
    systemInstruction: systemInstruction,
});

class Melody {
    generativeModel: GenerativeModel;
    
    constructor() {
        this.generativeModel = generativeModel;
    }
}

export default Melody;