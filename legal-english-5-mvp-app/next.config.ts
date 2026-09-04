import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // The floating "N" dev badge sat on top of the sidebar avatar during review.
  devIndicators: false,
  // Dev-only: origins allowed to load /_next dev resources (HMR, RSC). Without
  // 127.0.0.1 here the app never hydrates when opened by IP instead of localhost.
  allowedDevOrigins: ["*.trycloudflare.com", "82.38.44.28", "127.0.0.1", "localhost"],
};

export default nextConfig;
