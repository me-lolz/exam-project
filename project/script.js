class AuthClient {
    constructor() {
        this.encryptionKey = this.generateEncryptionKey();
        this.currentToken = null;
    }

    generateEncryptionKey() {
        return crypto.getRandomValues(new Uint8Array(32));
    }

    async encryptData(data) {
        const encoder = new TextEncoder();
        const dataBuffer = encoder.encode(JSON.stringify(data));
        
        const iv = crypto.getRandomValues(new Uint8Array(12));
        const key = await crypto.subtle.importKey(
            'raw',
            this.encryptionKey,
            'AES-GCM',
            false,
            ['encrypt']
        );

        const encryptedBuffer = await crypto.subtle.encrypt(
            {
                name: 'AES-GCM',
                iv: iv
            },
            key,
            dataBuffer
        );

        const encryptedArray = new Uint8Array(encryptedBuffer);
        const result = new Uint8Array(iv.length + encryptedArray.length);
        result.set(iv);
        result.set(encryptedArray, iv.length);

        return btoa(String.fromCharCode(...result));
    }

    async hashPassword(password) {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hash = await crypto.subtle.digest('SHA-256', data);
        return btoa(String.fromCharCode(...new Uint8Array(hash)));
    }

    async sendEncryptedRequest(endpoint, data) {
        try {
            const encryptedData = await this.encryptData(data);
            
            const response = await fetch(`/api/${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ data: encryptedData })
            });

            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.error || 'Request failed');
            }

            return result;
        } catch (error) {
            throw new Error(`Network error: ${error.message}`);
        }
    }

    storeToken(token) {
        this.currentToken = token;
        localStorage.setItem('authToken', token);
    }

    getToken() {
        if (!this.currentToken) {
            this.currentToken = localStorage.getItem('authToken');
        }
        return this.currentToken;
    }

    clearToken() {
        this.currentToken = null;
        localStorage.removeItem('authToken');
    }

    async verifyToken() {
        const token = this.getToken();
        if (!token) return false;

        try {
            const response = await fetch('/api/verify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            return response.ok;
        } catch (error) {
            return false;
        }
    }
}

const authClient = new AuthClient();

function showTab(tabName) {
    document.querySelectorAll('.auth-form').forEach(form => {
        form.classList.remove('active');
    });
    document.querySelectorAll('.tab-button').forEach(button => {
        button.classList.remove('active');
    });

    document.getElementById(tabName + 'Form').classList.add('active');
    event.target.classList.add('active');
}

function showMessage(message, type) {
    const messageEl = document.getElementById('message');
    messageEl.textContent = message;
    messageEl.className = `message ${type}`;
    messageEl.style.display = 'block';

    setTimeout(() => {
        messageEl.style.display = 'none';
    }, 5000);
}

async function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const hashedPassword = await authClient.hashPassword(password);
        
        const result = await authClient.sendEncryptedRequest('login', {
            username,
            password: hashedPassword
        });

        authClient.storeToken(result.token);
        showUserInfo(result.user);
        showMessage('Login successful!', 'success');
    } catch (error) {
        showMessage(error.message, 'error');
    }
}

async function handleRegister(event) {
    event.preventDefault();
    
    const name = document.getElementById('registerName').value;
    const username = document.getElementById('registerUsername').value;
    const password = document.getElementById('registerPassword').value;

    try {
        const hashedPassword = await authClient.hashPassword(password);
        
        const result = await authClient.sendEncryptedRequest('register', {
            name,
            username,
            password: hashedPassword
        });

        authClient.storeToken(result.token);
        showUserInfo(result.user);
        showMessage('Registration successful!', 'success');
    } catch (error) {
        showMessage(error.message, 'error');
    }
}

function showUserInfo(user) {
    document.getElementById('userName').textContent = user.name;
    document.getElementById('userToken').textContent = authClient.getToken();
    document.getElementById('userInfo').classList.remove('hidden');
    document.querySelectorAll('.auth-form').forEach(form => {
        form.style.display = 'none';
    });
}

function logout() {
    authClient.clearToken();
    document.getElementById('userInfo').classList.add('hidden');
    showTab('login');
    document.getElementById('loginForm').reset();
    document.getElementById('registerForm').reset();
}

async function checkAuthStatus() {
    const isAuthenticated = await authClient.verifyToken();
    if (isAuthenticated) {
        document.getElementById('userInfo').classList.remove('hidden');
        document.querySelectorAll('.auth-form').forEach(form => {
            form.style.display = 'none';
        });
    }
}

document.getElementById('loginForm').addEventListener('submit', handleLogin);
document.getElementById('registerForm').addEventListener('submit', handleRegister);

document.addEventListener('DOMContentLoaded', checkAuthStatus);