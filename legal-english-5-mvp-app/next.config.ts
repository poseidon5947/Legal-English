import type { NextConfig } from "next";

// Baseline hardening headers for every response. Fonts, photos and scripts are
// all served from this origin now, so a strict frame/referrer policy costs
// nothing. CSP is left to the reverse proxy (Caddy/Nginx) on the VPS where the
// final list of allowed origins (Supabase, Mercado Pago) is known.
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(self)" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // The floating "N" dev badge sat on top of the sidebar avatar during review.
  devIndicators: false,
  // Dev-only: origins allowed to load /_next dev resources (HMR, RSC). Without
  // 127.0.0.1 here the app never hydrates when opened by IP instead of localhost.
  allowedDevOrigins: ["*.trycloudflare.com", "82.38.44.28", "127.0.0.1", "localhost"],
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      // Fonts and photos never change without a new filename: cache them for a year.
      { source: "/fonts/:path*", headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }] },
      { source: "/home-assets/:path*", headers: [{ key: "Cache-Control", value: "public, max-age=2592000, stale-while-revalidate=86400" }] },
      // Icon packs and page-specific art (…-assets/) plus the generated review
      // screenshots are static too; without this every page re-downloaded 40+ icons.
      { source: "/:dir([a-z-]+-assets)/:path*", headers: [{ key: "Cache-Control", value: "public, max-age=2592000, stale-while-revalidate=86400" }] },
      { source: "/generated/:path*", headers: [{ key: "Cache-Control", value: "public, max-age=2592000, stale-while-revalidate=86400" }] },
      { source: "/brand/:path*", headers: [{ key: "Cache-Control", value: "public, max-age=2592000, stale-while-revalidate=86400" }] },
    ];
  },
};

export default nextConfig;
