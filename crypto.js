const crypto = require('crypto');

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');
const ALGORITHM = 'aes-256-gcm';

function decryptData(encryptedData) {
    try {
        const buffer = Buffer.from(encryptedData, 'base64');
        const iv = buffer.slice(0, 12);
        const authTag = buffer.slice(12, 28);
        const encrypted = buffer.slice(28);
        
        const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
        decipher.setAuthTag(authTag);
        
        let decrypted = decipher.update(encrypted, 'binary', 'utf8');
        decrypted += decipher.final('utf8');
        
        return JSON.parse(decrypted);
    } catch (error) {
        throw new Error('Invalid encrypted data');
    }
}

function encryptData(data) {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
    
    let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'binary');
    encrypted += cipher.final('binary');
    
    const authTag = cipher.getAuthTag();
    const buffer = Buffer.concat([iv, authTag, Buffer.from(encrypted, 'binary')]);
    
    return buffer.toString('base64');
}

module.exports = { decryptData, encryptData };