import { fal } from "@fal-ai/client";
import dotenv from "dotenv";
import { inspect } from "util";

dotenv.config();

fal.config({
    credentials: process.env.FAL_KEY
});

// Result: {
//     images: [
//       {
//         url: 'https://fal.media/files/lion/5xrmpkd_8zGpZlbMZUeqt_c54e9c6b9f144c9a9f9d7fea061def6b.jpg',
//         width: 1024,
//         height: 768,
//         content_type: 'image/jpeg'
//       }
//     ],
//     timings: {},
//     seed: 2097926860,
//     has_nsfw_concepts: [ false ],
//     prompt: 'dwjaiofjwaiofjwaiojfwa'
// }

export const fluxPro = async (prompt: string) => {

    /**
     * Flux Pro 1.1 : https://fal.ai/models/fal-ai/flux-pro/v1.1/api
    */

    // Generate a single very cool image
    const result = await fal.subscribe("fal-ai/flux-pro", {
        input: {
            prompt: prompt,
        },
        logs: true,
        onQueueUpdate: (update) => {
            if (update.status === "IN_PROGRESS") {
                update.logs.map((log) => log.message).forEach(console.log);
            }
        },
    });

    console.log(`result: ${inspect(result)}`);

    const imageUrl = result.data.images[0].url;

    console.log(`imageUrl: ${imageUrl}`);

    return imageUrl;
}

export const fluxSchnell = async (prompt: string, num_images: number) => {

    /**
     * Flux Schnell : https://fal.ai/models/fal-ai/flux/schnell/api
    */

    // Generate a bulk of decent images
    const result = await fal.subscribe("fal-ai/flux/schnell", {
        input: {
            prompt: prompt,
            num_images: num_images,
        },
        logs: true,
        onQueueUpdate: (update) => {
            if (update.status === "IN_PROGRESS") {
                update.logs.map((log) => log.message).forEach(console.log);
            }
        },
    });

    console.log(`result: ${inspect(result)}`);

    return result.data.images;
}
