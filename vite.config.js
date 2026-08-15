import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: '동반하개 - 반려동물 동반여행 정보',
        short_name: '동반하개',
        description: '가기 전에 미리 확인하는 반려동물 출입 조건',
        theme_color: '#14171A',
        background_color: '#14171A',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
    }),
  ],
  server: {
    port: 5173,
  },
  // maplibre-gl은 내부적으로 ES 모듈 워커를 쓰는데, Vite 기본값(iife)과 안 맞아서 명시해줘야 함
  worker: {
    format: 'es',
  },
  // esbuild의 dev 의존성 사전번들링이 maplibre-gl의 내부 워커 참조를 깨뜨려서 제외해야 함
  optimizeDeps: {
    exclude: ['maplibre-gl'],
  },
})
