/** @type {import('next').NextConfig} */
const nextConfig = {
  // Output standalone para Docker (reduz tamanho da imagem)
  output: 'standalone',

  // Configurações do Turbopack (agora estável)
  turbopack: {
    resolveAlias: {
      underscore: 'lodash',
    },
  },
  // Configuração para imagens externas
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
  // Configuração para resolver problemas de build no Windows
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
        ignored: /node_modules/,
      }
    }

    return config
  },
  // Otimizações para desenvolvimento
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
}

export default nextConfig