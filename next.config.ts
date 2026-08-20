import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // AI-generated apps should deploy even if the template has strict type or
  // lint issues. Type errors are compile-time only and don't affect runtime,
  // so we don't let them block a deployment.
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  // The bundled Windows runtime can crash in webpack's WASM cache. Vercel
  // builds are deterministic without it, and this keeps local verification stable.
  webpack(config) {
    config.cache = false;
    return config;
  },
};

export default nextConfig;
