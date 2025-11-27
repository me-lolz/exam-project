const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

let users = [];

class Database {
    static async createUser(userData) {
        const existingUser = users.find(u => u.username === userData.username);
        if (existingUser) {
            throw new Error('Username already exists');
        }

        const hashedPassword = await bcrypt.hash(userData.password, 12);
        
        const user = {
            id: Date.now().toString(),
            name: userData.name,
            username: userData.username,
            password: hashedPassword,
            createdAt: new Date().toISOString()
        };

        users.push(user);
        return user;
    }

    static async findUserByUsername(username) {
        return users.find(u => u.username === username);
    }

    static async validateUser(username, password) {
        const user = await this.findUserByUsername(username);
        if (!user) {
            throw new Error('User not found');
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            throw new Error('Invalid password');
        }

        return user;
    }

    static generateToken(user) {
        return jwt.sign(
            { 
                userId: user.id, 
                username: user.username 
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );
    }

    static verifyToken(token) {
        try {
            return jwt.verify(token, JWT_SECRET);
        } catch (error) {
            throw new Error('Invalid token');
        }
    }
}

module.exports = Database;
