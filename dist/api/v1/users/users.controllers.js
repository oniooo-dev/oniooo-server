"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchUserData = void 0;
const supabase_1 = require("../../../config/supabase");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Retrieves user data based on the JWT token provided in the Authorization header.
const fetchUserData = async (req, res) => {
    var _a;
    const userId = req.params.userId;
    const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(' ')[1];
    if (!token) {
        return res.status(401).send({ error: 'Authorization token is required' });
    }
    try {
        // Verify the token
        const { data: sessionData, error: sessionError } = await supabase_1.supabase.auth.getUser(token);
        if (sessionError || !sessionData) {
            return res.status(401).json({ error: 'Invalid or expired token' });
        }
        // Fetch user data from Supabase using the user ID
        const { data: user, error: userError } = await supabase_1.supabase
            .from('users')
            .select('*')
            .eq('user_id', userId)
            .single();
        if (user) {
            console.log("Found user.");
            // If user exists, return the user data
            const userData = {
                userId: user.user_id,
                email: user.email,
                iconUrl: user.icon_url,
                mochiBalance: user.mochi_balance
            };
            return res.status(200).json({ userData });
        }
        else if (userError) {
            console.log("Did Not Found user.");
            // If user does not exist, create a new user
            const { data: newUser, error: newUserError } = await supabase_1.supabase
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
            const newUserData = {
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
exports.fetchUserData = fetchUserData;
