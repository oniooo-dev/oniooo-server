"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadSSLCertificates = void 0;
const fs_1 = __importDefault(require("fs"));
const loadSSLCertificates = () => {
    if (process.env.NODE_ENV === 'production') {
        try {
            const key = fs_1.default.readFileSync('/etc/letsencrypt/live/api.oniooo.com/privkey.pem');
            const cert = fs_1.default.readFileSync('/etc/letsencrypt/live/api.oniooo.com/fullchain.pem');
            return { key, cert };
        }
        catch (err) {
            console.error('Error reading SSL files:', err);
            process.exit(1);
        }
    }
    return {};
};
exports.loadSSLCertificates = loadSSLCertificates;
