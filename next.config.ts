import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Ignore les erreurs TypeScript pendant le build sur Render
    ignoreBuildErrors: true,
  },
  eslint: {
    // Ignore les erreurs ESLint pendant le build
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;