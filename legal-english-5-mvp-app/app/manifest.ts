import type { MetadataRoute } from "next";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_NAME,
    short_name: "LE5",
    description: SITE_DESCRIPTION,
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#f7f7fa",
    theme_color: "#452b84",
    lang: "en",
    icons: [
      { src: "/brand/mpc-icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/brand/mpc-icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/brand/mpc-icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
