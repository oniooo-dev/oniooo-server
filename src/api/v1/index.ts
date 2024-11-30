import express from 'express';
import { json, Router } from 'express';
import Stripe from 'stripe';
import { authenticate } from '../../middlewares/authenticate';
import melodyRoutes from './melody/melody.routes';
import productRoutes from './products/products.routes';
import userRoutes from './users/users.routes';
import { addMochiBalance } from '../../utils/mochis';

const router = Router();

// Add JSON body parser middleware
router.use(json());

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

    if (!priceId || !userId || !mochiAmount) {
        return res.status(400).send({ error: 'Missing required fields' });
    }

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
                mochiAmount: mochiAmount.toString() // Convert to string if it's a number
            },
            payment_intent_data: {
                metadata: {
                    userId: userId,
                    mochiAmount: mochiAmount.toString()
                }
            },
            success_url: `${req.headers.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${req.headers.origin}/cancel`,
        });

        console.log('Stripe session created', session);

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

    // Check if the signature is present
    if (!sig) {
        console.error('Webhook Error: Missing Stripe signature');
        return res.status(400).send('Missing Stripe signature');
    }

    let event;
    try {
        // Construct the event sent by Stripe
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
    }
    catch (err: any) {
        console.error('Error in constructing webhook event:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event type
    switch (event.type) {

        case 'payment_intent.succeeded':

            const paymentIntent = event.data.object as Stripe.PaymentIntent;

            if (paymentIntent.metadata && paymentIntent.metadata.userId && paymentIntent.metadata.mochiAmount) {

                console.log('Stripe PaymentIntent metadata', paymentIntent.metadata);

                const userId = paymentIntent.metadata.userId;
                const mochiAmount = parseInt(paymentIntent.metadata.mochiAmount, 10);

                console.log(`Payment succeeded for user ${userId} with mochi amount ${mochiAmount}`);

                addMochiBalance(userId, mochiAmount)
                    .then(() => res.json({ success: true }))
                    .catch(error => {
                        console.error('Failed to update mochi balance:', error);
                        res.status(500).send('Internal Server Error');
                    });
            }
            else {
                console.error('Missing or incomplete metadata in PaymentIntent');
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