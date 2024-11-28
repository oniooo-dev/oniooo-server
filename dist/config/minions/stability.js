"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.stableDiffusion = void 0;
const axios_1 = __importDefault(require("axios"));
const form_data_1 = __importDefault(require("form-data"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const stableDiffusion = async (prompt, negative_prompt, aspect_ratio, output_format) => {
    /**
     * Stable Diffusion 3.5 : https://platform.stability.ai/docs/api-reference#tag/Generate/paths/~1v2beta~1stable-image~1generate~1sd3/post
    */
    // Input
    const payload = {
        prompt: prompt,
        negative_prompt: negative_prompt,
        aspect_ratio: aspect_ratio, // @param ["21:9", "16:9", "3:2", "5:4", "1:1", "4:5", "2:3", "9:16", "9:21"]
        output_format: output_format, // @param ["jpeg", "png"]
        model: "sd3.5-large",
        mode: "text-to-image"
    };
    const response = await axios_1.default.postForm(`https://api.stability.ai/v2beta/stable-image/generate/sd3`, axios_1.default.toFormData(payload, new form_data_1.default()), {
        validateStatus: undefined,
        responseType: "arraybuffer",
        headers: {
            Authorization: `Bearer ${process.env.STABILITY_KEY}`,
            Accept: "image/*"
        },
    });
    if (response.status === 200) {
        console.log(response.data);
        return response.data;
    }
    else {
        // Dispatch to Melody
        throw new Error(`${response.status}: ${response.data.toString()}`);
    }
};
exports.stableDiffusion = stableDiffusion;
