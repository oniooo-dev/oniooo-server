import { Router } from 'express';
import { loginInputValidation, registerInputValidation } from '../../../middleware/inputs';
import { register, login, logout } from './auth.controller';

const authRoutes = Router();

authRoutes.post('/register', registerInputValidation, register);
authRoutes.post('/login', loginInputValidation, login);
authRoutes.post('/logout', logout);

export default authRoutes;
