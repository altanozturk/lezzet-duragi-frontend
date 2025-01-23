const API_URL = 'https://lezzet-duragi-backend-production.up.railway.app/api';

// Token kontrolünü ve admin kontrolünü bir fonksiyon içine alalım
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

document.addEventListener('DOMContentLoaded', function() {
    checkAdminStatus();
    loadOrders();
    loadProducts();
    setupProductForm();
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
    const container = document.getElementById('productList');
    if (!container) return;

    container.innerHTML = products.map(product => `
        <div class="bg-slate-700 p-4 rounded-lg flex items-center justify-between">
            <div class="flex items-center">
                <img src="https://lezzet-duragi-backend-production.up.railway.app${product.imageUrl}" 
                     alt="${product.name}" 
                     class="w-16 h-16 object-cover rounded-lg mr-4">
                <div>
                    <h3 class="font-semibold">${product.name}</h3>
                    <p class="text-gray-400">${product.price.toFixed(2)} TL</p>
                    <p class="text-sm text-gray-500">${getCategoryName(product.category)}</p>
                </div>
            </div>
            <div class="flex space-x-2">
                <button onclick="editProduct(${JSON.stringify(product).replace(/"/g, '&quot;')})" 
                    class="text-yellow-500 hover:text-yellow-600">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="deleteProduct(${product.id})" 
                    class="text-red-500 hover:text-red-600">
                    <i class="fas fa-trash"></i>
                </button>
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

// Resim sıkıştırma fonksiyonu
async function compressImage(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.onload = function() {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                // Maksimum boyutlar
                const MAX_WIDTH = 800;
                const MAX_HEIGHT = 800;

                // Boyutları oranları koruyarak küçült
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

                // Sıkıştırılmış resmi JPEG formatında al
                canvas.toBlob((blob) => {
                    resolve(new File([blob], file.name, {
                        type: 'image/jpeg',
                        lastModified: Date.now()
                    }));
                }, 'image/jpeg', 0.7); // 0.7 kalite oranı
            };
            img.src = e.target.result;
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

    // Boş alan kontrolü
    if (!name || !price || !imageFile || !category || !description) {
        showMessage('Lütfen tüm alanları doldurun!', 'error');
        return;
    }

    // Fiyat kontrolü
    if (price <= 0) {
        showMessage('Fiyat 0\'dan büyük olmalıdır!', 'error');
        return;
    }

    try {
        // Resmi sıkıştır
        const compressedImage = await compressImage(imageFile);
        
        const product = {
            name,
            price: parseFloat(price),
            imageUrl: compressedImage,
            category,
            description
        };

        await axios.post(`${API_URL}/products/admin/add`, product, {
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

async function deleteProduct(id) {
    if (!confirm('Bu ürünü silmek istediğinizden emin misiniz?')) return;
    
    try {
        const response = await axios.delete(`${API_URL}/products/admin/delete/${id}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        if (response.status === 200) {
            loadProducts(); // Başarılı olursa listeyi yenile
        } else {
            console.error('Error deleting product:', response.data);
            alert('Ürün silinirken bir hata oluştu');
        }
    } catch (error) {
        console.error('Error deleting product:', error);
        alert('Ürün silinirken bir hata oluştu');
    }
}

// Tab yönetimi
function showTab(tabName) {
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

// Siparişleri yükle
async function loadOrders() {
    try {
        const response = await axios.get(`${API_URL}/orders/admin/all`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        console.log('Orders response:', response.data); // Debug için veriyi görelim
        
        // Response.data bir array değilse array'e çevirelim
        const orders = Array.isArray(response.data) ? response.data : [];
        displayOrders(orders);
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

// Sipariş detaylarını göster
async function showOrderDetails(orderId) {
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

function closeOrderDetails() {
    document.getElementById('orderDetailsModal').classList.add('hidden');
}

// Sayfa yüklendiğinde products tab'ını aktif et
document.addEventListener('DOMContentLoaded', function() {
    showTab('products');
});

function setupProductForm() {
    const form = document.getElementById('productForm');
    if (!form) {
        console.error('Product form not found');
        return;
    }

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        console.log('Form submitted');

        try {
            const nameInput = document.getElementById('productName');
            const priceInput = document.getElementById('productPrice');
            const categoryInput = document.getElementById('productCategory');
            const imageInput = document.getElementById('productImage');
            const token = localStorage.getItem('token');

            if (!nameInput || !priceInput || !categoryInput || !imageInput) {
                console.error('Form elements missing');
                showMessage('Form elemanları bulunamadı!', 'error');
                return;
            }

            console.log('Form data:', {
                name: nameInput.value,
                price: priceInput.value,
                category: categoryInput.value,
                image: imageInput.files[0]
            });

            const formData = new FormData();
            formData.append('name', nameInput.value);
            formData.append('price', priceInput.value);
            formData.append('category', categoryInput.value);

            if (imageInput.files[0]) {
                const compressedImage = await compressImage(imageInput.files[0]);
                formData.append('image', compressedImage, imageInput.files[0].name);
            }

            const response = await axios.post(`${API_URL}/products/admin/add`, formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            console.log('Response:', response);

            showMessage('Ürün başarıyla eklendi!', 'success');
            form.reset();
            document.getElementById('imagePreview').classList.add('hidden');
            document.getElementById('fileName').textContent = 'Resim seçilmedi';
            loadProducts();

        } catch (error) {
            console.error('Error saving product:', error);
            showMessage(`Ürün kaydedilirken bir hata oluştu: ${error.response?.data?.message || error.message}`, 'error');
        }
    });
} 