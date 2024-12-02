
/**
 * Payments API Routes
*/

import { Router } from 'express';
import { fetchPayments } from './payments.controllers';

const paymentsRoutes = Router();

paymentsRoutes.post('/logs', fetchPayments);

export default paymentsRoutes;