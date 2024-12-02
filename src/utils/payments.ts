import { supabase } from "../config/supabase";

interface PaymentLog {
    userId: string;
    amount: number;
    status: string;
    createdAt: string;
}

export async function logPaymentSuccess(paymentLog: PaymentLog): Promise<{ success: boolean; message: string }> {

    const { userId, amount, status, createdAt } = paymentLog;

    const { data, error } = await supabase
        .from('mochi_payments')
        .insert({
            user_id: userId,
            amount: amount,
            status: status,
            created_at: createdAt
        });

    if (error) {
        console.error('Supabase error:', error);
        return { success: false, message: 'Failed to log payment success.' };
    }

    return { success: true, message: 'Payment success logged.' };
}
