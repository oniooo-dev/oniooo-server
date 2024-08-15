import { Request, Response } from 'express';
import { setSecureCookie } from '../../../lib/cookies';
import { authAsyncHandler } from '../../../middleware/handlers';
import { UserAuthError } from '../../../types/errors';
import { UserLoginRequest, UserLoginResponse, UserRegisterRequest, UserRegisterResponse } from './auth.models';
import * as AuthService from './auth.services';

export const registerController = authAsyncHandler(async (req: Request, res: Response) => {
    const { username, email, password }: UserRegisterRequest = req.body;
    
    // Attempt to register the user
    const { user, accessToken, refreshToken }: UserRegisterResponse = await AuthService.registerUserService({ username, email, password });

    // Validate the response from AuthService
    if (!user || !accessToken || !refreshToken) {
        throw new UserAuthError(401, 'Authentication failed, missing tokens or user data.');
    }

    // Set the access token in a cookie
    setSecureCookie(res, 'accessToken', accessToken);

    // Store the refresh token in the server session
    req.session.refreshToken = refreshToken;

    // Send the response containing the user's metadata
    res.status(200).json({ message: 'Successful Registration', user: user });
});

export const loginController = authAsyncHandler(async (req: Request, res: Response) => {
    const { email, password }: UserLoginRequest = req.body;
    const { user, accessToken, refreshToken }: UserLoginResponse = await AuthService.loginUserService({ email, password });

    if (!user || !accessToken || !refreshToken) {
        throw new UserAuthError(401, 'Authentication failed');
    }

    // Set the access token in a cookie
    setSecureCookie(res, 'accessToken', accessToken);

    // Store the refresh token in the server session
    req.session.refreshToken = refreshToken;

    // Send the response containing the user's metadata
    res.status(200).json({ message: 'Successful Login', user: user });
});

export const logoutController = authAsyncHandler(async (req: Request, res: Response) => {
    const response = await AuthService.logoutUser();

    // User logout successful
    // Destroy the session containing the refresh token
    req.session.destroy((err) => {
        if (err) {
            console.error('Session destroy error:', err);
            throw new UserAuthError(500, 'An unexpected error occurred.');
        }
    });

    // Clear the accessToken cookie
    res.clearCookie('accessToken');

    // Send the response
    res.status(200).json({ message: 'Successful Logout'});
});