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
        const { username, password } = decryptedData;

        if (!username || !password) {
            return res.status(400).json({ error: 'Missing username or password' });
        }

        const user = await Database.validateUser(username, password);
        const token = Database.generateToken(user);

        res.json({
            message: 'Login successful',
            user: { id: user.id, name: user.name, username: user.username },
            token
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(401).json({ error: error.message });
    }
};