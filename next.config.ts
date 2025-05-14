/** @type {import('next').NextConfig} */



const nextConfig = {
  webpack: (config: { resolve: { alias: any; fallback: any; }; }) => {
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