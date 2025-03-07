/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      'fs': false,
      'path': false,
    };
    
    // Ajouter cette configuration pour FFmpeg
    config.module.rules.push({
      test: /\.wasm$/,
      type: 'asset/resource'
    });

    // Ajout du fallback node pour FFmpeg
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      crypto: false,
      os: false,
      buffer: false,
      stream: false,
    };

    return config;
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
            value: 'require-corp'
          }
        ]
      }
    ];
  },
  // Ajouter cette configuration pour le chargement des fichiers FFmpeg
  experimental: {
    outputFileTracingExcludes: {
      '*': [
        'node_modules/@ffmpeg/**/*',
      ],
    },
  }
};

module.exports = nextConfig;
