import { Router } from 'express';
import authRoutes from './v1/auth/auth.routes';
import melodyRoutes from './v1/melody/melody.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/melody', melodyRoutes);

export default router;
