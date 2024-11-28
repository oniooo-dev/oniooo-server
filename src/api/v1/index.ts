import express from 'express';
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

router.post('/webhooks', express.raw({ type: 'application/json' }), (req, res) => {
    const sig = req.headers['stripe-signature'];

    // Check if the signature is present
    if (!sig) {
        return res.status(400).send('Missing Stripe signature');
    }

    let event;
    try {
        // Construct the event sent by Stripe
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
    } catch (err: any) {
        // Catch and handle errors related to event construction
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event type
    switch (event.type) {
        case 'checkout.session.completed':
            const session = event.data.object;
            if (session.metadata) {
                const userId = session.metadata.userId;
                const mochiAmount = parseInt(session.metadata.mochiAmount, 10); // Parse the mochi amount safely

                // Function to update user balance with mochis
                addMochiBalance(userId, mochiAmount);
            } else {
                console.error('Missing metadata in session');
                // Handle cases where metadata is missing
                res.status(400).send('Missing metadata');
                return;
            }
            break;
        default:
            console.warn(`Unhandled event type: ${event.type}`);
            break;
    }

    // Respond to Stripe to acknowledge receipt of the event
    res.json({ received: true });
});


export default router;
