const API_URL = 'https://lezzet-duragi-backend-production.up.railway.app/api';

export function loadMenuItems(category = 'all') {
    const container = document.getElementById('menu-items');
    container.innerHTML = '';

    axios.get(`${API_URL}/products${category === 'all' ? '' : '/category/' + category}`)
        .then(response => {
            const products = response.data;
            products.forEach(item => {
            
                const safeItem = {
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    category: item.category,
                    description: item.description,
                    imageUrl: item.imageUrl
                };
                
                const itemHtml = `
                    <div class="bg-slate-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition duration-300">
                        <img src="${item.imageUrl}" alt="${item.name}" class="w-full h-48 object-cover">
                        <div class="p-6">
                            <h3 class="text-xl font-semibold mb-2">${item.name}</h3>
                            <p class="text-gray-400 mb-4">${item.description}</p>
                            <div class="flex justify-between items-center">
                                <span class="text-lg font-bold text-yellow-500">${item.price.toFixed(2)} TL</span>
                                <button onclick='addToCart(${JSON.stringify(safeItem).replace(/'/g, "&#39;")})' 
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