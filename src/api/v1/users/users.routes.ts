import { Router } from 'express';
import { fetchUserData } from './users.controllers';

const usersRoutes = Router();

// Handle chat routes
usersRoutes.get('/:userId', fetchUserData);

export default usersRoutes;