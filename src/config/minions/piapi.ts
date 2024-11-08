import axios from 'axios';
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
                    } else if (taskStatus === 'failed') {
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
            headers: { 'X-API-KEY': process.env.PIAPI_KEY }
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
                        const videoUrl = taskData.output.video.url;
                        clearInterval(intervalId);
                        console.log(`Task ${taskId} completed. Video URL: ${videoUrl}`);
                        resolve(videoUrl);
                    } else if (taskStatus === 'failed') {
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
    } catch (error) {
        console.error(error);  // Handle errors appropriately
        return null;           // Return null or error specific data
    }
}