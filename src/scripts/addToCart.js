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

export function addToCart(product) {
    const token = localStorage.getItem('token');
    if (!token || !isTokenValid()) {
        window.location.href = '/login.html';
        return;
    }

    console.log('Adding to cart:', product); // Debug için

    const cartItem = {
        productId: product.id,
        productName: product.name,
        price: product.price,
        quantity: 1,
        imageUrl: product.imageUrl
    };

    axios.post(`${API_URL}/cart/add`, cartItem, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        }
    })
    .then(response => {
        showNotification('Ürün sepete eklendi!', 'success');
        updateCartCount();
    })
    .catch(error => {
        console.error('Error:', error);
        if (error.response && error.response.status === 401) {
            handleTokenExpiration();
        } else {
            showNotification('Ürün eklenirken bir hata oluştu!', 'error');
        }
    });
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

function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.right = '20px';
    notification.style.padding = '10px 20px';
    notification.style.borderRadius = '5px';
    notification.style.zIndex = '1000';
    
    if (type === 'success') {
        notification.style.backgroundColor = '#4CAF50';
        notification.style.color = 'white';
    } else {
        notification.style.backgroundColor = '#f44336';
        notification.style.color = 'white';
    }
    
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}
