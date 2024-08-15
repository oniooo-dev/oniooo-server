import { Request, Response, NextFunction } from 'express';
import { UserAuthError, DatabaseError } from '../types/errors';

// For registration, login and logout
export const authAsyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) => {
    return function (req: Request, res: Response, next: NextFunction) {
        fn(req, res, next).catch((error) => {
            // Assumes all the error codes are correct (stored in the custom-typed errors)
            // No direct error from Supabase should be thrown here
            if (error instanceof UserAuthError && typeof error.code === 'number') {
                return res.status(error.code).json({ message: 'UserAuthError: ' + error.message });
            } else if (error instanceof DatabaseError && typeof error.code === 'number') {
                res.status(error.code).json({ message: 'Database Error: ' + error.message });
            } else if (error instanceof Error) {
                return res.status(400).json({ message: 'An unexpected error occurred: ' + error.message });
            } else {
                return res.status(500).json({ message: 'An unexpected error occurred.' });
            }
        });
    };
};