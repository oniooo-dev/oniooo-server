import { Router } from 'express';
import { fetchAIModelController } from './ais.controllers';

const aisRoutes = Router();

aisRoutes.get('/:modelId/basics', fetchAIModelController);

export default aisRoutes;
