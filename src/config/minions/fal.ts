import { fal } from "@fal-ai/client";
import dotenv from "dotenv";

dotenv.config();

fal.config({
    // Can also be auto-configured using environment variables:
    // Either a single FAL_KEY or a combination of FAL_KEY_ID and FAL_KEY_SECRET
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

/**
 * NEED TO REFACTOR
*/

export const fluxPro = async (prompt: string) => {
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

    return result;
}

export const fluxSchnell = async (prompt: string, num_images: number) => {
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

    return result;
}