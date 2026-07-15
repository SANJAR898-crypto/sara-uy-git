import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
import Script from "next/script";
import type { ReactNode } from "react";
import "./globals.css";
import { TelegramProvider } from "@/contexts/TelegramProvider";
import { QueryProvider } from "@/contexts/QueryProvider";
import { AppShell } from "@/components/layout/AppShell";

const manrope = Manrope({
  subsets: ["latin", "cyrillic"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sara Uylar — Ko'chmas mulk platformasi",
  description:
    "O'zbekistondagi eng yaxshi ko'chmas mulk Telegram Mini App platformasi. Kvartira, uy, villa va tijorat mulklarini toping yoki e'lon joylashtiring.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0082D5",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="uz">
      <head>
        <Script src="https://telegram.org/js/telegram-web-app.js" strategy="beforeInteractive" />
      </head>
      <body className={`${manrope.variable} min-h-screen bg-ink-50 text-ink-900 antialiased`}>
        <QueryProvider>
          <TelegramProvider>
            <AppShell>{children}</AppShell>
          </TelegramProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
