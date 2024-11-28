"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const supabase_1 = require("../config/supabase");
// Authentication Middleware
const authenticate = async (req, res, next) => {
    var _a;
    try {
        // Look for the token in cookies, headers, or query params
        const token = req.cookies.access_token ||
            ((_a = req.headers['authorization']) === null || _a === void 0 ? void 0 : _a.split(' ')[1]) ||
            req.query.token;
        if (!token) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        // Get user from Supabase Auth
        const { data: { user }, error } = await supabase_1.supabase.auth.getUser(token);
        if (error || !user) {
            return res.status(401).json({ message: 'Invalid token' });
        }
        // Grab user from Supabase Database
        const { data: userData, error: dbError } = await supabase_1.supabase
            .from('users')
            .select()
            .eq('user_id', user.id)
            .single();
        if (dbError || !userData) {
            return res.status(500).json({ message: 'Internal Server Error' });
        }
        // Return the user to the Client
        const authUser = {
            userId: userData.user_id,
            email: userData.email,
            iconUrl: userData.icon_url,
            mochiBalance: userData.mochi_balance,
        };
        // Attach the authenticated user's information to the incoming HTTP request object
        req.user = authUser;
        next();
    }
    catch (error) {
        console.error('Authentication middleware error:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};
exports.authenticate = authenticate;
