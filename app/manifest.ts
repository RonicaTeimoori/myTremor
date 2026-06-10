import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'MyTremor',
    short_name: 'MyTremor',
    description: 'Track your hand tremors with simple tests, exercises, and a daily check-in.',
    start_url: '/',
    display: 'standalone',
    background_color: '#f7fbfc',
    theme_color: '#0891b2',
    orientation: 'portrait',
    categories: ['health', 'medical', 'lifestyle'],
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
      {
        src: '/apple-icon.png',
        sizes: '180x180',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any maskable',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any maskable',
      },
    ],
  }
}
