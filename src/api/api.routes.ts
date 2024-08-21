import { Router } from 'express';
import authRoutes from './v1/auth/auth.routes';
import melodyRoutes from './v1/melody/melody.routes';
import aisRoutes from './v1/ais/ais.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/melody', melodyRoutes);
router.use('/ais', aisRoutes);

export default router;
