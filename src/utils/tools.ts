
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
    description: "Generate a bulk of realistic images based on a prompt. Faster than Flux Pro.",
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
            num_images: {
                type: "number",
                description: "The number of images to generate. Defaults to 1. Maximum is 4.",
            },
        },
        required: ["prompt", "num_images"],
    },
}

/**
 * TODO: Handle Image URI
*/

const fastUpscale: Anthropic.Tool = {
    name: "creativeUpscale",
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

export const tools: Anthropic.Tool[] = [
    fluxProTool,
    fluxSchnellTool,
    fastUpscale,
    // removeBackgroundTool
];
