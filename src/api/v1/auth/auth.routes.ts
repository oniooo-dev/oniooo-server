import { Router } from 'express';
import { loginInputValidation, registerInputValidation } from '../../../middleware/inputs';
import { registerController, loginController, logoutController } from './auth.controller';

const authRoutes = Router();

authRoutes.post('/register', registerInputValidation, registerController);
authRoutes.post('/login', loginInputValidation, loginController);
authRoutes.post('/logout', logoutController);

export default authRoutes;
