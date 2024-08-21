class ApiError extends Error {
    constructor(public code: number, public message: string) {
        super(message);
        this.name = this.constructor.name;
    }
}

export class DatabaseError extends ApiError {
    constructor(code: number, message: string) {
        super(code, message);
    }
}

export class UserAuthError extends ApiError {
    constructor(code: number, message: string) {
        super(code, message);
    }
}

export class MelodyError extends ApiError {
    constructor(code: number, message: string) {
        super(code, message);
    }
}

export class AISError extends ApiError {
    constructor(code: number, message: string) {
        super(code, message);
    }
}
