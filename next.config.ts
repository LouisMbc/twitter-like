import type { NextConfig } from 'next';
import type { Configuration as WebpackConfig } from 'webpack';

/** @type {import('next').NextConfig} */
// Define interfaces for typing
interface HeaderObject {
  key: string;
  value: string;
}

interface HeaderConfig {
  source: string;
  headers: HeaderObject[];
}

interface CustomNextConfig extends NextConfig {
  webpack: (config: WebpackConfig) => WebpackConfig;
  images: {
    domains: string[];
  };
  headers: () => Promise<HeaderConfig[]>;
  eslint: {
    ignoreDuringBuilds: boolean;
  };
  typescript: {
    ignoreBuildErrors: boolean;
  };
  experimental: {
    serverComponents: boolean;
    serverActions: boolean;
  };
}

const nextConfig: CustomNextConfig = {
  webpack: (config: WebpackConfig): WebpackConfig => {
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
  headers: async (): Promise<HeaderConfig[]> => {
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
            value: 'credentialless' // Changement important ici
          },
          {
            key: 'Cross-Origin-Resource-Policy',
            value: 'cross-origin' // Ajout pour autoriser les ressources cross-origin
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
  // Configuration pour les composants serveur
  experimental: {
    serverComponents: true,
    serverActions: true,
  },
};

module.exports = nextConfig;