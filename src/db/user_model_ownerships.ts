import supabase from '../configs/supabase';
import { DatabaseError } from '../types/errors';

export const createUserOwnedModelOwnership = async (userId: string, modelId: string) => {
    const { data, error: dbError } = await supabase.from('user_model_ownerships').insert([
        {
            user_id: userId,
            model_id: modelId,
        },
    ]);

    if (dbError) {
        throw new DatabaseError(500, dbError.message);
    }

    return data;
};

export const fetchUserModelOwnerships = async (userId: string) => {
    const { data: userOwnedModels, error: dbError } = await supabase
        .from('user_model_ownerships')
        .select(
            `
                ai_model: ai_models (
                    model_id,
                    name,
                    icon_url,
                    short_description
                )
            `,
        )
        .eq('user_id', userId);

    if (dbError) {
        throw new DatabaseError(500, dbError.message);
    }

    return userOwnedModels;
};
