import supabase from '../configs/SupabaseClient';
import { DatabaseError } from '../types/errors';

export const createUserDetails = async (userId: string, username: string): Promise<void> => {
    const { data, error: dbError } = await supabase.from('user_details').insert([
        {
            user_id: userId,
            username: username,
        },
    ]);

    if (dbError) {
        throw new DatabaseError(500, dbError.message);
    }
};

export const updateUserIconUrl = async (newIconUrl: string): Promise<void> => {
    const { data, error } = await supabase.auth.updateUser({
        data: { iconUrl: newIconUrl },
    });

    if (error) {
        throw new DatabaseError(error.status ? error.status : 500, error.message);
    }
};

export const startUserSubscription = async (): Promise<void> => {
    const { data, error } = await supabase.auth.updateUser({
        data: { role: 'subscribed' },
    });

    if (error) {
        throw new DatabaseError(error.status ? error.status : 500, error.message);
    }
};

export const endUserSubscription = async (): Promise<void> => {
    const { data, error } = await supabase.auth.updateUser({
        data: { role: 'unsubscribed' },
    });

    if (error) {
        throw new DatabaseError(error.status ? error.status : 500, error.message);
    }
};
