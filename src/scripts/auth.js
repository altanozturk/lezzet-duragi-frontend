// Sayfa yüklendiğinde çağrılacak ana fonksiyon
document.addEventListener('DOMContentLoaded', () => {
    // Eğer login sayfasında değilsek ve token yoksa login'e yönlendir
    if (!window.location.pathname.includes('login.html') && !checkAuthStatus()) {
        window.location.href = '/src/login.html';
    }
    // Eğer login sayfasındaysak ve geçerli token varsa ana sayfaya yönlendir
    else if (window.location.pathname.includes('login.html') && checkAuthStatus()) {
        window.location.href = '/src/index.html';
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
function login(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Validasyon
    if (!username || !password) {
        showError('Lütfen tüm alanları doldurun');
        return;
    }

    axios.post('http://localhost:8080/api/user/login', {
        username: username,
        password: password
    })
    .then(response => {
        const token = response.data;
        localStorage.setItem('token', token);
        localStorage.setItem('username', username);
        
        // Token'ın süresini ayarla (24 saat)
        const expirationTime = new Date().getTime() + 24 * 60 * 60 * 1000;
        localStorage.setItem('tokenExpiration', expirationTime);

        // Ana sayfaya yönlendir
        window.location.href = '/src/index.html';
    })
    .catch(error => {
        if (error.response) {
            if (error.response.status === 401) {
                showError('Geçersiz kullanıcı adı veya şifre');
            } else {
                showError('Giriş sırasında bir hata oluştu: ' + error.response.data);
            }
        } else {
            showError('Giriş sırasında bir hata oluştu');
        }
        console.error('Login error:', error);
    });
}

// Register işlemi
function register(event) {
    event.preventDefault();
    
    const username = document.getElementById('reg-username').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;
    const confirmPassword = document.getElementById('reg-confirm-password').value;

    // Validasyonlar
    if (!username || !email || !password || !confirmPassword) {
        showError('Lütfen tüm alanları doldurun');
        return;
    }

    if (password !== confirmPassword) {
        showError('Şifreler eşleşmiyor');
        return;
    }

    // Email formatı kontrolü
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showError('Geçerli bir email adresi girin');
        return;
    }

    axios.post('http://localhost:8080/api/user/register', {
        username: username,
        email: email,
        password: password
    })
    .then(response => {
        const successMessage = document.getElementById('success-message');
        successMessage.textContent = 'Kayıt başarılı! Giriş yapabilirsiniz.';
        successMessage.classList.remove('hidden');
        showLoginForm();
        
        // 3 saniye sonra mesajı gizle
        setTimeout(() => {
            successMessage.classList.add('hidden');
        }, 3000);
    })
    .catch(error => {
        if (error.response) {
            if (error.response.status === 409) {
                showError('Bu kullanıcı adı veya email zaten kullanımda');
            } else {
                showError('Kayıt sırasında bir hata oluştu: ' + error.response.data.message);
            }
        } else {
            showError('Kayıt sırasında bir hata oluştu');
        }
        console.error('Registration error:', error);
    });
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
    window.location.href = '/src/login.html';
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