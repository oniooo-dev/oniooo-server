import { Request, Response } from 'express'
import { supabase } from '../../../config/supabase';
import dotenv from 'dotenv'

dotenv.config();

// Retrieves user data based on the JWT token provided in the Authorization header.
export const fetchUserData = async (req: Request, res: Response) => {
    const userId = req.params.userId;
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).send({ error: 'Authorization token is required' });
    }

    try {
        // Verify the token
        const { data: sessionData, error: sessionError } = await supabase.auth.getUser(token);

        if (sessionError || !sessionData) {
            return res.status(401).json({ error: 'Invalid or expired token' });
        }

        // Fetch user data from Supabase using the user ID
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (userError || !user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Return user data
        const userData: User = {
            userId: user.user_id,
            username: user.username,
            email: user.email,
            iconUrl: user.icon_url,
            mochiBalance: user.mochi_balance
        }

        res.status(200).json({ userData });
    } catch (err) {
        console.error(err);
        res.status(401).send({ error: 'Invalid or expired token' });
    }
};