import supabase from '../../../configs/supabase';
import { createUserDetails } from '../../../db/auth';
import { UserAuthError } from '../../../types/errors';
import { UserLoginRequest, UserLoginResponse, UserRegisterRequest, UserRegisterResponse } from './auth.models';

export const register = async (register: UserRegisterRequest): Promise<UserRegisterResponse> => {
    // Manage 1-day free trial for new users

    // Set trial start date to current date
    const trialStartDate = new Date();

    // Set the trial end date to one day later
    const trialEndDate = new Date(trialStartDate);
    trialEndDate.setDate(trialStartDate.getDate() + 1);

    const user_metadata = {
        username: register.username,
        role: 'trial_user',
        trial_start: trialStartDate.toISOString(),
        trial_end: trialEndDate.toISOString(),
        icon_url: 'https://i.pinimg.com/originals/31/12/1c/31121c89d6a0f08709c344f84ae5f5ff.jpg',
    };

    const { data, error } = await supabase.auth.signUp({
        email: register.email,
        password: register.password,
        options: {
            data: user_metadata,
        },
    });

    if (error) {
        throw new UserAuthError(error.status ? error.status : 500, error.message);
    }

    if (!data.user) {
        throw new UserAuthError(401, 'User not found');
    }

    // Create user details entry in the database
    createUserDetails(data.user.id, data.user.user_metadata.username as string);

    // Return data to the client-side
    const user = {
        id: data.user.id,
        username: data.user.user_metadata.username as string,
        email: data.user.email,
        role: data.user.user_metadata.role as string,
        icon_url: data.user.user_metadata.icon_url as string,
    };

    const accessToken = data.session?.access_token;
    const refreshToken = data.session?.refresh_token;

    if (!accessToken || !refreshToken) {
        throw new UserAuthError(401, 'No session tokens found');
    }

    return { user: user, accessToken: accessToken, refreshToken: refreshToken };
};

export const login = async (login: UserLoginRequest): Promise<UserLoginResponse> => {
    const { data, error } = await supabase.auth.signInWithPassword({
        email: login.email,
        password: login.password,
    });

    if (error) {
        throw new UserAuthError(error.status ? error.status : 500, error.message);
    }

    const user = {
        id: data.user.id,
        username: data.user.user_metadata.username as string,
        email: data.user.email,
        role: data.user.user_metadata.role as string,
        icon_url: data.user.user_metadata.icon_url as string,
    };

    const accessToken = data.session.access_token;
    const refreshToken = data.session.refresh_token;

    if (!accessToken || !refreshToken) {
        throw new UserAuthError(401, 'Authentication failed');
    }

    return { user: user, accessToken: accessToken, refreshToken: refreshToken };
};

export const logout = async () => {
    try {
        const { error } = await supabase.auth.signOut();

        if (error) {
            throw new UserAuthError(500, 'An unexpected error occurred.');
        }

        return { message: 'User logged out successfully' };
    } catch (error) {
        throw new UserAuthError(500, 'An unexpected error occurred.');
    }
};
