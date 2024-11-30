import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export const fetchProducts = async (): Promise<Stripe.Product[]> => {
    const products = await stripe.products.list({
        active: true,
        limit: 6,
    });

    return products.data;
};

interface MochiBannerProps {
    name: string;
    price: number;
    amount: number;
    priceId: string;
}

export const fetchProductsWithPrices = async (): Promise<MochiBannerProps[]> => {
    try {
        // Fetch products from Stripe
        const products = await stripe.products.list({
            active: true,
            limit: 6,
        });

        // Fetch prices for each product
        const productsWithPrices: MochiBannerProps[] = await Promise.all(
            products.data.map(async (product) => {
                // Fetch prices for each product
                const prices = await stripe.prices.list({ product: product.id });

                // Assuming you want the first price item
                const priceData = prices.data[0];
                const price = priceData ? Number(priceData.unit_amount) / 100 : 0;
                const priceId = priceData ? priceData.id : '';

                return {
                    name: product.name,
                    price: price,
                    amount: 1, // You can modify this as needed
                    priceId: priceId,
                };
            })
        );

        // Sort the products by ascending price
        productsWithPrices.sort((a, b) => a.price - b.price);

        return productsWithPrices;
    }
    catch (error) {
        console.error("Error fetching products with prices:", error);
        throw error;
    }
};
