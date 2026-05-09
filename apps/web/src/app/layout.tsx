/* Work Product of Gerald Kombo. Trading as Gerald Kombo (Digital Services). Intellectual Property Rights Reserved. */
import type { Metadata, Viewport } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ServiceWorkerRegistrar } from "./ServiceWorkerRegistrar";
import { AmbientGeoShield } from "@/components/AmbientGeoShield";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

export const viewport: Viewport = {
  themeColor: "#000000",
};

export const metadata: Metadata = {
  title: "Taluq: Autonomous Financial Settlement for Nairobi, Mombasa, Kisumu, and all Kenyan Cities. Powered by Solana Token-2022 and ElevenLabs Voice AI.",
  description: "Autonomous, transparent financial settlement engine for Kenya. Managing SHIF, EPRA, and KPLC liquidity shocks via Solana Token-2022.",
  applicationName: "Taluq",
  keywords: [
    "Taluq",
    "chat wallet",
    "Kenya",
    "payments",
    "remittances",
    "Solana",
    "zero fee",
    "PWA",
  ],
  openGraph: {
    title: "Taluq Chat Wallet",
    description: "Zero fee transfers, remittances, and omni settlement on Solana.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Taluq Chat Wallet",
    description: "Zero fee transfers, remittances, and omni settlement on Solana.",
  },
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Taluq"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${jetbrainsMono.variable} font-mono antialiased`}>
        <ServiceWorkerRegistrar />
        {children}
        <AmbientGeoShield />
      </body>
    </html>
  );
}
