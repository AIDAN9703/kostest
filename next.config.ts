import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.yachtworld.com',
      },
      {
        protocol: 'https',
        hostname: 'm.media-amazon.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.google.com',
      },
    ],
    domains: ['localhost'],
  },
  typescript: {
    ignoreBuildErrors: false, // Re-enable type checking
  },
  eslint: {
    ignoreDuringBuilds: false, // Re-enable linting
  },
};

export default nextConfig;
