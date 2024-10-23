import { Router } from 'express';
import melodyRoutes from './melody/melody.routes';

const router = Router();

// Melody
router.use('/melody', melodyRoutes);

export default router;
