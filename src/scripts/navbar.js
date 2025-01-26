// Environment variables'ı import et
const API_URL = 'https://lezzet-duragi-backend-production.up.railway.app/api';

// Fonksiyonları export et
export async function updateNavbar() {
    const token = localStorage.getItem("token");
    const username = localStorage.getItem("username");
    const navbarPlaceholder = document.getElementById("navbar-placeholder");

    // Token yoksa veya geçersizse kullanıcıyı çıkış yapmış sayalım
    if (!token || !isTokenValid()) {
        renderNavbar();
        return;
    }

    // Admin kontrolü
    try {
        const adminResponse = await axios.get(`${API_URL}/user/check-admin`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        // Token varsa ve geçerliyse kullanıcı bilgilerini göster
        renderNavbar(username, adminResponse.data.isAdmin);

        // Mobil menü toggle'ı ayarla
        const mobileMenuButton = document.getElementById('mobile-menu-button');
        const mobileMenu = document.getElementById('mobile-menu');

        if (mobileMenuButton && mobileMenu) {
            mobileMenuButton.addEventListener('click', function() {
                mobileMenu.classList.toggle('hidden');
            });
        }

    } catch (error) {
        console.error('Error checking admin status:', error);
        renderNavbar(username, false);
    }
}

export function logout() {
    // Tüm auth verilerini temizle
    localStorage.removeItem("token");
    localStorage.removeItem("tokenExpiration");
    localStorage.removeItem("username");
    
    // Navbar'ı güncelle
    updateNavbar();
    
    // Ana sayfaya yönlendir
    window.location.href = "/index.html";
}

export function updateCartCount() {
    const token = localStorage.getItem('token');
    if (!token) return;

    axios.get(`${API_URL}/cart/count`, {
        headers: {
            'Authorization': 'Bearer ' + token
        }
    })
    .then(response => {
        const cartCount = response.data;
        const cartCountElement = document.getElementById('cart-count');
        if (cartCountElement) {
            cartCountElement.textContent = cartCount;
            cartCountElement.style.display = cartCount > 0 ? 'block' : 'none';
        }
    })
    .catch(error => {
        console.error('Error updating cart count:', error);
    });
}

// Yardımcı fonksiyonlar
function isTokenValid() {
    const token = localStorage.getItem("token");
    if (!token) return false;

    try {
        // Token'ı decode et
        const tokenData = JSON.parse(atob(token.split('.')[1]));
        const expirationTime = tokenData.exp * 1000;
        const currentTime = new Date().getTime();

        return currentTime < expirationTime;
    } catch (error) {
        return false;
    }
}

function renderNavbar(username = null, isAdmin = false) {
    const navbarPlaceholder = document.getElementById("navbar-placeholder");
    
    const authButtonsHtml = username 
        ? `
            <span class="text-gray-300">${username}</span>
            ${isAdmin ? '<a href="/admin.html" class="text-gray-300 hover:text-white transition">Admin Panel</a>' : ''}
            <button onclick="logout()" class="text-gray-300 hover:text-white transition">Çıkış Yap</button>
        `
        : '<a href="/login.html" class="text-gray-300 hover:text-white transition">Giriş Yap</a>';

    const mobileAuthButtonsHtml = username 
        ? `
            <span class="block text-gray-300">${username}</span>
            ${isAdmin ? '<a href="/admin.html" class="block text-gray-300 hover:text-white transition">Admin Panel</a>' : ''}
            <button onclick="logout()" class="block text-gray-300 hover:text-white transition">Çıkış Yap</button>
        `
        : '<a href="/login.html" class="block text-gray-300 hover:text-white transition">Giriş Yap</a>';

    navbarPlaceholder.innerHTML = `
        <nav class="bg-slate-900 fixed w-full z-50 top-0 border-b border-slate-800">
            <div class="container mx-auto px-4">
                <div class="flex justify-between items-center h-16">
                    <!-- Logo -->
                    <a href="/index.html" class="text-2xl font-bold text-yellow-500">Lezzet Durağı</a>

                    <!-- Mobil Menü Butonu -->
                    <button id="mobile-menu-button" class="lg:hidden text-gray-300 hover:text-white">
                        <i class="fas fa-bars text-xl"></i>
                    </button>

                    <!-- Desktop Menü -->
                    <div class="hidden lg:flex items-center space-x-8">
                        <a href="/index.html" class="text-gray-300 hover:text-white transition">Ana Sayfa</a>
                        <a href="/menu.html" class="text-gray-300 hover:text-white transition">Menü</a>
                        <a href="/about.html" class="text-gray-300 hover:text-white transition">Hakkımızda</a>
                        <a href="/contact.html" class="text-gray-300 hover:text-white transition">İletişim</a>
                        <div id="auth-buttons" class="flex items-center space-x-4">
                            ${authButtonsHtml}
                        </div>
                        <a href="/sepet.html" class="relative text-gray-300 hover:text-white transition">
                            <i class="fas fa-shopping-cart"></i>
                            <span id="cart-count" class="absolute -top-2 -right-2 bg-yellow-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">0</span>
                        </a>
                    </div>
                </div>

                <!-- Mobil Menü -->
                <div id="mobile-menu" class="lg:hidden hidden">
                    <div class="px-2 pt-2 pb-3 space-y-1">
                        <a href="/index.html" class="block px-3 py-2 text-gray-300 hover:text-white transition">Ana Sayfa</a>
                        <a href="/menu.html" class="block px-3 py-2 text-gray-300 hover:text-white transition">Menü</a>
                        <a href="/about.html" class="block px-3 py-2 text-gray-300 hover:text-white transition">Hakkımızda</a>
                        <a href="/contact.html" class="block px-3 py-2 text-gray-300 hover:text-white transition">İletişim</a>
                        <div id="mobile-auth-buttons" class="px-3 py-2">
                            ${mobileAuthButtonsHtml}
                        </div>
                        <a href="/sepet.html" class="block px-3 py-2 text-gray-300 hover:text-white transition">
                            <i class="fas fa-shopping-cart"></i>
                            <span id="mobile-cart-count" class="ml-2 bg-yellow-500 text-white text-xs rounded-full px-2 py-1">0</span>
                        </a>
                    </div>
                </div>
            </div>
        </nav>
    `;
}

// Fonksiyonları global scope'a ekle
window.logout = logout;

// Otomatik başlatma
document.addEventListener('DOMContentLoaded', () => {
    updateNavbar();
    updateCartCount();

    // Mobil menü toggle
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');

    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', function() {
            mobileMenu.classList.toggle('hidden');
        });
    }
});