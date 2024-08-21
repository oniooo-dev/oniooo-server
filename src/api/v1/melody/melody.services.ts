import { fetchAIModel } from '../../../db/ai_models';
import { createNewUserConversation, fetchAllUserConversations } from '../../../db/conversations';
import { createUserOwnedModelOwnership, fetchUserModelOwnerships } from '../../../db/user_model_ownerships';
import { getCurrentUser } from '../../../lib/auth';

export const createUserOwnedModel = async (modelId: string) => {
    const userId = (await getCurrentUser()).user_id;
    const newOwnedModel = await createUserOwnedModelOwnership(userId, modelId);
    return newOwnedModel;
};

export const fetchUserOwnedModels = async () => {
    const userId = (await getCurrentUser()).user_id;
    const userOwnedModels = await fetchUserModelOwnerships(userId);
    return userOwnedModels;
};

export const fetchModel = async (modelId: string) => {
    // const userId = (await getCurrentUser()).user_id;
    const userOwnedModels = await fetchAIModel(modelId);
    return userOwnedModels;
};

export const createUserConversation = async (modelId: string, firstPrompt: string) => {
    const userId = (await getCurrentUser()).user_id;
    const title = 'Some Randomly Generated Title';
    const newConversation = await createNewUserConversation(userId, modelId, title);
    return newConversation;
};

export const fetchUserConversations = async () => {
    const userId = (await getCurrentUser()).user_id;
    const userConversations = await fetchAllUserConversations(userId);
    return userConversations;
};
