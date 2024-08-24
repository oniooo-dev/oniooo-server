import 'express-session';

declare module 'express-session' {
    interface SessionData {
        visited: boolean;
        user?: User;
        accessToken?: string;
        refreshToken?: string;
    }
}

declare module 'express-serve-static-core' {
    interface Request {
        user?: User;
    }
}
