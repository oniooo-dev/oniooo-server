import { Response } from 'express';

/**
 * Sets a secure cookie on the response object.
 * @param {Response} res - The Express response object.
 * @param {string} name - The name of the cookie.
 * @param {string} value - The value of the cookie.
 */
export const setSecureCookie = (res: Response, name: string, value: string | undefined) => {
    res.cookie(name, value, {
        httpOnly: true,
        secure: true,
        maxAge: 3600000, // 1 hour
    });
};