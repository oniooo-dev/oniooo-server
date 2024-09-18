import { DatabaseError, UserAuthError } from '../../../types/errors';
import { UserLoginRequest, UserLoginResponse, UserLogoutRequest, UserLogoutResponse, UserRegisterRequest, UserRegisterResponse } from './auth.models';
import supabase from '../../../configs/supabase';

export const register = async (register: UserRegisterRequest): Promise<UserRegisterResponse> => {
    const { username, email, password } = register;

    const user_metadata = {
        username: username,
        icon_url: 'https://i.pinimg.com/originals/31/12/1c/31121c89d6a0f08709c344f84ae5f5ff.jpg',
    };

    const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
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
    const { data: userData, error: dbError } = await supabase.from('users').insert([
        {
            user_id: data.user.id,
            username: username,
            email: email,
            icon_url: user_metadata.icon_url,
        },
    ]);

    if (dbError) {
        throw new DatabaseError(500, 'Failed to create user details');
    }

    // Return data to the client-side
    const user = {
        user_id: data.user.id,
        username: data.user.user_metadata.username,
        email: data.user.email,
        icon_url: data.user.user_metadata.icon_url,
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
        user_id: data.user.id,
        username: data.user.user_metadata.username,
        email: data.user.email,
        role: data.user.user_metadata.role,
        icon_url: data.user.user_metadata.icon_url,
    };

    const accessToken = data.session.access_token;
    const refreshToken = data.session.refresh_token;

    if (!accessToken || !refreshToken) {
        throw new UserAuthError(401, 'Authentication failed');
    }

    return { user: user, accessToken: accessToken, refreshToken: refreshToken };
};

export const logout = async (params: UserLogoutRequest): Promise<UserLogoutResponse> => {
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
