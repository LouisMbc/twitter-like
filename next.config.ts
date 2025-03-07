/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
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
  // Désactiver les erreurs ESLint pendant le build
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Désactiver les erreurs TypeScript pendant le build
  typescript: {
    ignoreBuildErrors: true,
  }
};

module.exports = nextConfig;
