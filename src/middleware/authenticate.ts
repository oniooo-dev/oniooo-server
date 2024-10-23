import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase/supabase';

declare global {
    namespace Express {
        interface Request {
            user?: User;
        }
    }
}

// Authentication Middleware
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Verify the access token
        const token = req.cookies.access_token;

        if (!token) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        // Get user from Supabase Auth
        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error || !user) {
            return res.status(401).json({ message: 'Invalid token' });
        }

        // Grab user from Supabase Database
        const { data: userData, error: dbError } = await supabase
            .from('users')
            .select()
            .eq('user_id', user.id)
            .single();

        if (dbError || !userData) {
            return res.status(500).json({ message: 'Internal Server Error' })
        }

        // Return the user to the Client
        const authUser: User = {
            user_id: userData.user_id,
            username: userData.username,
            email: userData.email,
            icon_url: userData.icon_url,
            mochi_balance: userData.mochi_balance,
        }

        // Attach the authenticated user's information to the incoming HTTP request object
        req.user = authUser;
        next();
    } catch (error) {
        console.error('Authentication middleware error:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};