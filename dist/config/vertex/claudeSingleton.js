"use strict";
/**
 * Claude Singleton Module
*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.claudeModel = void 0;
const vertex_sdk_1 = require("@anthropic-ai/vertex-sdk");
class ClaudeSingleton {
    // Private constructor
    constructor() { } // Prevent initialization
    // Static getter
    static getInstance() {
        if (!ClaudeSingleton.instance) {
            const projectId = 'oniooo-app';
            const region = 'us-east5';
            // Goes through the standard `google-auth-library` flow.
            const client = new vertex_sdk_1.AnthropicVertex({
                projectId,
                region,
            });
            ClaudeSingleton.instance = client;
        }
        return ClaudeSingleton.instance;
    }
}
// Static field
ClaudeSingleton.instance = null;
exports.claudeModel = ClaudeSingleton.getInstance();
