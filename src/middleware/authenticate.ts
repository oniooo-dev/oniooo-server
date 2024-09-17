import { Request, Response, NextFunction } from 'express';
import supabase from '../configs/Supabase';

const authenticate = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Authorization token is required' });
    }

    const { data, error } = await supabase.auth.getUser(token);

    if (error) {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }

    const user = {
        username: data.user.user_metadata.username as string,
        email: data.user.email,
        icon_url: data.user.user_metadata.icon_url as string,
        role: data.user.user_metadata.role as string,
    };

    req.user = user;
    next();
};
