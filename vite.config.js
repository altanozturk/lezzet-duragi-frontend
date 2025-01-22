import { defineConfig } from 'vite'
import { resolve } from 'path'

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
      }
    },
    assetsDir: 'assets',  // Eklendi
    copyPublicDir: true   // Eklendi
  },
  publicDir: '../public', // Statik dosyalar için
  server: {
    port: 3000
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@scripts': resolve(__dirname, './public/scripts')
    }
  }
}) 