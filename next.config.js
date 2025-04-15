/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { dev, isServer }) => {
    // Disable cache in development
    if (dev) {
      config.cache = false;
    }
    
    return config;
  },
  // Disable webpack persistent cache
  experimental: {
    disableOptimizedLoading: true,
  },
};

module.exports = nextConfig;
