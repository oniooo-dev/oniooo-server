import supabase from '../configs/SupabaseClient';
import { DatabaseError } from '../types/errors';

// naming -> verb -> det/adj -> noun -> noun

export const fetchAllUserConversations = async (userId: string) => {
    const { data: userOwnedModels, error: dbError } = await supabase.from('conversations').select('*').eq('user_id', userId);

    if (dbError) {
        throw new DatabaseError(500, dbError.message);
    }

    return userOwnedModels;
};

export const createNewUserConversation = async (userId: string, modelId: string, title: string) => {
    const { data, error: dbError } = await supabase.from('conversations').insert([
        {
            user_id: userId,
            model_id: modelId,
            title: title,
        },
    ]);

    if (dbError) {
        throw new DatabaseError(500, dbError.message);
    }

    return data;
};
