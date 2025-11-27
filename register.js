const Database = require('../lib/database');
const { decryptData } = require('../lib/crypto');

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { data } = req.body;
        if (!data) {
            return res.status(400).json({ error: 'No data provided' });
        }

        const decryptedData = decryptData(data);
        const { name, username, password } = decryptedData;

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