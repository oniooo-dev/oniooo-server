import supabase from "../../../configs/SupabaseClient";
import { createUser, findUserByEmail } from "../../../db/users";
import { UserAuthError } from "../../../types/errors";
import { UserLoginRequest, UserLoginResponse, UserRegisterRequest, UserRegisterResponse } from "./auth.models";

export const registerUserService = async (register: UserRegisterRequest): Promise<UserRegisterResponse> => {
    // Validate if the email isn't already in use
    const existingUser = await findUserByEmail(register.email);
        
    if (existingUser) {
        throw new UserAuthError(401, 'Email already in use');
    }

    const { data, error } = await supabase.auth.signUp({
        email: register.email,
        password: register.password,
    });

    if (error) {
        throw new UserAuthError(error.status ? error.status : 500, error.message);
    }

    if (!data.user) {
        throw new UserAuthError(401, 'User not found');
    }

    // Create the user in the database
    createUser(register.username, register.email, register.password);

    const user = {
        id: data.user.id,
        username: register.username,
        email: register.email,
    }

    const accessToken = data.session?.access_token;
    const refreshToken = data.session?.refresh_token;

    if (!accessToken || !refreshToken) {
        throw new UserAuthError(401, 'No session tokens found');
    }

    return { user: user, accessToken: accessToken, refreshToken: refreshToken }; 
};

export const loginUserService = async (login: UserLoginRequest): Promise<UserLoginResponse> => {
    const { data, error } = await supabase.auth.signInWithPassword({
        email: login.email,
        password: login.password,
    });

    if (error) {
        throw new UserAuthError(error.status ? error.status : 500, error.message);
    }

    const userData = await findUserByEmail(login.email);

    if (!userData) {
        throw new UserAuthError(401, 'User not found');
    }

    const user = {
        id: userData.id,
        username: userData.username,
        email: userData.email,
    }

    const accessToken = data.session.access_token;
    const refreshToken = data.session.refresh_token;

    if (!accessToken || !refreshToken) {
        throw new UserAuthError(401, 'Authentication failed');
    }

    return { user: user, accessToken: accessToken, refreshToken: refreshToken };
};

export const logoutUser = async () => {
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