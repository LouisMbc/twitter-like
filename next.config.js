module.exports = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'example.com', // replace with your actual domain(s)
      },
    ],
  },
};