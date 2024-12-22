/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  poweredByHeader: false,
  images: { 
    unoptimized: true,
    domains: ['localhost']
  },
  webpack: (config, { dev, isServer }) => {
    if (dev) {
      config.cache = false;
    }
    config.watchOptions = {
      poll: 1000,
      aggregateTimeout: 300,
    }
    return config;
  }
};

module.exports = nextConfig;
