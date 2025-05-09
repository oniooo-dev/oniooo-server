"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.suno = exports.luma = void 0;
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const luma = async (prompt) => {
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
        let response = await axios_1.default.post('https://api.piapi.ai/api/v1/task', data, {
            headers: {
                'X-API-KEY': process.env.PIAPI_KEY
            }
        });
        console.log(`POST /task status: ${response.status}`);
        console.log(`Task created:`, response.data);
        response = response.data;
        const taskId = response.data.task_id;
        console.log('Found task id: ' + taskId);
        // Start polling
        return new Promise((resolve, reject) => {
            const intervalId = setInterval(async () => {
                try {
                    const statusResponse = await axios_1.default.get(`https://api.piapi.ai/api/v1/task/${taskId}`, {
                        headers: {
                            'X-API-KEY': process.env.PIAPI_KEY
                        }
                    });
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
                }
                catch (error) {
                    console.error(`Error checking status of task ${taskId}:`, error);
                    clearInterval(intervalId);
                    reject(error);
                }
            }, 5000); // Poll every 5 seconds
        });
    }
    catch (error) {
        console.error(error); // Log or handle errors
        throw error; // You might want to return null or a custom error object
    }
};
exports.luma = luma;
const suno = async (prompt) => {
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
        let response = await axios_1.default.post('https://api.piapi.ai/api/v1/task', data, {
            headers: { 'X-API-KEY': process.env.PIAPI_KEY }
        });
        console.log(`POST /task status: ${response.status}`);
        console.log(`Task created:`, response.data);
        response = response.data;
        const taskId = response.data.task_id;
        if (!taskId) {
            throw new Error('No task_id returned from PiAPI.');
        }
        console.log('Found task id: ' + taskId);
        // Start polling
        return new Promise((resolve, reject) => {
            const intervalId = setInterval(async () => {
                try {
                    const statusResponse = await axios_1.default.get(`https://api.piapi.ai/api/v1/task/${taskId}`, {
                        headers: {
                            'X-API-KEY': process.env.PIAPI_KEY
                        }
                    });
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
                        }
                        else {
                            clearInterval(intervalId);
                            console.error(`Task ${taskId} completed but no video URL found.`);
                            reject(new Error(`Task ${taskId} completed but no video URL found.`));
                        }
                    }
                    else if (taskStatus === 'failed') {
                        // Task failed
                        clearInterval(intervalId);
                        console.error(`Task ${taskId} failed.`);
                        reject(new Error(`Task ${taskId} failed.`));
                    }
                    else {
                        // Task is still in progress
                        console.log(`Task ${taskId} is still in progress.`);
                    }
                    // You can handle other statuses if necessary
                }
                catch (error) {
                    console.error(`Error checking status of task ${taskId}:`, error);
                    clearInterval(intervalId);
                    reject(error);
                }
            }, 5000); // Poll every 5 seconds
        });
    }
    catch (error) {
        console.error(error); // Handle errors appropriately
        return null; // Return null or error specific data
    }
};
exports.suno = suno;
