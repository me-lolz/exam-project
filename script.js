class AuthClient {
    constructor() {
        this.currentToken = null;
    }

    async hashPassword(password) {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hash = await crypto.subtle.digest('SHA-256', data);
        return btoa(String.fromCharCode(...new Uint8Array(hash)));
    }

    async sendRequest(endpoint, data) {
        try {
            const response = await fetch(`/api/${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.error || 'Request failed');
            }

            return result;
        } catch (error) {
            throw new Error(error.message);
        }
    }

    storeToken(token) {
        this.currentToken = token;
    }

    getToken() {
        return this.currentToken;
    }

    clearToken() {
        this.currentToken = null;
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

    const form = document.getElementById(tabName + 'Form');
    form.classList.add('active');
    form.style.display = 'block';
    
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
        
        const result = await authClient.sendRequest('login', {
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
        
        const result = await authClient.sendRequest('register', {
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
    document.querySelector('.tabs').style.display = 'none';
}

function logout() {
    authClient.clearToken();
    document.getElementById('userInfo').classList.add('hidden');
    document.querySelector('.tabs').style.display = 'flex';
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('loginForm').classList.add('active');
    document.getElementById('loginForm').reset();
    document.getElementById('registerForm').reset();
    document.querySelectorAll('.tab-button')[0].classList.add('active');
    showMessage('Logged out successfully', 'success');
}

document.getElementById('loginForm').addEventListener('submit', handleLogin);
document.getElementById('registerForm').addEventListener('submit', handleRegister);
