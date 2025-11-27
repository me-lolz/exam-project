const Database = require('../lib/database');

module.exports = async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { name, username, password } = req.body;

        if (!name || !username || !password) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const user = await Database.createUser({ name, username, password });
        const token = Database.generateToken(user);

        res.status(201).json({
            message: 'User created successfully',
            user: { id: user.id, name: user.name, username: user.username },
            token
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(400).json({ error: error.message });
    }
};
