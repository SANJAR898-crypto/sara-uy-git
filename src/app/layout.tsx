import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import Script from "next/script";
import { FavoritesProvider, SessionProvider, ToastProvider } from "@/components/providers";
import { ToastContainer } from "@/components/ui";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sara Uylar — Premium Ko'chmas Mulk",
  description: "Sara Uylar — Ko'chmas mulk bo'yicha premium platforma",
  icons: { icon: "/images/logo.png" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#0B84D6",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="uz">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <Script src="https://telegram.org/js/telegram-web-app.js" strategy="beforeInteractive" />
      </head>
      <body className="antialiased">
        <SessionProvider>
          <ToastProvider>
            <FavoritesProvider>
              <div className="min-h-screen w-full bg-gradient-to-br from-[#08233a] via-[#0d3a5c] to-[#0b84d6]">
                <div className="relative mx-auto min-h-screen w-full max-w-lg bg-bg shadow-[0_0_80px_rgba(0,0,0,0.25)]">
                  {children}
                </div>
              </div>
              <ToastContainer />
            </FavoritesProvider>
          </ToastProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
