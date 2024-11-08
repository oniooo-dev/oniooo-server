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

        if (user) {

            console.log("Found user.")

            // If user exists, return the user data
            const userData: User = {
                userId: user.user_id,
                email: user.email,
                iconUrl: user.icon_url,
                mochiBalance: user.mochi_balance
            };

            return res.status(200).json({ userData });
        }
        else if (userError) {

            console.log("Did Not Found user.")

            // If user does not exist, create a new user
            const { data: newUser, error: newUserError } = await supabase
                .from('users')
                .insert([
                    {
                        user_id: sessionData.user.id,
                        email: sessionData.user.email,
                        icon_url: 'https://i.pinimg.com/236x/3a/cd/47/3acd4715cc3addf14e2fcf14c4c2f204.jpg',
                        mochi_balance: 50
                    }
                ])
                .select()
                .single();

            if (newUserError) {
                console.error('Failed to create user:', newUserError);
                return res.status(500).json({ error: 'Failed to create user' });
            }

            // Return the newly created user data
            const newUserData: User = {
                userId: newUser.user_id,
                email: newUser.email,
                iconUrl: newUser.icon_url,
                mochiBalance: newUser.mochi_balance
            };

            return res.status(200).json({ newUserData });
        }
        else {
            // If there is another type of error, handle it
            console.error('Failed to fetch user data:', userError);
            return res.status(400).json({ error: 'Failed to fetch user data' });
        }
    }
    catch (err) {
        console.error(err);
        res.status(401).send({ error: 'Invalid or expired token' });
    }
};