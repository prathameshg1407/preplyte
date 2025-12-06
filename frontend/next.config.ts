import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Ignore ESLint errors during builds
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Ignore TypeScript errors during builds (optional, remove if you want strict checks)
    // ignoreBuildErrors: true,
  },
  // Enable image optimization for external sources if needed
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // Recommended for production
  poweredByHeader: false,
  // Compress responses
  compress: true,
};

export default nextConfig;