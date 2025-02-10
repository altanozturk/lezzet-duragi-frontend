const API_URL = 'https://lezzet-duragi-backend-production.up.railway.app/api';

async function checkAdminStatus() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/login.html';
        return;
    }

    try {
        const response = await axios.get(`${API_URL}/user/check-admin`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.data.isAdmin) {
            window.location.href = '/index.html';
            return;
        }
        
        // Kullanıcı admin ise loading ekranını gizle ve içeriği göster
        document.getElementById('loading').classList.add('hidden');
        document.getElementById('content').classList.remove('hidden');
        
        // Sayfayı yükle
        loadProducts();
        setupEventListeners();
        
    } catch (error) {
        console.error('Error checking admin status:', error);
        window.location.href = '/login.html';
    }
}

function setupEventListeners() {
    document.getElementById('productForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (!this.checkValidity()) {
            return;
        }

        handleSubmit(e);
    });
}

document.addEventListener('DOMContentLoaded', async function() {
    // Token kontrolü
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/login.html';
        return;
    }

    // Admin kontrolü
    try {
        const response = await axios.get(`${API_URL}/user/check-admin`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.data.isAdmin) {
            window.location.href = '/index.html';
            return;
        }
        
        // Kullanıcı admin ise loading ekranını gizle ve içeriği göster
        document.getElementById('loading').classList.add('hidden');
        document.getElementById('content').classList.remove('hidden');
        
        // Sayfayı yükle
        loadProducts();
        
        // Form submit event listener'ı bir kere ekle
        const form = document.getElementById('productForm');
        if (form) {
            form.removeEventListener('submit', handleSubmit); // Varsa önceki listener'ı kaldır
            form.addEventListener('submit', handleSubmit);
        }
        
    } catch (error) {
        console.error('Error checking admin status:', error);
        window.location.href = '/login.html';
    }
});

async function loadProducts() {
    try {
        const response = await axios.get(`${API_URL}/products`);
        const products = response.data;
        displayProducts(products);
    } catch (error) {
        console.error('Error loading products:', error);
        showMessage('Ürünler yüklenirken bir hata oluştu!', 'error');
    }
}

