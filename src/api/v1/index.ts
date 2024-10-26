import { Router } from 'express';
import userRoutes from './users/users.routes';
import melodyRoutes from './melody/melody.routes';
import { authenticate } from '../../middlewares/authenticate';

const router = Router();

// API Routes
router.use('/users', userRoutes);
router.use('/melody', authenticate, melodyRoutes);

export default router;
