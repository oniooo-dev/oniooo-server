import { Request, Response, NextFunction } from 'express';
import { supabase } from '../../../config/supabase';
import { validate as isUuid } from 'uuid';

export const fetchPayments = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId } = req.body;

        console.log('userId', userId);

        // Validate userId
        if (!userId || !isUuid(userId)) {
            return res.status(400).json({ error: 'Invalid or missing userId.' });
        }

        const { data: paymentLogs, error } = await supabase
            .from('mochi_payments')
            .select('*')
            .eq('user_id', userId);

        if (error) {
            console.error('Supabase error:', error);
            return res.status(500).send('Internal Server Error');
        }

        // Send to Client
        res.status(200).json({
            payments: paymentLogs,
        });
    }
    catch (error) {
        console.log(error);
        next(error);
    }
};