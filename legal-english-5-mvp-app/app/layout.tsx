import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppProvider } from "@/components/app-provider";
import { LocaleProvider } from "@/components/locale-provider";
import { RouteProgress } from "@/components/route-progress";
import { SkipLink } from "@/components/skip-link";
import { SITE_DESCRIPTION, SITE_NAME, siteUrl } from "@/lib/site";

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
    images: [{ url: "/home-assets/photos/cta-courthouse.jpg", width: 1600, height: 900, alt: "Legal English 5" }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — Legal English in five-minute sessions`,
    description: SITE_DESCRIPTION,
    images: ["/home-assets/photos/cta-courthouse.jpg"],
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

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="preconnect" href="https://videos.pexels.com" />
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      {/* suppressHydrationWarning: browser extensions (Grammarly etc.) inject data-* attributes
          on <body> before React hydrates; they are not part of our markup. */}
      <body suppressHydrationWarning>
        <LocaleProvider>
          <SkipLink />
          <RouteProgress />
          <AppProvider>{children}</AppProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
