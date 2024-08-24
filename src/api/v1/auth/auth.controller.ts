import { Request, Response } from 'express';
import { authAsyncHandler } from '../../../middleware/handlers';
import { UserAuthError } from '../../../types/errors';
import { UserLoginRequest, UserLoginResponse, UserRegisterRequest, UserRegisterResponse } from './auth.models';
import * as AuthService from './auth.services';

export const register = authAsyncHandler(async (req: Request, res: Response) => {
    const { username, email, password }: UserRegisterRequest = req.body;
    const { user, accessToken, refreshToken }: UserRegisterResponse = await AuthService.register({ username, email, password });

    // Validate the response from AuthService
    if (!user || !accessToken || !refreshToken) {
        throw new UserAuthError(401, 'Authentication failed, missing tokens or user data.');
    }

    // Send the response containing the user's metadata
    res.status(200).json({ user: user });
});

export const login = authAsyncHandler(async (req: Request, res: Response) => {
    console.log('Logging in user...');
    console.log(req.session);
    console.log('Session ID : ' + req.session.id);
    req.session.visited = true;

    const { email, password }: UserLoginRequest = req.body;
    const { user, accessToken, refreshToken }: UserLoginResponse = await AuthService.login({ email, password });

    // Validate the response from AuthService
    if (!user || !accessToken || !refreshToken) {
        throw new UserAuthError(401, 'Authentication failed');
    }

    req.session.user = user;
    req.session.accessToken = accessToken;
    req.session.refreshToken = refreshToken;

    // Send the response containing the user's metadata
    res.status(200).json({ user: user });
});

export const logout = authAsyncHandler(async (req: Request, res: Response) => {
    const response = await AuthService.logout();

    // Validate the response from AuthService
    // ...

    // Destroy the session containing the refresh token
    req.session.destroy((err) => {
        if (err) {
            console.error('Session destroy error:', err);
            throw new UserAuthError(500, 'An unexpected error occurred.');
        }
    });

    // Send the response
    res.status(200).json({ message: 'Successful Logout' });
});
