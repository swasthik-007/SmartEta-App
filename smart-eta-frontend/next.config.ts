import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  experimental: {
    turbo: {}, // ✅ Disables Turbopack
  },
}

export default nextConfig
