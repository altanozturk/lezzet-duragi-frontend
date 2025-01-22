import menu1 from '../img/menu_1.jpg';
import menu2 from '../img/menu_2.jpg';
import menu4 from '../img/menu_4.jpg';

export function loadPopularItems() {
  const popularItems = [
    {
      name: 'Tavuk Döner',
      image: menu1,
      price: '129.99',
      description: 'Özel soslu tavuk döner'
    },
    {
      name: 'Patso',
      image: menu2,
      price: '99.99',
      description: 'Bol malzemeli patso'
    },
    {
      name: 'Pizza',
      image: menu4,
      price: '189.99',
      description: 'Karışık pizza'
    }
  ];

  const container = document.getElementById('popular-items');
  popularItems.forEach(item => {
    const itemHtml = `
      <div class="bg-slate-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition duration-300">
        <img src="${item.image}" alt="${item.name}" class="w-full h-48 object-cover">
        <div class="p-6">
          <h3 class="text-xl font-semibold mb-2">${item.name}</h3>
          <p class="text-gray-400 mb-4">${item.description}</p>
          <div class="flex justify-between items-center">
            <span class="text-lg font-bold text-yellow-500">${item.price} TL</span>
            <a href="/src/menu.html" class="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition shadow-lg shadow-yellow-500/20">
              Sipariş Ver
            </a>
          </div>
        </div>
      </div>
    `;
    container.innerHTML += itemHtml;
  });
} 