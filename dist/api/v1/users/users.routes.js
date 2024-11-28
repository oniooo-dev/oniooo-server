"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const users_controllers_1 = require("./users.controllers");
const usersRoutes = (0, express_1.Router)();
// Handle chat routes
usersRoutes.get('/:userId', users_controllers_1.fetchUserData);
exports.default = usersRoutes;
