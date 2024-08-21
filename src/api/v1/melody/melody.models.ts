type OwnedAIModel = {
    model_id: string;
    icon_url: string;
    name: string;
    long_description: string;
    short_description: string;
};

interface FetchUserOwnedModelsRequest {
    // ... nothing to see here
}

interface FetchUserOwnedModelsResponse {
    savedModels: OwnedAIModel[];
}
