import * as fal from "@fal-ai/serverless-client";
import dotenv from "dotenv";

dotenv.config();

fal.config({
    // Can also be auto-configured using environment variables:
    // Either a single FAL_KEY or a combination of FAL_KEY_ID and FAL_KEY_SECRET
    credentials: process.env.FAL_KEY
});

export const generateQuickImages = async (prompt: string) => {
    const result = await fal.subscribe("fal-ai/flux-pro", {
        input: {
            prompt: prompt
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