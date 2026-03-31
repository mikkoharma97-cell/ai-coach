import type { Metadata } from "next";
import { VersionBadge } from "@/components/common/VersionBadge";
import { PwaInstallPrompt } from "@/components/PwaInstallPrompt";
import { getPublicSiteUrl } from "@/lib/siteUrl";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

/* Parannus: html lang = fi/en LocaleContextin mukaan (nyt kiinteä "en") — parempi SEO ja ruudunlukija. */

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(getPublicSiteUrl()),
  title: "Coach — Daily guidance",
  description:
    "Today tells you what to do: workout, food, activity — in order. No feed, no guesswork.",
  applicationName: "Coach",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Coach",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport = {
  width: "device-width" as const,
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover" as const,
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#06070b" },
    { color: "#06070b" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en" /* vaihda dynaamiseksi kun locale tulee layoutista */
      className={`${geistSans.variable} ${geistMono.variable} h-full min-h-dvh antialiased`}
    >
      <body className="app-page-canvas min-h-dvh overflow-x-hidden text-foreground">
        <div className="app-grain" aria-hidden />
        {children}
        <PwaInstallPrompt />
        <VersionBadge />
      </body>
    </html>
  );
}
