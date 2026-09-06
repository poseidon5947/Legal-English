import type { Metadata, Viewport } from "next";
import { preload } from "react-dom";
import "./fonts.css";
import "./globals.css";
import { AppProvider } from "@/components/app-provider";
import { InsightBeacon } from "@/components/insight-beacon";
import { LocaleProvider } from "@/components/locale-provider";
import { RouteProgress } from "@/components/route-progress";
import { SkipLink } from "@/components/skip-link";
import { ToastProvider } from "@/components/toaster";
import { JsonLd } from "@/components/json-ld";
import { SITE_DESCRIPTION, SITE_NAME, siteJsonLd, siteUrl } from "@/lib/site";
import { serverLocale } from "@/lib/locale-server";

export const metadata: Metadata = {
  metadataBase: siteUrl(),
  title: {
    default: `${SITE_NAME} — Legal English in five-minute sessions`,
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: ["legal English", "inglés jurídico", "abogados", "contracts", "corporate law", "employment law", "MPC Law Studio"],
  authors: [{ name: "MPC Law Studio" }],
  icons: {
    icon: "/home-assets/icons/le5-shield.png",
    apple: "/home-assets/icons/le5-shield.png",
  },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: `${SITE_NAME} — Legal English in five-minute sessions`,
    description: SITE_DESCRIPTION,
    locale: "en_US",
    alternateLocale: ["es_CO"],
    images: [{ url: "/home-assets/og/og-default.jpg", width: 1200, height: 630, alt: "Legal English 5 — Master Legal English in 5-minute sessions" }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — Legal English in five-minute sessions`,
    description: SITE_DESCRIPTION,
    images: ["/home-assets/og/og-default.jpg"],
  },
  robots: { index: true, follow: true },
  manifest: "/manifest.webmanifest",
  alternates: { canonical: "/" },
};

export const viewport: Viewport = {
  themeColor: "#071b49",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const locale = await serverLocale();
  // Every page needs the session/terms payload before it can render real
  // content. Starting the request from the HTML head (instead of after
  // hydration) takes ~300 ms off the first meaningful paint of learner pages.
  preload("/api/bootstrap", { as: "fetch", crossOrigin: "use-credentials" });
  return (
    <html lang={locale} data-scroll-behavior="smooth">
      <head>
        {/* Fonts are self-hosted (public/fonts) so no request leaves for Google; preload the three faces above the fold. */}
        <link rel="preload" href="/fonts/poppins-400-latin.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/poppins-600-latin.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/cormorant-garamond-600-latin.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <JsonLd data={siteJsonLd()} />
      </head>
      {/* suppressHydrationWarning: browser extensions (Grammarly etc.) inject data-* attributes
          on <body> before React hydrates; they are not part of our markup. */}
      <body suppressHydrationWarning>
        <LocaleProvider initialLocale={locale}>
          <SkipLink />
          <RouteProgress />
          <InsightBeacon />
          <ToastProvider>
            <AppProvider>{children}</AppProvider>
          </ToastProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
