import { Router } from 'express';
import { getProductsHandler } from './products.controllers';

const productRoutes = Router();

// Handle chat routes
productRoutes.get('/', getProductsHandler);

export default productRoutes;