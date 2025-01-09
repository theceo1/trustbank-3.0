/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: true,
  },
  webpack: (config, { isServer }) => {
    // Add custom webpack config here if needed
    return config;
  },
  images: {
    domains: ['localhost'],
  },
}

module.exports = nextConfig
