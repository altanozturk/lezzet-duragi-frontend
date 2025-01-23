const API_URL = 'https://lezzet-duragi-backend-production.up.railway.app/api';

// Sayfa yüklendiğinde çağrılacak ana fonksiyon
document.addEventListener('DOMContentLoaded', () => {
    // Eğer login sayfasında değilsek ve token yoksa login'e yönlendir
    if (!window.location.pathname.includes('login.html') && !checkAuthStatus()) {
        window.location.href = '/login.html';
    }
    // Eğer login sayfasındaysak ve geçerli token varsa ana sayfaya yönlendir
    else if (window.location.pathname.includes('login.html') && checkAuthStatus()) {
        window.location.href = '/index.html';
    }
});

// Auth durumunu kontrol eden fonksiyon
function checkAuthStatus() {
    const token = localStorage.getItem('token');
    if (token) {
        startTokenExpirationTimer();
        return true;
    }
    return false;
}

// Login işlemi
export async function login(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await axios.post(`${API_URL}/user/login`, {
            username: username,
            password: password
        });

        // Response'u kontrol et
        console.log('Login response:', response.data);

        if (response.data && response.data.token) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('username', response.data.username);
            window.location.href = '/index.html';
        } else {
            throw new Error('Token alınamadı');
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('Giriş başarısız: ' + (error.response?.data || 'Bir hata oluştu'));
    }
}

// Register işlemi
export async function register(event) {
    event.preventDefault();
    
    const username = document.getElementById('reg-username').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;
    const confirmPassword = document.getElementById('reg-confirm-password').value;

    if (password !== confirmPassword) {
        showMessage('Şifreler eşleşmiyor!', 'error');
        return;
    }

    try {
        const response = await axios.post(`${API_URL}/user/register`, {
            username: username,
            email: email,
            password: password
        });

        // Başarı mesajını göster
        showMessage('Kayıt başarılı! Lütfen giriş yapın.', 'success');
        
        // Form alanlarını temizle
        document.getElementById('reg-username').value = '';
        document.getElementById('reg-email').value = '';
        document.getElementById('reg-password').value = '';
        document.getElementById('reg-confirm-password').value = '';
        
        // 2 saniye sonra login formuna geç
        setTimeout(() => {
            window.showLoginForm();
        }, 2000);
        
    } catch (error) {
        console.error('Register error:', error);
        showMessage('Kayıt başarısız: ' + (error.response?.data || 'Bir hata oluştu'), 'error');
    }
}

// Mesaj gösterme fonksiyonu
function showMessage(message, type) {
    const successMessage = document.getElementById('success-message');
    successMessage.textContent = message;
    successMessage.classList.remove('hidden');
    
    if (type === 'success') {
        successMessage.classList.remove('bg-red-500');
        successMessage.classList.add('bg-green-500');
    } else {
        successMessage.classList.remove('bg-green-500');
        successMessage.classList.add('bg-red-500');
    }
    
    // 3 saniye sonra mesajı gizle
    setTimeout(() => {
        successMessage.classList.add('hidden');
    }, 3000);
}

// Token yönetimi fonksiyonları
function startTokenExpirationTimer() {
    const expirationTime = localStorage.getItem('tokenExpiration');
    const currentTime = new Date().getTime();
    
    if (currentTime > expirationTime) {
        handleTokenExpiration();
    } else {
        const timeUntilExpiration = expirationTime - currentTime;
        setTimeout(handleTokenExpiration, timeUntilExpiration);
    }
}

function handleTokenExpiration() {
    localStorage.removeItem('token');
    localStorage.removeItem('tokenExpiration');
    localStorage.removeItem('username');
    window.location.href = '/login.html';
}

// Yardımcı fonksiyonlar
function showError(message) {
    const successMessage = document.getElementById('success-message');
    successMessage.textContent = message;
    successMessage.classList.remove('hidden', 'bg-green-500');
    successMessage.classList.add('bg-red-500');
    successMessage.classList.remove('hidden');
    
    // 3 saniye sonra mesajı gizle
    setTimeout(() => {
        successMessage.classList.add('hidden');
    }, 3000);
} 