function displayProducts(products) {
    const productList = document.getElementById('productList');
    if (!products || products.length === 0) {
        productList.innerHTML = `
            <div class="col-span-full text-center text-gray-400 py-12 bg-slate-800/50 rounded-xl backdrop-blur-sm">
                <i class="fas fa-box-open text-4xl mb-4"></i>
                <p>Henüz ürün bulunmamaktadır</p>
            </div>
        `;
        return;
    }

    productList.innerHTML = products.map(product => `
        <div class="bg-slate-800/50 backdrop-blur-sm rounded-xl overflow-hidden shadow-xl border border-slate-600/20 transition duration-300 hover:transform hover:scale-[1.02]">
            <div class="relative">
                <img src="${product.imageUrl}" 
                     alt="${product.name}" 
                     class="w-full h-48 object-cover">
                <div class="absolute top-0 right-0 m-2 bg-yellow-500 text-white px-2 py-1 rounded-lg text-sm font-semibold">
                    ${getCategoryName(product.category)}
                </div>
            </div>
            <div class="p-6">
                <div class="flex justify-between items-start mb-4">
                    <h3 class="font-semibold text-lg">${product.name}</h3>
                    <span class="text-yellow-500 font-bold">${product.price.toFixed(2)} TL</span>
                </div>
                <p class="text-gray-400 text-sm mb-6">${product.description}</p>
                <div class="flex justify-end space-x-3">
                    <button onclick="editProduct(${JSON.stringify(product).replace(/"/g, '&quot;')})"
                        class="text-yellow-500 hover:text-yellow-600 transition p-2">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="deleteProduct(${product.id})"
                        class="text-red-500 hover:text-red-600 transition p-2">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function getCategoryName(category) {
    const categories = {
        'durum': 'Dürüm',
        'patso': 'Patso',
        'pizza': 'Pizza',
        'sides': 'Yan Ürünler',
        'drinks': 'İçecekler'
    };
    return categories[category] || category;
}

// Resim önizleme fonksiyonu
window.previewImage = function(event) {
    const file = event.target.files[0];
    if (file) {
        // Dosya adını göster
        document.getElementById('fileName').textContent = file.name;
        
        // Önizleme göster
        const reader = new FileReader();
        reader.onload = function(e) {
            const preview = document.getElementById('imagePreview');
            preview.classList.remove('hidden');
            preview.querySelector('img').src = e.target.result;
        }
        reader.readAsDataURL(file);
    }
}

// Resmi sıkıştıran fonksiyonu güncelle
async function compressImage(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.src = e.target.result;
            
            img.onload = function() {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;
                
                // Maksimum boyutları belirle
                const MAX_WIDTH = 800;
                const MAX_HEIGHT = 600;
                
                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }
                }
                
                canvas.width = width;
                canvas.height = height;
                
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                
                // Base64 formatında sıkıştırılmış resmi döndür
                const base64String = canvas.toDataURL('image/jpeg', 0.7);
                resolve(base64String);
            };
        };
        reader.readAsDataURL(file);
    });
}

// handleSubmit fonksiyonunu güncelle
async function handleSubmit(e) {
    e.preventDefault();
    
    const name = document.getElementById('productName').value.trim();
    const price = document.getElementById('productPrice').value;
    const imageFile = document.getElementById('productImage').files[0];
    const category = document.getElementById('productCategory').value;
    const description = document.getElementById('productDescription').value.trim();

    if (!name || !price || !imageFile || !category || !description) {
        showMessage('Lütfen tüm alanları doldurun!', 'error');
        return;
    }

    try {
        const base64Image = await compressImage(imageFile);
        
        const product = {
            name,
            price: parseFloat(price),
            imageUrl: base64Image,  // Base64 stringi direkt olarak gönder
            category,
            description
        };

        const response = await axios.post(`${API_URL}/products/admin/add`, product, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        showMessage('Ürün başarıyla eklendi!', 'success');
        e.target.reset();
        document.getElementById('imagePreview').classList.add('hidden');
        document.getElementById('fileName').textContent = 'Resim seçilmedi';
        loadProducts();
    } catch (error) {
        console.error('Error adding product:', error);
        showMessage('Ürün eklenirken bir hata oluştu!', 'error');
    }
}

// Mesaj gösterme fonksiyonu
function showMessage(text, type) {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = text;
    messageDiv.classList.remove('hidden', 'bg-green-500', 'bg-red-500');
    
    if (type === 'success') {
        messageDiv.classList.add('bg-green-500', 'text-white');
    } else {
        messageDiv.classList.add('bg-red-500', 'text-white');
    }
    
    // 3 saniye sonra mesajı gizle
    setTimeout(() => {
        messageDiv.classList.add('hidden');
    }, 3000);
}

// Ürün silme fonksiyonunu global scope'a ekle
window.deleteProduct = async function(id) {
    if (!confirm('Bu ürünü silmek istediğinizden emin misiniz?')) return;
    
    try {
        const response = await axios.delete(`${API_URL}/products/admin/delete/${id}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        if (response.status === 200) {
            showMessage('Ürün başarıyla silindi!', 'success');
            loadProducts(); // Başarılı olursa listeyi yenile
        } else {
            console.error('Error deleting product:', response.data);
            showMessage('Ürün silinirken bir hata oluştu!', 'error');
        }
    } catch (error) {
        console.error('Error deleting product:', error);
        showMessage('Ürün silinirken bir hata oluştu!', 'error');
    }
}

// Tab yönetimi fonksiyonunu global scope'a ekle
window.showTab = function(tabName) {
    // Tab butonlarını güncelle
    document.querySelectorAll('[id$="-tab"]').forEach(tab => {
        tab.classList.remove('border-yellow-500', 'text-yellow-500');
    });
    document.getElementById(`${tabName}-tab`).classList.add('border-yellow-500', 'text-yellow-500');
    
    // Tab içeriklerini güncelle
    document.getElementById('products-content').classList.add('hidden');
    document.getElementById('orders-content').classList.add('hidden');
    document.getElementById(`${tabName}-content`).classList.remove('hidden');
    
    if (tabName === 'orders') {
        loadOrders();
    }
}

