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
      'cryptologos.cc'
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
      }
    ]
  },
}

module.exports = nextConfig;