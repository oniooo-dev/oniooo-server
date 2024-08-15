import supabase from "../configs/SupabaseClient";
import { DatabaseError } from "../types/errors";
import bcrypt from 'bcrypt';

export const findUserByEmail = async (email: string) => {
    const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .maybeSingle();  // Using maybeSingle() which returns null instead of throwing if no row is found
    
    if (error) {
        // Handle actual errors from the database
        throw new DatabaseError(500, error.message);
    }
    
    if (data === null) {
        // No user found with the given email, which is not an error in this context
        return null;
    }
    
    return data;
};

export const createUser = async (username: string, email: string, password: string) => {
    // Encrypt the password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const { data, error } = await supabase
        .from('users')
        .insert([{ username: username, email: email, password: hashedPassword }]);
    
    if (error) {
        throw new DatabaseError(500, error.message);
    }
    
    return data;
};