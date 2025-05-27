import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    turbo: {}, // ✅ Disables Turbopack
  },
};

export default nextConfig;
