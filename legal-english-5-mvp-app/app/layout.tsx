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
import { BRAND_OWNER, HOME_TITLE, OG_IMAGE, SITE_DESCRIPTION, SITE_NAME, siteJsonLd, siteUrl } from "@/lib/site";
import { serverLocale } from "@/lib/locale-server";

export const metadata: Metadata = {
  metadataBase: siteUrl(),
  title: {
    default: HOME_TITLE,
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: ["legal English", "inglés jurídico", "abogados", "contracts", "corporate law", "employment law", "MPC LAW STUDIO"],
  authors: [{ name: BRAND_OWNER }],
  icons: {
    icon: "/brand/mpc-icon-512.png",
    apple: "/brand/mpc-icon-512.png",
  },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: HOME_TITLE,
    description: SITE_DESCRIPTION,
    locale: "en_US",
    alternateLocale: ["es_CO"],
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: HOME_TITLE,
    description: SITE_DESCRIPTION,
    images: [OG_IMAGE.url],
  },
  robots: { index: true, follow: true },
  manifest: "/manifest.webmanifest",
  alternates: { canonical: "/" },
};

export const viewport: Viewport = {
  themeColor: "#452b84",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
};

// 1. Track modality on <html data-input>. 2. In pointer mode, links/buttons do not
//    keep focus after a click (form fields are never touched), so no focus ring —
//    ours, the browser's default, or one drawn by an extension/OS highlighter —
//    can stay on the element that was just clicked. Keyboard mode is untouched.
// 3. Only the element that was actually pressed (`d`, the pointerdown target) is
//    released. Focus that a script moves somewhere else right after a click — a
//    dialog's close button, the drawer's first link — is deliberate and stays.
const INPUT_MODALITY_SCRIPT = `(function(){var h=document.documentElement,k=["Tab","ArrowUp","ArrowDown","ArrowLeft","ArrowRight","Home","End"],m=/^(A|BUTTON|SUMMARY)$/,d=null;function p(e){h.setAttribute("data-input","pointer");d=e.target}function b(t){return t&&t.nodeType===1&&(m.test(t.tagName)||t.getAttribute("role")==="button"||t.getAttribute("role")==="tab")&&!t.isContentEditable}function c(a){return a&&d&&d.nodeType===1&&a.contains(d)}function r(){if(h.getAttribute("data-input")!=="pointer")return;var a=document.activeElement;if(b(a)&&c(a))a.blur()}addEventListener("pointerdown",p,true);addEventListener("mousedown",p,true);addEventListener("touchstart",p,{capture:true,passive:true});addEventListener("keydown",function(e){if(k.indexOf(e.key)>-1)h.setAttribute("data-input","keyboard")},true);addEventListener("click",function(){setTimeout(r,0)},false);addEventListener("focusin",function(e){if(h.getAttribute("data-input")==="pointer"&&b(e.target)&&c(e.target))setTimeout(r,0)},true)})();`;

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const locale = await serverLocale();
  // Every page needs the session/terms payload before it can render real
  // content. Starting the request from the HTML head (instead of after
  // hydration) takes ~300 ms off the first meaningful paint of learner pages.
  preload("/api/bootstrap", { as: "fetch", crossOrigin: "use-credentials" });
  return (
    <html lang={locale} data-scroll-behavior="smooth" data-input="pointer" suppressHydrationWarning>
      <head>
        {/* Fonts are self-hosted (public/fonts) so no request leaves for Google; preload the three faces above the fold. */}
        <link rel="preload" href="/fonts/poppins-400-latin.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/poppins-600-latin.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/cormorant-garamond-600-latin.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <JsonLd data={siteJsonLd()} />
        {/* Focus-ring modality (see globals.css "Focus rings only for keyboard users").
            Inline and first in <head> so it is active before React hydrates: a click that
            lands while the JS bundle is still downloading must not leave a ring behind. */}
        <script dangerouslySetInnerHTML={{ __html: INPUT_MODALITY_SCRIPT }} />
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
