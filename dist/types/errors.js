"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MelodyError = exports.UserAuthError = exports.DatabaseError = exports.ApiError = void 0;
class ApiError extends Error {
    constructor(code, message) {
        super(message);
        this.code = code;
        this.message = message;
        this.name = this.constructor.name;
    }
}
exports.ApiError = ApiError;
class DatabaseError extends ApiError {
    constructor(code, message) {
        super(code, message);
    }
}
exports.DatabaseError = DatabaseError;
class UserAuthError extends ApiError {
    constructor(code, message) {
        super(code, message);
    }
}
exports.UserAuthError = UserAuthError;
class MelodyError extends ApiError {
    constructor(code, message) {
        super(code, message);
    }
}
exports.MelodyError = MelodyError;
