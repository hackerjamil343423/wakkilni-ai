import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Performance optimizations */
  reactStrictMode: false, // Keep disabled for now, can enable after fixing errors

  // Enable standalone output for Docker/container deployments
  output: 'standalone',

  typescript: {
    ignoreBuildErrors: false, // Changed: Fix TypeScript errors instead of hiding them
  },

  eslint: {
    ignoreDuringBuilds: true, // Allow builds with ESLint warnings - fix incrementally
  },

  // Image optimization settings
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pub-6f0cf05705c7412b93a792350f3b3aa5.r2.dev",
      },
      {
        protocol: "https",
        hostname: "jdj14ctwppwprnqu.public.blob.vercel-storage.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
    formats: ['image/avif', 'image/webp'], // Enable modern image formats
  },

  // Enable experimental optimizations
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-icons',
      'recharts',
      'framer-motion',
    ],
  },

  // Enable compression
  compress: true,

  // Disable powered by header
  poweredByHeader: false,

};

export default nextConfig;
