import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl: string = process.env.SUPABASE_URL as string;
const supabaseKey: string = process.env.SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseKey) {
    console.error('Supabase URL and Key must be provided in the environment.');
    process.exit(1); // Exit the process with a failure code
}

const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey);

export default supabase;
