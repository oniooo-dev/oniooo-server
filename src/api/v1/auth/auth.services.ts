import { UserLoginRequest, UserLoginResponse, UserLogoutRequest, UserLogoutResponse, UserRegisterRequest, UserRegisterResponse } from './auth.models';
import supabase from '../../../configs/supabase/supabase';
import { DatabaseError, UserAuthError } from '../../../types/errors';

export const register = async (credentials: UserRegisterRequest): Promise<UserRegisterResponse> => {
    const { username, email, password } = credentials;

    // TODO: Change to random icon URL
    const iconUrl = 'https://i.pinimg.com/originals/31/12/1c/31121c89d6a0f08709c344f84ae5f5ff.jpg';

    // Register user in Supabase Auth
    const { data, error: authError } = await supabase.auth.signUp({
        email: email,
        password: password,
    });

    if (authError) throw new UserAuthError(authError.status ? authError.status : 500, authError.message);

    if (!data.user) throw new UserAuthError(401, 'Unable to create user');

    // Create user details entry in the database
    const { data: userData, error: dbError } = await supabase.from('users').insert([
        {
            user_id: data.user.id,
            email: email,
            username: username,
            icon_url: iconUrl ? iconUrl : null,
            mochi_balance: 50,
        },
    ])
        .select()
        .single();

    if (dbError) throw new DatabaseError(500, 'Failed to create user details');

    // Return data to the client-side
    const user: User = {
        username: userData.username,
        email: userData.email,
        icon_url: userData.icon_url,
        mochi_balance: userData.mochi_balance,
    };

    const accessToken = data.session?.access_token;
    const refreshToken = data.session?.refresh_token;

    if (!accessToken || !refreshToken) throw new UserAuthError(401, 'No session tokens found');

    return { user, accessToken, refreshToken };
};

export const login = async (login: UserLoginRequest): Promise<UserLoginResponse> => {
    const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: login.email,
        password: login.password,
    });

    if (authError) throw new UserAuthError(authError.status ? authError.status : 500, authError.message);

    // Retrieve user's data from the database
    const { data: userData, error: dbError } = await supabase.from('users').select('*').eq('user_id', data.user.id).single();

    if (dbError) throw new DatabaseError(500, 'Failed to retrieve user details');

    const user: User = {
        username: userData.username,
        email: userData.email,
        icon_url: userData.icon_url,
        mochi_balance: userData.mochi_balance,
    };

    const accessToken = data.session.access_token;
    const refreshToken = data.session.refresh_token;

    if (!accessToken || !refreshToken) throw new UserAuthError(401, 'Authentication failed');

    return { user: user, accessToken: accessToken, refreshToken: refreshToken };
};

export const logout = async (params: UserLogoutRequest): Promise<UserLogoutResponse> => {
    try {
        const { error } = await supabase.auth.signOut();

        if (error) throw new UserAuthError(500, 'An unexpected error occurred.');

        return { message: 'User logged out successfully' };
    } catch (error) {
        throw new UserAuthError(500, 'An unexpected error occurred.');
    }
};
