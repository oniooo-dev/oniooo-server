
/**
 * Tools for Claude
*/

import { Anthropic } from "@anthropic-ai/sdk"

const fluxProTool: Anthropic.Tool = {
    name: "fluxPro",
    description: "Generate a more realistic image based on a prompt. Takes a bit longer than Flux Schnell.",
    input_schema: {
        type: "object",
        properties: {
            prompt: {
                type: "string",
                description: "A detailed prompt to generate an image with.",
            },
        },
        required: ["prompt"],
    },
}

const fluxSchnellTool: Anthropic.Tool = {
    name: "fluxSchnell",
    description: "Generate a bulk of realistic images based on a prompt. Faster than Flux Pro and Stable Diffusion Large.",
    input_schema: {
        type: "object",
        properties: {
            prompt: {
                type: "string",
                description: "A detailed prompt to generate an image with.",
            },
            num_images: {
                type: "number",
                description: "The number of images to generate. Defaults to 1. Maximum is 4.",
            },
        },
        required: ["prompt", "num_images"],
    },
}

const stableDiffusionLargeTool: Anthropic.Tool = {
    name: "stableDiffusionLarge",
    description: "Generate a non-realistic image based on a prompt. Takes a bit longer than Flux Schnell.",
    input_schema: {
        type: "object",
        properties: {
            prompt: {
                type: "string",
                description: "A detailed prompt to generate an image with.",
            },
            negative_prompt: {
                type: "string",
                description: "A negative prompt to generate an image with.",
            },
            aspect_ratio: {
                type: "string",
                description: "The aspect ratio of the image to generate.",
            },
            output_format: {
                type: "string",
                description: "The output format of the image to generate.",
            },
        },
        required: ["prompt", "negative_prompt", "aspect_ratio", "output_format"],
    },
}

/**
 * TODO: Handle Image URI
*/

const fastUpscale: Anthropic.Tool = {
    name: "fastUpscale",
    description: "Upscale an image to a higher resolution.",
    input_schema: {
        type: "object",
        properties: {},
        required: [],
    },
}

const removeBackgroundTool: Anthropic.Tool = {
    name: "removeBackground",
    description: "Remove the background of an image.",
    input_schema: {
        type: "object",
        properties: {},
        required: [],
    },
}

/**
 * PiAPI Tools
*/

const lumaTool: Anthropic.Tool = {
    name: "luma",
    description: "Generate a video based on a prompt.",
    input_schema: {
        type: "object",
        properties: {
            prompt: {
                type: "string",
                description: "A detailed prompt to generate a video with.",
            },
        },
        required: ["prompt"],
    },
}

const sunoTool: Anthropic.Tool = {
    name: "suno",
    description: "Generate a music track based on a prompt.",
    input_schema: {
        type: "object",
        properties: {
            prompt: {
                type: "string",
                description: "A detailed prompt to generate a music track with.",
            },
        },
        required: ["prompt"],
    },
}

const klingTool: Anthropic.Tool = {
    name: "kling",
    description: "Generate a video based on a prompt.",
    input_schema: {
        type: "object",
        properties: {
            prompt: {
                type: "string",
                description: "A detailed prompt to generate a video with.",
            },
        },
        required: ["prompt"],
    },
}

export const tools: Anthropic.Tool[] = [
    fluxProTool,
    fluxSchnellTool,
    stableDiffusionLargeTool,
    fastUpscale,
    // removeBackgroundTool,
    lumaTool,
    // sunoTool,
    klingTool,
];
