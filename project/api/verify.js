const Database = require('../lib/database');

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const token = authHeader.substring(7);
        const decoded = Database.verifyToken(token);

        res.json({ 
            valid: true, 
            user: { 
                userId: decoded.userId, 
                username: decoded.username 
            } 
        });

    } catch (error) {
        res.status(401).json({ error: 'Invalid token' });
    }
};