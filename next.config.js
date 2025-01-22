/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    domains: [
      'localhost',
      'coin-images.coingecko.com',
      'raw.githubusercontent.com',
      'cryptologos.cc',
      'assets.coingecko.com',
      'cdn.jsdelivr.net'
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'coin-images.coingecko.com',
      },
      {
        protocol: 'https',
        hostname: 'raw.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'cryptologos.cc',
      },
      {
        protocol: 'https',
        hostname: 'assets.coingecko.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.jsdelivr.net',
      }
    ]
  },
}

module.exports = nextConfig;