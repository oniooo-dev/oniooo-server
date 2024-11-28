import fs from "node:fs";
import axios from "axios";
import FormData from "form-data";
import dotenv from "dotenv";
import { s3Client } from "../aws"; // Adjust the import path if necessary
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from 'uuid'; // Ensure you install this package
import path from 'path';
import os from 'os';
import { promisify } from 'util';
import { pipeline } from 'stream';

dotenv.config();

const streamPipeline = promisify(pipeline);

/**
 * Checks if a string is a valid URL.
 * @param str - The string to check.
 * @returns True if the string is a URL, false otherwise.
 */
const isValidUrl = (str: string): boolean => {
    try {
        new URL(str);
        return true;
    } catch (_) {
        return false;
    }
};

/**
 * Downloads an image from a URL to a temporary local file.
 * @param url - The URL of the image.
 * @returns The path to the downloaded image.
 */
const downloadImage = async (url: string): Promise<string> => {
    const response = await axios.get(url, { responseType: 'stream' });

    if (response.status !== 200) {
        throw new Error(`Failed to download image from ${url}: Status ${response.status}`);
    }

    const tempFilePath = path.join(os.tmpdir(), `downloaded_${Date.now()}${path.extname(url)}`);
    const writer = fs.createWriteStream(tempFilePath);

    await streamPipeline(response.data, writer);
    return tempFilePath;
};

export const stableDiffusion = async (
    prompt: string,
    negative_prompt: string,
    aspect_ratio: string,
    output_format: string
) => {

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
        console.log("Image received from Stability AI.");

        // Convert arraybuffer to Buffer
        const imageBuffer = Buffer.from(response.data, 'binary');

        // Generate a unique filename
        const fileName = `stable_diffusion_${uuidv4()}.${output_format}`;

        // Define S3 bucket and key
        const bucketName = process.env.AWS_S3_BUCKET_NAME!;
        const key = `images/${fileName}`;

        // Upload to S3
        const putCommand = new PutObjectCommand({
            Bucket: bucketName,
            Key: key,
            Body: imageBuffer,
            ContentType: `image/${output_format}`,
        });

        try {
            await s3Client.send(putCommand);
            console.log(`Image uploaded to S3 at ${key}`);

            // Construct the S3 URL
            const s3Url = `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

            return s3Url;
        }
        catch (error) {
            console.error('Error uploading image to S3:', error);
            throw new Error('Failed to upload image to S3.');
        }

    }
    else {
        // Dispatch to Melody
        throw new Error(`${response.status}: ${response.data.toString()}`);
    }
}

export const fastUpscale = async (image: string) => {

    /**
     * Creative Upscale : https://platform.stability.ai/docs/api-reference#tag/Generate/paths/~1v2beta~1creative-image~1generate~1upscale/post
    */

    // Input
    console.log("Image:", image);

    const payload = {
        image: fs.createReadStream(image),
        output_format: "jpeg"
    };

    const response = await axios.postForm(
        `https://api.stability.ai/v2beta/stable-image/upscale/fast`,
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
        console.log("Upscale Response received from Stability AI.");

        // Convert arraybuffer to Buffer
        const upscaleBuffer = Buffer.from(response.data, 'binary');

        // Generate a unique filename for the upscaled image
        const upscaleFileName = `upscaled_${uuidv4()}.jpeg`;

        // Define S3 bucket and key
        const bucketName = process.env.AWS_S3_BUCKET_NAME!;
        const upscaleKey = `upscaled_images/${upscaleFileName}`;

        // Upload to S3
        const putUpscaleCommand = new PutObjectCommand({
            Bucket: bucketName,
            Key: upscaleKey,
            Body: upscaleBuffer,
            ContentType: "image/jpeg",
        });

        try {
            await s3Client.send(putUpscaleCommand);
            console.log(`Upscaled image uploaded to S3 at ${upscaleKey}`);

            // Construct the S3 URL
            const s3UpscaleUrl = `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${upscaleKey}`;

            return s3UpscaleUrl;
        }
        catch (error) {
            console.error('Error uploading upscaled image to S3:', error);
            throw new Error('Failed to upload upscaled image to S3.');
        }

    }
    else {
        console.log(response.data);
        throw new Error(`${response.status}: ${response.data.toString()}`);
    }
}

/**
 * Removes the background from an image.
 * @param image - The local file path or URL of the image.
 * @returns The URL to the processed image in S3.
 */
export const removeBackground = async (image: string): Promise<string> => {
    let localImagePath: string | undefined;

    // Check if the image is a URL
    if (isValidUrl(image)) {
        localImagePath = await downloadImage(image);
    } else {
        localImagePath = image;
    }

    // Prepare payload
    const payload = {
        image: fs.createReadStream(localImagePath),
        output_format: "jpeg"
    };

    try {
        const response = await axios.postForm(
            `https://api.stability.ai/v2beta/stable-image/edit/remove-background`,
            payload,
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
            console.log("Remove Background Response received from Stability AI.");

            // Convert arraybuffer to Buffer
            const removeBackgroundBuffer = Buffer.from(response.data, 'binary');

            // Generate a unique filename for the processed image
            const removeBackgroundFileName = `remove_background_${uuidv4()}.jpeg`;

            // Define S3 bucket and key
            const bucketName = process.env.AWS_S3_BUCKET_NAME!;
            const removeBackgroundKey = `remove_background_images/${removeBackgroundFileName}`;

            // Upload to S3
            const putRemoveBackgroundCommand = new PutObjectCommand({
                Bucket: bucketName,
                Key: removeBackgroundKey,
                Body: removeBackgroundBuffer,
                ContentType: "image/jpeg",
            });

            await s3Client.send(putRemoveBackgroundCommand);
            console.log(`Processed image uploaded to S3 at ${removeBackgroundKey}`);

            // Construct the S3 URL
            const s3RemoveBackgroundUrl = `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${removeBackgroundKey}`;

            return s3RemoveBackgroundUrl;
        } else {
            console.log(response.data);
            throw new Error(`${response.status}: ${response.data.toString()}`);
        }
    } finally {
        // If the image was downloaded as a temporary file, delete it
        if (localImagePath && isValidUrl(image)) {
            fs.unlink(localImagePath, (err) => {
                if (err) {
                    console.error(`Failed to delete temporary file: ${localImagePath}`, err);
                }
            });
        }
    }
};