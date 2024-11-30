/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  poweredByHeader: false,
  reactStrictMode: true,
  swcMinify: true,
  images: { 
    unoptimized: true,
    domains: ['localhost']
  },
  webpack: (config, { dev, isServer }) => {
    // Force Next.js to use the native fetch implementation
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    };

    if (dev) {
      config.cache = false;
    }

    return config;
  },
  experimental: {
    // Disable middleware to prevent caching issues
    middleware: false,
    // Enable app directory features
    appDir: true,
  },
};

module.exports = nextConfig;
