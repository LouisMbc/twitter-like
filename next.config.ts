import type { Configuration as WebpackConfig } from 'webpack';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  webpack: (config: WebpackConfig, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...config.resolve.alias,
      'fs': false,
      'path': false,
    };

    // Fallbacks basiques pour Node.js
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
    };

    return config;
  },
  images: {
    domains: ['ekpximtmuwwxdkhrepna.supabase.co'],
  },
  headers: async () => {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin'
          },
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'unsafe-none' 
          },
          {
            key: 'Cross-Origin-Resource-Policy',
            value: 'cross-origin' 
          }
        ]
      }
    ];
  },
  // Ignorer les erreurs pendant le build
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Configuration pour les actions serveur uniquement
  experimental: {
    // Retrait de serverComponents car c'est maintenant la valeur par défaut
    serverActions: {
      allowedOrigins: ['localhost:3000'],
      bodySizeLimit: '2mb'
    }
  },
};

module.exports = nextConfig;