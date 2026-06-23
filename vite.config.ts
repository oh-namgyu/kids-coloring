import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// 정적 배포(Vercel root) + PWA(오프라인·설치)
export default defineConfig({
  base: '/',
  build: { target: 'es2020' },
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['apple-touch-icon.png'],
      manifest: {
        name: '색칠 놀이',
        short_name: '색칠놀이',
        description: '3~6세 유아 터치 색칠놀이',
        lang: 'ko',
        theme_color: '#fef6ff',
        background_color: '#fef6ff',
        display: 'standalone',
        orientation: 'any',
        start_url: '/',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' }
        ]
      },
      workbox: {
        // 앱 셸 + 모든 도안(svg)·아이콘 precache → 오프라인 동작
        globPatterns: ['**/*.{js,css,html,svg,png,ico,webmanifest}'],
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024
      }
    })
  ]
})
