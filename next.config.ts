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
  }
};

module.exports = nextConfig;
