import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "@/components/app-provider";
import { LocaleProvider } from "@/components/locale-provider";

export const metadata: Metadata = {
  title: "Legal English 5 · Alpha",
  description: "Production-path alpha for MPC LAW STUDIO: MCD content, server entitlement and Mercado Pago access.",
  icons: {
    icon: "/brand/icon.svg",
    apple: "/brand/icon.svg",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="preconnect" href="https://videos.pexels.com" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap" rel="stylesheet" />
      </head>
      <body>
        <LocaleProvider>
          <AppProvider>{children}</AppProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
