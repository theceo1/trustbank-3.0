/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    domains: ['localhost'],
  },
}

module.exports = nextConfig
