import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [],
  },
  experimental: {},
  // Allow serving uploaded images from /public/uploads
};

export default nextConfig;
