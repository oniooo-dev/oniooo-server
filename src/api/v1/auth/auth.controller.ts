import dotenv from 'dotenv';
import { Request, Response } from 'express';
import supabase from '../../../configs/supabase/supabase';
import { authAsyncHandler } from '../../../middleware/handlers';
import { UserAuthError } from '../../../types/errors';
import { UserLoginRequest, UserLoginResponse, UserRegisterRequest, UserRegisterResponse } from './auth.models';
import * as AuthService from './auth.services';

dotenv.config();

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
    const { email, password }: UserLoginRequest = req.body;
    const { user, accessToken, refreshToken }: UserLoginResponse = await AuthService.login({ email, password });

    // Validate the response from AuthService
    if (!user || !accessToken || !refreshToken) {
        throw new UserAuthError(401, 'Authentication failed');
    }

    // Send the response containing the user's metadata
    res.status(200).json({ user: user });
});

export const handleOAuth = authAsyncHandler(async (req: Request, res: Response) => {
    const { provider } = req.params;

    if (provider === 'google' || provider === 'discord' || provider === 'azure') {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: provider,
            options: {
                redirectTo: process.env.OAUTH_CALLBACK_URL,
            },
        });

        if (error) {
            throw new UserAuthError(500, 'Failed to sign in with OAuth: ' + error.message);
        }

        if (data && data.url) {
            res.redirect(301, data.url);
        } else {
            throw new UserAuthError(500, 'An unexpected error occurred.');
        }
    } else {
        throw new UserAuthError(400, 'Invalid OAuth provider.');
    }
});

export const handleOAuthCallback = authAsyncHandler(async (req: Request, res: Response) => {
    const code = req.query.code;
    const next = req.query.next ?? '/';

    if (!code) {
        throw new UserAuthError(400, 'Missing authorization code.');
    }

    const { data, error } = await supabase.auth.exchangeCodeForSession(code.toString());
    if (error) {
        throw new UserAuthError(500, 'Failed to exchange code for session: ' + error.message);
    }

    // Assuming session handling here
    res.cookie('sb:token', data.session.access_token, { httpOnly: true });

    res.redirect(303, next.toString());
});

export const sendPasswordResetEmail = authAsyncHandler(async (req: Request, res: Response) => {
    // ...
});

export const resetPassword = authAsyncHandler(async (req: Request, res: Response) => {
    // ...
});

export const logout = authAsyncHandler(async (req: Request, res: Response) => {
    const { message } = await AuthService.logout({});

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
    res.status(200).json({ message: message });
});
