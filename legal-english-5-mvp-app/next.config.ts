import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: ["*.trycloudflare.com", "82.38.44.28"],
};

export default nextConfig;
