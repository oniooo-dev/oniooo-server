"use strict";
/**
 * Controller Layer for Melody API Route
*/
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteMelodyChat = exports.updateMelodyChat = exports.fetchMelodyChatMessages = exports.createMelodyChatMessage = exports.fetchMelodyChats = exports.createMelodyChat = void 0;
const MelodyService = __importStar(require("./melody.services"));
const errors_1 = require("../../../types/errors");
// Create chat
const createMelodyChat = async (req, res, next) => {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        const { firstPrompt, modelName } = req.body;
        const { newChat, newMessage } = await MelodyService.createMelodyChat(userId, firstPrompt, modelName);
        if (!newChat) {
            throw new errors_1.MelodyError(500, 'Internal server error');
        }
        if (!newMessage) {
            throw new errors_1.MelodyError(500, 'Internal server error');
        }
        res.status(200).json({
            newChat,
            newMessage,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createMelodyChat = createMelodyChat;
// Fetch chat history
const fetchMelodyChats = async (req, res, next) => {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        const chats = await MelodyService.fetchChats(userId);
        if (!chats) {
            throw new errors_1.MelodyError(500, 'Internal server error');
        }
        res.status(200).json({
            chats,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.fetchMelodyChats = fetchMelodyChats;
// Create chat message
const createMelodyChatMessage = async (req, res, next) => {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        const { chatId } = req.params;
        const { message } = req.body;
        const newMessage = await MelodyService.createChatMessage(userId, chatId, message);
        // Send to Client
        res.status(200).json({
            newMessage,
        });
    }
    catch (error) {
        console.log(error);
        next(error);
    }
};
exports.createMelodyChatMessage = createMelodyChatMessage;
// Fetch messages by chat ID
const fetchMelodyChatMessages = async (req, res, next) => {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        const chatId = req.params.chatId;
        const messages = await MelodyService.fetchChatMessages(userId, chatId);
        res.status(200).json({
            messages,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.fetchMelodyChatMessages = fetchMelodyChatMessages;
// Update chat title
const updateMelodyChat = async (req, res, next) => {
    try {
        const { chatId } = req.params;
        const { title } = req.body;
        const updatedChat = await MelodyService.updateChatTitle(chatId, title);
        res.status(200).json({
            updatedChat,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateMelodyChat = updateMelodyChat;
// Delete chat
const deleteMelodyChat = async (req, res, next) => {
    try {
        const { chatId } = req.params;
        await MelodyService.deleteChat(chatId);
        res.status(200).json({
            message: 'Chat deleted',
        });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteMelodyChat = deleteMelodyChat;
