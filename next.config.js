/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ekpximtmuwwxdkhrepna.supabase.co',
      },
    ],
  },
};

module.exports = nextConfig;