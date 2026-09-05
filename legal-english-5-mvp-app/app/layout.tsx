import type { Metadata, Viewport } from "next";
import { cookies, headers } from "next/headers";
import "./fonts.css";
import "./globals.css";
import { AppProvider } from "@/components/app-provider";
import { LocaleProvider } from "@/components/locale-provider";
import { RouteProgress } from "@/components/route-progress";
import { SkipLink } from "@/components/skip-link";
import { ToastProvider } from "@/components/toaster";
import { SITE_DESCRIPTION, SITE_NAME, siteUrl } from "@/lib/site";
import type { Locale } from "@/lib/i18n";

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

/**
 * Resolve the UI language on the server so Spanish users never see an English
 * flash: the cookie the toggle writes wins; a first-time visitor gets the
 * language of the browser (the audience is Spanish-speaking lawyers).
 */
async function initialLocale(): Promise<Locale> {
  const saved = (await cookies()).get("le5_locale")?.value;
  if (saved === "en" || saved === "es") return saved;
  const accept = ((await headers()).get("accept-language") ?? "").toLowerCase();
  const first = accept.split(",")[0]?.trim() ?? "";
  return first.startsWith("es") ? "es" : "en";
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const locale = await initialLocale();
  return (
    <html lang={locale} data-scroll-behavior="smooth">
      <head>
        {/* Fonts are self-hosted (public/fonts) so no request leaves for Google; preload the three faces above the fold. */}
        <link rel="preload" href="/fonts/poppins-400-latin.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/poppins-600-latin.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/cormorant-garamond-600-latin.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
      </head>
      {/* suppressHydrationWarning: browser extensions (Grammarly etc.) inject data-* attributes
          on <body> before React hydrates; they are not part of our markup. */}
      <body suppressHydrationWarning>
        <LocaleProvider initialLocale={locale}>
          <SkipLink />
          <RouteProgress />
          <ToastProvider>
            <AppProvider>{children}</AppProvider>
          </ToastProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
