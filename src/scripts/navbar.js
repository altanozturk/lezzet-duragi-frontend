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
    
    navbarPlaceholder.innerHTML = `
        <nav class="bg-slate-800 shadow-md h-16">
            <div class="container mx-auto px-4 text-gray-100 py-3 flex items-center h-16">
                <a href="/index.html" class="flex items-center">
                    <span class="text-xl font-bold">Lezzet Durağı</span>
                </a>
                <div class="ml-12 flex space-x-8">
                    <a href="/index.html" class="flex items-center hover:text-yellow-400 transition">
                        <span class="mr-2"><i class="fa-solid fa-house"></i></span>
                        Ana Sayfa
                    </a>
                    <a href="/menu.html" class="flex items-center hover:text-yellow-400 transition">
                        <span class="mr-2"><i class="fa-solid fa-utensils"></i></span>
                        Menü
                    </a>
                    <a href="/about.html" class="flex items-center hover:text-yellow-400 transition">
                        <span class="mr-2"><i class="fa-solid fa-info-circle"></i></span>
                        Hakkımızda
                    </a>
                    <a href="/contact.html" class="flex items-center hover:text-yellow-400 transition">
                        <span class="mr-2"><i class="fa-solid fa-phone"></i></span>
                        İletişim
                    </a>
                    ${isAdmin ? `
                        <a href="/admin.html" class="flex items-center hover:text-yellow-400 transition">
                            <span class="mr-2"><i class="fa-solid fa-cog"></i></span>
                            Admin Paneli
                        </a>
                    ` : ''}
                </div>

                <div class="ml-auto flex items-center space-x-6">
                    <a href="/sepet.html" class="flex items-center hover:text-yellow-400 transition relative group">
                        <div class="relative">
                            <i class="fa-solid fa-shopping-cart text-xl"></i>
                            <span id="cart-count" class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-4 h-4 text-center text-[10px] font-bold shadow-md transform group-hover:scale-110 transition leading-4" style="display: none;">0</span>
                        </div>
                        <span class="ml-3">Sepetim</span>
                    </a>

                    ${username ? `
                        <div class="flex items-center space-x-4">
                            <span class="flex items-center">
                                <i class="fa-solid fa-user mr-2"></i>
                                ${username}
                            </span>
                            <button onclick="logout()" class="flex items-center hover:text-yellow-400 transition">
                                <i class="fa-solid fa-sign-out-alt mr-2"></i>
                                Çıkış
                            </button>
                        </div>
                    ` : `
                        <a href="/login.html" class="flex items-center hover:text-yellow-400 transition">
                            <i class="fa-solid fa-user mr-2"></i>
                            Giriş / Kayıt
                        </a>
                    `}
                </div>
            </div>
        </nav>
    `;
}

// Otomatik başlatma
document.addEventListener('DOMContentLoaded', () => {
    updateNavbar();
    updateCartCount();
});