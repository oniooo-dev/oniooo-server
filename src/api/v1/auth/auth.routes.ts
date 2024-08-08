import { Router } from 'express';
// import { loginInputValidation, registerInputValidation } from '../../../middleware/auth/input';
import { registerController, loginController, logoutController } from './auth.controller';

const authRoutes = Router();

authRoutes.post('/register', registerController);
authRoutes.post('/login', loginController);
authRoutes.post('/logout', logoutController);

export default authRoutes;
