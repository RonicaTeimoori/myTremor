import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: 'MyTremor',
    short_name: 'MyTremor',
    description: 'Track your hand tremors with simple tests, exercises, and a daily check-in.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#f7fbfc',
    theme_color: '#0891b2',
    orientation: 'portrait',
    categories: ['health', 'medical', 'lifestyle'],
    icons: [
      // Regular icons (shown at full size — should look like the original logo)
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      // Maskable icons (have padding so Android/Chrome can crop to circle/squircle)
      {
        src: '/icon-maskable-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icon-maskable-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  }
}
