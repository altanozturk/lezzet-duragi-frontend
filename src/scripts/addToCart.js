const API_URL = 'https://lezzet-duragi-backend-production.up.railway.app/api';

// auth.js'den gerekli fonksiyonları import et
function isTokenValid() {
    const token = localStorage.getItem("token");
    if (!token) return false;

    try {
        const tokenData = JSON.parse(atob(token.split('.')[1]));
        const expirationTime = tokenData.exp * 1000;
        const currentTime = new Date().getTime();

        return currentTime < expirationTime;
    } catch (error) {
        return false;
    }
}

function handleTokenExpiration() {
    localStorage.removeItem('token');
    localStorage.removeItem('tokenExpiration');
    localStorage.removeItem('username');
    window.location.href = '/login.html';
}

export async function addToCart(product) {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = '/login.html';
            return;
        }

        const cartItem = {
            productId: product.productId,
            quantity: 1,
            priceAtAddition: product.price
        };

        await axios.post(`${API_URL}/cart/add`, cartItem, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        updateCartCount();
        showMessage('Ürün sepete eklendi!', 'success');
    } catch (error) {
        console.error('Error:', error);
        showMessage('Ürün sepete eklenirken bir hata oluştu!', 'error');
    }
}

function updateCartCount() {
    const token = localStorage.getItem('token');
    if (!token) return;

    console.log('Fetching cart count...'); 
    console.log('Token:', token); // Token'ı kontrol edelim

    // Önce endpoint'i test edelim
    fetch(`${API_URL}/cart/count`, {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + token
        }
    })
    .then(response => {
        console.log('Raw response:', response);
        return response.json();
    })
    .then(data => {
        console.log('Response data:', data);
    })
    .catch(error => console.error('Fetch error:', error));

    // Mevcut axios çağrısı
    axios.get(`${API_URL}/cart/count`, {
        headers: {
            'Authorization': 'Bearer ' + token
        }
    })
    .then(response => {
        console.log('Cart count response:', response);
        const cartCount = response.data;
        const cartCountElement = document.getElementById('cart-count');
        if (cartCountElement) {
            cartCountElement.textContent = cartCount;
            cartCountElement.style.display = cartCount > 0 ? 'block' : 'none';
        }
    })
    .catch(error => {
        console.error('Error details:', {
            status: error.response?.status,
            data: error.response?.data,
            config: error.config,
            message: error.message
        });
    });
}

function showMessage(message, type) {
    // Mesaj gösterme mantığı...
}
