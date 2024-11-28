"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.claudeModel = exports.generativeModel = void 0;
// Gemini
var geminiSingleton_1 = require("./geminiSingleton");
Object.defineProperty(exports, "generativeModel", { enumerable: true, get: function () { return geminiSingleton_1.generativeModel; } });
// Claude
var claudeSingleton_1 = require("./claudeSingleton");
Object.defineProperty(exports, "claudeModel", { enumerable: true, get: function () { return claudeSingleton_1.claudeModel; } });
