import withPWAInit from '@ducanh2912/next-pwa';

const withPWA = withPWAInit({
  dest: 'public',
  register: true,
  skipWaiting: true,

  // Desativa em desenvolvimento para não interferir no hot reload
  disable: process.env.NODE_ENV === 'development',

  // Fallback para modo offline
  fallbacks: {
    document: '/offline',
  },

  // Configurações Workbox
  workboxOptions: {
    disableDevLogs: true,

    runtimeCaching: [
      // Páginas HTML — NetworkFirst: tenta rede, cai no cache se offline
      {
        urlPattern: ({ request }) => request.mode === 'navigate',
        handler: 'NetworkFirst',
        options: {
          cacheName: 'pages-cache',
          networkTimeoutSeconds: 10,
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 24 * 60 * 60, // 24h
          },
        },
      },

      // Arquivos estáticos (_next/static) — CacheFirst: sempre do cache
      {
        urlPattern: /\/_next\/static\/.*/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'next-static-cache',
          expiration: {
            maxEntries: 200,
            maxAgeSeconds: 365 * 24 * 60 * 60, // 1 ano (imutáveis pelo hash)
          },
        },
      },

      // Imagens — StaleWhileRevalidate: responde rápido, atualiza em background
      {
        urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/i,
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'images-cache',
          expiration: {
            maxEntries: 100,
            maxAgeSeconds: 7 * 24 * 60 * 60, // 7 dias
          },
        },
      },

      // Fontes Google — CacheFirst
      {
        urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'google-fonts-cache',
          expiration: {
            maxEntries: 20,
            maxAgeSeconds: 365 * 24 * 60 * 60,
          },
        },
      },

      // API interna — NetworkFirst (NUNCA cacheia dados sensíveis por muito tempo)
      {
        urlPattern: ({ url }) => url.pathname.startsWith('/api/'),
        handler: 'NetworkFirst',
        options: {
          cacheName: 'api-cache',
          networkTimeoutSeconds: 8,
          expiration: {
            maxEntries: 30,
            maxAgeSeconds: 5 * 60, // 5 minutos — cache curto para APIs
          },
        },
      },
    ],
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },

  turbopack: {
    resolveAlias: {
      underscore: 'lodash',
    },
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
    ],
  },

  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
        ignored: /node_modules/,
      };
    }
    return config;
  },

  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
};

export default withPWA(nextConfig);
