import { defineConfig } from 'vite'

export default defineConfig({
  root: 'src',  // src klasörünü root olarak belirt
  build: {
    outDir: '../dist',  // build çıktısı için dist klasörü
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: '/index.html',  // ana giriş dosyası
        admin: '/admin.html', // admin sayfası
        login: '/login.html', // login sayfası
        menu: '/menu.html',
        contact: '/contact.html',
        cart: '/sepet.html',
        about: '/about.html'
      },
      external: [
        '/scripts/navbar.js',
        '/scripts/admin.js',
        '/scripts/auth.js',
        '/scripts/addToCart.js'
      ]
    }
  },
  publicDir: '../public', // Statik dosyalar için
  server: {
    port: 3000
  }
}) 