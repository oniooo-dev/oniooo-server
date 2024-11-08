import axios from "axios";
import FormData from "form-data";
import dotenv from "dotenv";

dotenv.config();

export const stableDiffusion = async (prompt: string, negative_prompt: string, aspect_ratio: string, output_format: string) => {

    /**
     * Stable Diffusion 3.5 : https://platform.stability.ai/docs/api-reference#tag/Generate/paths/~1v2beta~1stable-image~1generate~1sd3/post
    */

    // Input
    const payload = {
        prompt: prompt,
        negative_prompt: negative_prompt,
        aspect_ratio: aspect_ratio,                // @param ["21:9", "16:9", "3:2", "5:4", "1:1", "4:5", "2:3", "9:16", "9:21"]
        output_format: output_format,              // @param ["jpeg", "png"]
        model: "sd3.5-large",
        mode: "text-to-image"
    };

    const response = await axios.postForm(
        `https://api.stability.ai/v2beta/stable-image/generate/sd3`,
        axios.toFormData(payload, new FormData()),
        {
            validateStatus: undefined,
            responseType: "arraybuffer",
            headers: {
                Authorization: `Bearer ${process.env.STABILITY_KEY}`,
                Accept: "image/*"
            },
        },
    );

    if (response.status === 200) {
        console.log(response.data);
        return response.data;
    } else {
        // Dispatch to Melody
        throw new Error(`${response.status}: ${response.data.toString()}`);
    }
}