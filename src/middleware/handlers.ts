import { Request, Response, NextFunction } from 'express';
import { DatabaseError, UserAuthError } from '../types/errors';

// For Auth API
export const authAsyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) => {
    return function (req: Request, res: Response, next: NextFunction) {
        fn(req, res, next).catch((error) => {
            // Assumes all the error codes are correct (stored in the custom-typed errors)
            // No direct error from Supabase should be thrown here
            if (error instanceof UserAuthError && typeof error.code === 'number') {
                res.status(error.code).json({ message: 'UserAuthError: ' + error.message });
            } else if (error instanceof DatabaseError && typeof error.code === 'number') {
                res.status(error.code).json({ message: 'Database Error: ' + error.message });
            } else if (error instanceof Error) {
                res.status(400).json({ message: 'An unexpected error occurred: ' + error.message });
            } else {
                res.status(500).json({ message: 'An unexpected error occurred.' });
            }
        });
    };
};

// For All API
export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
    if (err instanceof UserAuthError && typeof err.code === 'number') {
        res.status(err.code).json({ message: 'UserAuthError: ' + err.message });
    } else if (err instanceof DatabaseError && typeof err.code === 'number') {
        res.status(err.code).json({ message: 'Database Error: ' + err.message });
    } else if (err instanceof Error) {
        res.status(400).json({ message: 'An unexpected error occurred: ' + err.message });
    } else {
        res.status(500).json({ message: 'An unexpected error occurred.' });
    }
}
