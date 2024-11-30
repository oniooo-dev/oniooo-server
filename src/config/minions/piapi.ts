import axios, { AxiosResponse } from 'axios';
import dotenv from "dotenv";

dotenv.config();

export const luma = async (prompt: string) => {

    // API Request Data
    const data = {
        "model": "luma",
        "task_type": "video_generation",
        "input": {
            "prompt": prompt,
            "expand_prompt": false,
            "loop": true
        },
        "config": {
            "service_mode": "",
            "webhook_config": {
                "endpoint": "",
                "secret": ""
            }
        }
    };

    try {
        let response = await axios.post('https://api.piapi.ai/api/v1/task', data, {
            headers: {
                'X-API-KEY': process.env.PIAPI_KEY
            }
        });

        console.log(`POST /task status: ${response.status}`);
        console.log(`Task created:`, response.data);

        response = response.data

        const taskId = response.data.task_id;

        console.log('Found task id: ' + taskId);

        // Start polling
        return new Promise((resolve, reject) => {
            const intervalId = setInterval(async () => {
                try {
                    const statusResponse = await axios.get(
                        `https://api.piapi.ai/api/v1/task/${taskId}`,
                        {
                            headers: {
                                'X-API-KEY': process.env.PIAPI_KEY
                            }
                        }
                    );

                    const taskData = statusResponse.data.data;
                    const taskStatus = taskData.status.toLowerCase();

                    console.log(`Polling task ${taskId}, status: ${taskStatus}`);

                    if (taskStatus === 'completed') {
                        const videoUrl = taskData.output.video.url;
                        clearInterval(intervalId);
                        console.log(`Task ${taskId} completed. Video URL: ${videoUrl}`);
                        resolve(videoUrl);
                    }
                    else if (taskStatus === 'failed') {
                        clearInterval(intervalId);
                        console.error(`Task ${taskId} failed.`);
                        reject(new Error(`Task ${taskId} failed.`));
                    }
                    // You can handle other statuses if necessary
                } catch (error) {
                    console.error(`Error checking status of task ${taskId}:`, error);
                    clearInterval(intervalId);
                    reject(error);
                }
            }, 5000); // Poll every 5 seconds
        });
    }
    catch (error) {
        console.error(error);         // Log or handle errors
        throw error;                  // You might want to return null or a custom error object
    }
}

export const suno = async (prompt: string) => {

    // API Request Data
    const data = {
        "model": "suno",
        "task_type": "generate_music",
        "input": {
            "gpt_description_prompt": prompt,
            "make_instrumental": true,
            "model_version": "chirp-v3-0"
        },
        "config": {
            "service_mode": "",
            "webhook_config": {
                "endpoint": "",
                "secret": ""
            }
        }
    };

    try {
        let response = await axios.post('https://api.piapi.ai/api/v1/task', data, {
            headers: {
                'X-API-KEY': process.env.PIAPI_KEY
            }
        });

        console.log(`POST /task status: ${response.status}`);
        console.log(`Task created:`, response.data);

        response = response.data

        const taskId: string = response.data.task_id;

        if (!taskId) {
            throw new Error('No task_id returned from PiAPI.');
        }

        console.log('Found task id: ' + taskId);

        // Start polling
        return new Promise((resolve, reject) => {
            const intervalId = setInterval(async () => {
                try {
                    const statusResponse = await axios.get(
                        `https://api.piapi.ai/api/v1/task/${taskId}`,
                        {
                            headers: {
                                'X-API-KEY': process.env.PIAPI_KEY
                            }
                        }
                    );

                    const taskData = statusResponse.data.data;
                    const taskStatus = taskData.status.toLowerCase();

                    console.log(`Polling task ${taskId}, status: ${taskStatus}`);

                    if (taskStatus === 'completed') {
                        // Task completed successfully
                        const clips = taskData.output.clips;
                        const clipKeys = Object.keys(clips);

                        if (clipKeys.length === 0) {
                            clearInterval(intervalId);
                            console.error(`Task ${taskId} completed but no clips found.`);
                            reject(new Error(`Task ${taskId} completed but no clips found.`));
                            return;
                        }

                        // Assuming you want the first clip's video_url
                        const firstClipKey = clipKeys[0];
                        const firstClip = clips[firstClipKey];
                        const videoUrl = firstClip.video_url;

                        if (videoUrl) {
                            clearInterval(intervalId);
                            console.log(`Task ${taskId} completed. Video URL: ${videoUrl}`);
                            resolve(videoUrl); // Resolve the promise with the videoUrl
                        } else {
                            clearInterval(intervalId);
                            console.error(`Task ${taskId} completed but no video URL found.`);
                            reject(new Error(`Task ${taskId} completed but no video URL found.`));
                        }
                    } else if (taskStatus === 'failed') {
                        // Task failed
                        clearInterval(intervalId);
                        console.error(`Task ${taskId} failed.`);
                        reject(new Error(`Task ${taskId} failed.`));
                    } else {
                        // Task is still in progress
                        console.log(`Task ${taskId} is still in progress.`);
                    }

                    // You can handle other statuses if necessary
                } catch (error) {
                    console.error(`Error checking status of task ${taskId}:`, error);
                    clearInterval(intervalId);
                    reject(error);
                }
            }, 5000); // Poll every 5 seconds
        });
    } catch (error) {
        console.error(error);  // Handle errors appropriately
        return null;           // Return null or error specific data
    }
}

