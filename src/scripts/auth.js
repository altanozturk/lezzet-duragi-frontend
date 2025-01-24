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

// Hata mesajı gösterme fonksiyonu
function showError(message) {
    showMessage(message, 'error');
}

// Login işlemi
export async function login(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();

    // Boş alan kontrolü
    if (!username || !password) {
        showError('Lütfen tüm alanları doldurun!');
        return false;
    }

    // Minimum uzunluk kontrolü
    if (username.length < 3) {
        showError('Kullanıcı adı en az 3 karakter olmalıdır!');
        return false;
    }

    if (password.length < 4) {
        showError('Şifre en az 4 karakter olmalıdır!');
        return false;
    }

    try {
        const response = await axios.post(`${API_URL}/user/login`, {
            username: username,
            password: password
        });

        // Response'u kontrol et
        console.log('Login response:', response.data);

        if (response.data.token) {
            // Token'ı ve kullanıcı adını kaydet
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('username', response.data.username);
            
            // Token'ın süresini hesapla ve kaydet (örneğin 24 saat)
            const expirationTime = new Date().getTime() + (24 * 60 * 60 * 1000);
            localStorage.setItem('tokenExpiration', expirationTime);
            
            // Ana sayfaya yönlendir
            window.location.href = '/index.html';
        } else {
            showError('Giriş başarısız!');
        }
    } catch (error) {
        console.error('Login error:', error);
        showError('Kullanıcı adı veya şifre hatalı!');
    }
    return false;
}

// Register işlemi
export async function register(event) {
    event.preventDefault();
    
    const username = document.getElementById('reg-username').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const password = document.getElementById('reg-password').value.trim();
    const confirmPassword = document.getElementById('reg-confirm-password').value.trim();

    // Boş alan kontrolü
    if (!username || !email || !password || !confirmPassword) {
        showMessage('Lütfen tüm alanları doldurun!', 'error');
        return false;
    }

    // Minimum uzunluk kontrolü
    if (username.length < 3) {
        showMessage('Kullanıcı adı en az 3 karakter olmalıdır!', 'error');
        return false;
    }

    if (password.length < 4) {
        showMessage('Şifre en az 4 karakter olmalıdır!', 'error');
        return false;
    }

    // Email formatı kontrolü
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showMessage('Geçerli bir email adresi giriniz!', 'error');
        return false;
    }

    if (password !== confirmPassword) {
        showMessage('Şifreler eşleşmiyor!', 'error');
        return false;
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
    return false;
}

// Mesaj gösterme fonksiyonu
function showMessage(message, type) {
    const messageDiv = document.getElementById('success-message');
    messageDiv.textContent = message;
    messageDiv.style.display = 'block';
    
    // Sadece arka plan rengini değiştir, diğer stiller HTML'de sabit kalsın
    messageDiv.style.backgroundColor = type === 'success' ? '#10B981' : '#EF4444';
    
    setTimeout(() => {
        messageDiv.style.display = 'none';
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