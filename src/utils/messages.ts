import supabase from "../config/supabase/supabase";
import { DatabaseError } from "../types/errors";

export async function saveMessageToDatabase(chatId: string, userId: string, content: string) {
    const { data, error } = await supabase
        .from('melody_messages')
        .insert([{ chat_id: chatId, user_id: userId, type: 'SYSTEM_TEXT', content }])
        .select();

    if (error) {
        console.log('Error creating message:', error);
        throw new DatabaseError(500, 'Error creating message');
    }

    console.log('Message saved to Supabase:', data);
    return data;
}