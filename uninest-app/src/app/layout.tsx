import type { Metadata, Viewport } from "next";
import "./globals.css";
import { PwaManager } from "@/components/pwa/PwaManager";

export const viewport: Viewport = {
  themeColor: "#2563eb",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "UniNest — Student Housing, Escrow & Campus OS",
  description:
    "Verified Student PG Marketplace, Two-Stage Cryptographic OTP Escrow Handshake, Direct UPI UTR Ledger, and 5-Portal Campus Housing Operating System.",
  keywords:
    "student accommodation, PG, paying guest, hostel, student housing, rent escrow, landlord OS, PCTE Ludhiana",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "UniNest",
  },
  formatDetection: {
    telephone: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="antialiased" suppressHydrationWarning>
        <PwaManager />
        {children}
      </body>
    </html>
  );
}
