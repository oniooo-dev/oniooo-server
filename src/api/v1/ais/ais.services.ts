import { fetchAIModel } from '../../../db/ai_models';

export const fetchAIModelService = async (modelId: string) => {
    const newOwnedModel = await fetchAIModel(modelId);
    return newOwnedModel;
};
