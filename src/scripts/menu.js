const API_URL = 'https://lezzet-duragi-backend-production.up.railway.app/api';

export function loadMenuItems(category = 'all') {
    const container = document.getElementById('menu-items');
    container.innerHTML = '';

    axios.get(`${API_URL}/products${category === 'all' ? '' : '/category/' + category}`)
        .then(response => {
            const products = response.data;
            products.forEach(item => {
                const itemHtml = `
                    <div class="bg-slate-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition duration-300">
                        <img src="${item.imageUrl}" alt="${item.name}" class="w-full h-48 object-cover">
                        <div class="p-6">
                            <h3 class="text-xl font-semibold mb-2">${item.name}</h3>
                            <p class="text-gray-400 mb-4">${item.description}</p>
                            <div class="flex justify-between items-center">
                                <span class="text-lg font-bold text-yellow-500">${item.price.toFixed(2)} TL</span>
                                <button onclick="addToCart(${JSON.stringify(item)})" 
                                        class="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition shadow-lg shadow-yellow-500/20">
                                    Sepete Ekle
                                </button>
                            </div>
                        </div>
                    </div>
                `;
                container.innerHTML += itemHtml;
            });
        })
        .catch(error => console.error('Error loading menu items:', error));
}

export function filterCategory(category) {
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.classList.remove('bg-yellow-500');
        btn.classList.add('bg-slate-700');
    });

    event.target.classList.remove('bg-slate-700');
    event.target.classList.add('bg-yellow-500');

    loadMenuItems(category);
}

// Scrollbar style
const style = document.createElement('style');
style.textContent = `
    .scrollbar-hide::-webkit-scrollbar {
        display: none;
    }
    .scrollbar-hide {
        -ms-overflow-style: none;
        scrollbar-width: none;
    }
`;
document.head.appendChild(style);

function displayProducts(products, category) {
    const productContainer = document.getElementById('productContainer');
    
    if (!products || products.length === 0) {
        productContainer.innerHTML = `
            <div class="text-center text-gray-400 py-8">
                Bu kategoride henüz ürün bulunmamaktadır
            </div>
        `;
        return;
    }

    const filteredProducts = category === 'all' 
        ? products 
        : products.filter(product => product.category === category);

    if (filteredProducts.length === 0) {
        productContainer.innerHTML = `
            <div class="text-center text-gray-400 py-8">
                Bu kategoride henüz ürün bulunmamaktadır
            </div>
        `;
        return;
    }

    productContainer.innerHTML = filteredProducts.map(product => `
        <div class="bg-slate-800 rounded-lg overflow-hidden shadow-lg">
            <img src="${product.imageUrl}"  // Direkt base64 stringi kullan
                 alt="${product.name}"
                 class="w-full h-48 object-cover">
            <div class="p-4">
                <h3 class="text-lg font-semibold mb-2">${product.name}</h3>
                <p class="text-gray-400 text-sm mb-4">${product.description}</p>
                <div class="flex justify-between items-center">
                    <span class="text-yellow-500 font-bold">${product.price.toFixed(2)} TL</span>
                    <button onclick="addToCart(${JSON.stringify(product)})"
                            class="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition">
                        Sepete Ekle
                    </button>
                </div>
            </div>
        </div>
    `).join('');
} 