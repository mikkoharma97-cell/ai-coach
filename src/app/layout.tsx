import type { Metadata } from "next";
import {
  APP_DESCRIPTION,
  APP_DISPLAY_NAME,
  APP_SHORT_NAME,
} from "@/config/appInfo";
import { ForceRefreshGuard } from "@/components/build/ForceRefreshGuard";
import { CacheBypassEffect } from "@/components/build/CacheBypassEffect";
import { GlobalBuildMarker } from "@/components/build/BuildMarkerLine";
import { HomeCheckButton } from "@/components/build/HomeCheckButton";
import { CoachReminderNotifications } from "@/components/CoachReminderNotifications";
import { FeedbackWidget } from "@/components/feedback/FeedbackWidget";
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
  title: `${APP_DISPLAY_NAME} — Daily guidance`,
  description: APP_DESCRIPTION,
  applicationName: APP_DISPLAY_NAME,
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: APP_SHORT_NAME,
  },
  openGraph: {
    type: "website",
    siteName: APP_DISPLAY_NAME,
    title: `${APP_DISPLAY_NAME} — Daily guidance`,
    description: APP_DESCRIPTION,
  },
  twitter: {
    card: "summary",
    title: `${APP_DISPLAY_NAME} — Daily guidance`,
    description: APP_DESCRIPTION,
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
        <GlobalBuildMarker />
        <HomeCheckButton />
        <ForceRefreshGuard />
        {children}
        <FeedbackWidget />
        <PwaInstallPrompt />
        <CoachReminderNotifications />
        <CacheBypassEffect />
      </body>
    </html>
  );
}
