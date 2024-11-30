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

    // Get the signature from the headers
    const sig = req.headers['stripe-signature'];

    console.log('Webhook req.body', req.body);

    // Check if the signature is present
    if (!sig) {
        console.error('Webhook Error: Missing Stripe signature');
        return res.status(400).send('Missing Stripe signature');
    }

    let event;
    try {
        // Log the body and signature for debugging purposes
        console.log('Receiving webhook with signature:', sig);
        console.log('Body:', req.body.toString()); // Convert Buffer to string for logging

        // Construct the event sent by Stripe
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
    }
    catch (err: any) {
        console.error('Error in constructing webhook event:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event type
    switch (event.type) {

        case 'checkout.session.completed':
            const session = event.data.object;

            // Ensure metadata exists before processing
            if (session.metadata && session.metadata.userId && session.metadata.mochiAmount) {
                const userId = session.metadata.userId;
                const mochiAmount = parseInt(session.metadata.mochiAmount, 10); // Safely parse the mochi amount

                // Log successful session processing
                console.log(`Processing completed checkout session for user ${userId} with mochi amount ${mochiAmount}`);

                // Update user balance with mochis
                addMochiBalance(userId, mochiAmount)
                    .then(() => res.json({ received: true }))
                    .catch(error => {
                        console.error('Failed to update mochi balance:', error);
                        res.status(500).send('Internal Server Error');
                    });
            }
            else {
                console.error('Missing or incomplete metadata in session');
                res.status(400).send('Missing metadata');
            }
            break;

        default:
            console.warn(`Unhandled event type: ${event.type}`);
            res.status(400).send(`Unhandled event type: ${event.type}`);
            break;
    }
});


export default router;