// Define the interface for the response data
interface PiApiResponse {
    code: number;
    data: {
        task_id?: string;
        model: string;
        task_type: string;
        status: string;
        config: {
            service_mode: string;
            webhook_config: {
                endpoint: string;
                secret: string;
            };
        };
        input: Record<string, any>;
        output: {
            type: string;
            status: number;
            works: Array<{
                status: number;
                type: string;
                cover: {
                    resource: string;
                    resource_without_watermark: string;
                    height: number;
                    width: number;
                    duration: number;
                };
                video: {
                    resource: string;
                    resource_without_watermark: string;
                    height: number;
                    width: number;
                    duration: number;
                };
            }>;
        };
        meta: Record<string, any>;
        detail: any;
        logs: any[];
        error: {
            code: number;
            raw_message: string;
            message: string;
            detail: any;
        };
    };
    message: string;
}

export const kling = async (prompt: string) => {

    // API Request Data
    const data = {
        "model": "kling",
        "task_type": "video_generation",
        "input": {
            "prompt": prompt,
            "negative_prompt": "",
            "cfg_scale": 0.5,
            "duration": 5,
            "aspect_ratio": "1:1",
            "camera_control": {
                "type": "simple",
                "config": {
                    "horizontal": 0,
                    "vertical": 0,
                    "pan": -10,
                    "tilt": 0,
                    "roll": 0,
                    "zoom": 0
                }
            },
            "mode": "std"
        },
        "config": {
            "service_mode": "",
            "webhook_config": {
                "endpoint": "",
                "secret": ""
            }
        }
    };

    try {
        const response: AxiosResponse<PiApiResponse> = await axios.post(
            'https://api.piapi.ai/api/v1/task',
            data,
            {
                headers: {
                    'Content-Type': 'application/json', // Ensure Content-Type is set
                    'X-API-KEY': process.env.PIAPI_KEY
                }
            }
        );

        console.log(`POST /task status: ${response.status}`);
        console.log(`Response data:`, response.data);

        const taskId = response.data.data.task_id;

        if (!taskId) {
            console.error('Response does not contain task_id:', response.data);
            throw new Error('No task_id returned from PiAPI.');
        }

        console.log('Found task id: ' + taskId);

        // Start polling
        return new Promise<string>((resolve, reject) => {
            const intervalId = setInterval(async () => {
                try {
                    const statusResponse = await axios.get(
                        `https://api.piapi.ai/api/v1/task/${taskId}`,
                        {
                            headers: {
                                'X-API-KEY': process.env.PIAPI_KEY
                            }
                        }
                    );

                    const taskData = statusResponse.data.data;
                    const taskStatus = taskData.status.toLowerCase();

                    console.log(`Polling task ${taskId}, status: ${taskStatus}`);

                    if (taskStatus === 'completed') {
                        // Access the video URL from the works array
                        if (
                            taskData.output &&
                            taskData.output.works &&
                            taskData.output.works.length > 0 &&
                            taskData.output.works[0].video &&
                            taskData.output.works[0].video.resource
                        ) {
                            const videoUrl = taskData.output.works[0].video.resource;
                            clearInterval(intervalId);
                            console.log(`Task ${taskId} completed. Video URL: ${videoUrl}`);
                            resolve(videoUrl);
                        } else {
                            clearInterval(intervalId);
                            console.error(`Task ${taskId} completed but video URL is missing.`);
                            reject(new Error(`Task ${taskId} completed but video URL is missing.`));
                        }
                    }
                    else if (taskStatus === 'failed') {
                        clearInterval(intervalId);
                        console.error(`Task ${taskId} failed.`);
                        reject(new Error(`Task ${taskId} failed.`));
                    }
                    // You can handle other statuses if necessary
                } catch (error) {
                    console.error(`Error checking status of task ${taskId}:`, error);
                    clearInterval(intervalId);
                    reject(error);
                }
            }, 5000); // Poll every 5 seconds

            // Optional: Add a timeout to prevent infinite polling
            const pollingTimeout = 600000; // 10 minutes
            setTimeout(() => {
                clearInterval(intervalId);
                console.error(`Polling timed out after ${pollingTimeout / 1000} seconds.`);
                reject(new Error('Polling timed out.'));
            }, pollingTimeout);
        });
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error('Axios error:', error.response?.data);
        } else {
            console.error('Unexpected error:', error);
        }
        throw error; // Re-throw the error after logging
    }
}