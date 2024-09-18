import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl: string = process.env.SUPABASE_URL as string;
const supabaseKey: string = process.env.SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseKey) {
    console.error('Supabase URL and Key must be provided in the environment.');
}

const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey);

export default supabase;
