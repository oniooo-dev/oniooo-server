import supabase from '../configs/supabase';
import { UserAuthError } from '../types/errors';

export const getCurrentUser = async () => {
    // Get the currently logged-in user from Supabase authentication
    const { data } = await supabase.auth.getUser();

    // Check if user is logged in
    if (!data.user) {
        throw new UserAuthError(401, 'Unauthorized: No user logged in');
    }

    const user = {
        user_id: data.user.id,
        username: data.user.user_metadata.username,
        email: data.user.email,
        role: data.user.user_metadata.role,
        icon_url: data.user.user_metadata.icon_url,
    };

    return user;
};
