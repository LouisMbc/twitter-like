module.exports = {
  reactStrictMode: true,
  // ...autres configurations...
  async redirects() {
    return [
      {
        source: '/',
        destination: '/',
        permanent: true,
      },
    ];
  },
};
