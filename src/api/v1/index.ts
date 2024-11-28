import { json, Router } from 'express';
import Stripe from 'stripe';
import { authenticate } from '../../middlewares/authenticate';
import melodyRoutes from './melody/melody.routes';
import productRoutes from './products/products.routes';
import userRoutes from './users/users.routes';
import { addMochiBalance } from '../../utils/mochis';

const router = Router();

// API Routes
router.use('/users', userRoutes);
router.use('/melody', authenticate, melodyRoutes);
router.use('/products', productRoutes);

/**
 * Stripe
 */

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

router.post('/create-checkout-session', async (req, res) => {

    console.log('req.body', req.body);

    const { priceId, userId, mochiAmount } = req.body;  // Removed productId

    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price: priceId,  // Dynamically set the price ID
                quantity: 1,
            }],
            mode: 'payment',
            metadata: {
                userId: userId, // Store user ID in metadata for later retrieval
                priceId: priceId, // Include price ID instead of product ID
                mochiAmount: mochiAmount // Amount of mochis this product grants
            },
            success_url: `${req.headers.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${req.headers.origin}/cancel`,
        });

        res.json({ id: session.id, url: session.url });
    }
    catch (error: any) {
        console.error('Failed to create checkout session:', error);
        res.status(500).send({ error: error.message });
    }
    // Start of Selection
});

router.post('/webhooks', json({ type: 'application/json' }), (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;
    try {
        // Simulate processing the webhook data
        console.log('Webhook received:', req.body);

        if (!sig) {
            throw new Error('Missing stripe signature');
        }
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
    }
    catch (err) {
        if (err instanceof Error) {
            res.status(400).send(`Webhook Error: ${err.message}`);
        } else {
            res.status(400).send('Webhook Error');
        }
        return;
    }

    // Handle the checkout.session.completed event
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;

        // Add null check for metadata
        if (session.metadata) {
            const userId = session.metadata.userId;
            const mochiAmount = parseInt(session.metadata.mochiAmount, 10); // Specify radix

            // Update user balance with mochis
            addMochiBalance(userId, mochiAmount);
        }
        else {
            console.error('Missing metadata in session');
            // Optionally handle the missing metadata case
        }
    }

    res.json({ received: true });
});

export default router;
