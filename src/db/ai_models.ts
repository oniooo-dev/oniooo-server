import supabase from '../configs/SupabaseClient';
import { DatabaseError } from '../types/errors';

export const fetchAIModel = async (modelId: string) => {
    const { data: aiModel, error: dbError } = await supabase
        .from('ai_models')
        .select(`model_id, icon_url, name, short_description`)
        .eq('model_id', modelId)
        .single();

    if (dbError) {
        throw new DatabaseError(500, dbError.message);
    }

    return aiModel;
};
