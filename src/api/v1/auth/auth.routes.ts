import { Router } from 'express';
import { register, login, logout, handleOAuth, handleOAuthCallback } from './auth.controller';

const authRoutes = Router();

authRoutes.post('/register', register);
authRoutes.post('/login', login);
authRoutes.get('/oauth/:provider', handleOAuth);
authRoutes.get('/oauth/:provider/callback', handleOAuthCallback);
authRoutes.post('/logout', logout);

export default authRoutes;
