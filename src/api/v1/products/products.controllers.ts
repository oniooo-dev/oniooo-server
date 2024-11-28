import { Request, Response, NextFunction, Router } from 'express';
import { fetchProductsWithPrices } from './products.services';

// Define the handler function
export const getProductsHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const productsWithPrices = await fetchProductsWithPrices();
        res.json(productsWithPrices);
    }
    catch (error) {
        console.error('Failed to fetch products:', error);
        res.status(500).json({ message: "Failed to fetch products" });
    }
};