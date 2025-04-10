import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  distDir: '.next',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'ealzcshawkiwchggnarj.supabase.co',
      },
    ],
  },
};

export default nextConfig;