// Siparişleri yükleme fonksiyonunu da global scope'a ekle
window.loadOrders = async function() {
    try {
        const response = await axios.get(`${API_URL}/orders/admin/all`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        displayOrders(response.data);
    } catch (error) {
        console.error('Error loading orders:', error);
        showMessage('Siparişler yüklenirken bir hata oluştu!', 'error');
    }
}

// Siparişleri görüntüle
function displayOrders(orders) {
    const tbody = document.getElementById('orders-table-body');
    if (!orders || orders.length === 0) {
        tbody.innerHTML = `
            <tr class="border-t border-slate-700">
                <td colspan="5" class="px-6 py-4 text-center text-gray-400">
                    Henüz sipariş bulunmamaktadır
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = orders.map(order => `
        <tr class="border-t border-slate-700">
            <td class="px-6 py-4 text-center">#${order.id}</td>
            <td class="px-6 py-4 text-center">${order.user.username}</td>
            <td class="px-6 py-4 text-center">${new Date(order.orderDate).toLocaleString()}</td>
            <td class="px-6 py-4 text-center">${order.totalAmount.toFixed(2)} TL</td>
            <td class="px-6 py-4 text-center">
                <button onclick="showOrderDetails(${order.id})" 
                    class="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 transition">
                    Detay
                </button>
            </td>
        </tr>
    `).join('');
}

// Sipariş detaylarını göster fonksiyonunu global scope'a ekle
window.showOrderDetails = async function(orderId) {
    try {
        const response = await axios.get(`${API_URL}/orders/admin/detail/${orderId}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        const order = response.data;
        
        // Modal içeriğini doldur
        document.getElementById('orderDetailId').textContent = `#${order.id}`;
        document.getElementById('orderDetailDate').textContent = new Date(order.orderDate).toLocaleString();
        document.getElementById('orderDetailCustomer').textContent = order.fullName;
        document.getElementById('orderDetailPhone').textContent = order.phone;
        document.getElementById('orderDetailAddress').textContent = order.address;
        document.getElementById('orderDetailNote').textContent = order.note || '-';
        document.getElementById('orderDetailTotal').textContent = `${order.totalAmount.toFixed(2)} TL`;

        // Sipariş ürünlerini listele
        const itemsHtml = order.orderItems.map(item => `
            <tr class="border-t border-slate-600">
                <td class="px-4 py-2">${item.productName}</td>
                <td class="px-4 py-2 text-center">${item.quantity}</td>
                <td class="px-4 py-2 text-right">${item.priceAtOrder.toFixed(2)} TL</td>
                <td class="px-4 py-2 text-right">${(item.priceAtOrder * item.quantity).toFixed(2)} TL</td>
            </tr>
        `).join('');
        
        document.getElementById('orderDetailItems').innerHTML = itemsHtml;
        
        // Modal'ı göster
        document.getElementById('orderDetailsModal').classList.remove('hidden');
    } catch (error) {
        console.error('Error loading order details:', error);
        showMessage('Sipariş detayları yüklenirken bir hata oluştu!', 'error');
    }
}

// Modal kapatma fonksiyonunu da global scope'a ekle
window.closeOrderDetails = function() {
    document.getElementById('orderDetailsModal').classList.add('hidden');
}

// Sayfa yüklendiğinde products tab'ını aktif et
document.addEventListener('DOMContentLoaded', function() {
    showTab('products');
});

// Ürün düzenleme fonksiyonlarını ekle
window.editProduct = function(product) {
    const modal = document.getElementById('editProductModal');
    document.getElementById('editProductId').value = product.id;
    document.getElementById('editProductName').value = product.name;
    document.getElementById('editProductPrice').value = product.price;
    document.getElementById('editProductCategory').value = product.category;
    document.getElementById('editProductDescription').value = product.description;
    document.getElementById('currentProductImage').src = product.imageUrl;  // Direkt base64 kullan
    modal.classList.remove('hidden');
}

window.closeEditModal = function() {
    document.getElementById('editProductModal').classList.add('hidden');
}

window.handleEditSubmit = async function(e) {
    e.preventDefault();
    
    const id = document.getElementById('editProductId').value;
    const name = document.getElementById('editProductName').value.trim();
    const price = document.getElementById('editProductPrice').value;
    const category = document.getElementById('editProductCategory').value;
    const description = document.getElementById('editProductDescription').value.trim();
    const imageFile = document.getElementById('editProductImage').files[0];

    try {
        let imageUrl = null;
        if (imageFile) {
            imageUrl = await compressImage(imageFile);
        }

        const product = {
            id,
            name,
            price: parseFloat(price),
            category,
            description
        };

        if (imageUrl) {
            product.imageUrl = imageUrl;
        }

        await axios.put(`${API_URL}/products/admin/update/${id}`, product, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        showMessage('Ürün başarıyla güncellendi!', 'success');
        closeEditModal();
        loadProducts();
    } catch (error) {
        console.error('Error updating product:', error);
        showMessage('Ürün güncellenirken bir hata oluştu!', 'error');
    }
}

// Resim önizleme fonksiyonunu ekle
window.previewEditImage = function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('currentProductImage').src = e.target.result;
        }
        reader.readAsDataURL(file);
    }
}

// setupProductForm fonksiyonunu kaldır ve yerine sadece event listener ekle
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('productForm');
    if (form) {
        form.addEventListener('submit', handleSubmit);
    }
}); 
 