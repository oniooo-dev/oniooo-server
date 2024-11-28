"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const users_routes_1 = __importDefault(require("./users/users.routes"));
const melody_routes_1 = __importDefault(require("./melody/melody.routes"));
const authenticate_1 = require("../../middlewares/authenticate");
const router = (0, express_1.Router)();
// API Routes
router.use('/users', users_routes_1.default);
router.use('/melody', authenticate_1.authenticate, melody_routes_1.default);
exports.default = router;
