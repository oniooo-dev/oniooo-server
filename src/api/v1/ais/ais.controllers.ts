import { Request, Response } from 'express';
import { AISError } from '../../../types/errors';
import * as AIService from './ais.services';

export const fetchAIModelController = async (req: Request<any, any, any, { modelId: string }>, res: Response) => {
    const { modelId } = req.params;

    // Attempt to fetch the AI model
    const aiModel = await AIService.fetchAIModelService(modelId);

    // Validate the response from AuthService
    if (!aiModel) {
        throw new AISError(500, 'Internal server error');
    }

    res.status(200).json({
        message: 'AI model fetched',
        ai_model: aiModel,
    });
};
