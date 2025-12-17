import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { InterceptorProvider } from "@/contexts/InterceptorContext";
import { NavigationProgressBar } from "@/components/ui/navigation-progress-bar";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ViaLumiar",
  description: "Sistema de Gestão - ViaLumiar",
  icons: {
    icon: [
      { url: '/favicon.ico' },
    ],
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
  },
  applicationName: 'ViaLumiar',
  keywords: ['vialumiar', 'gestão', 'sistema'],
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#1e40af',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br">
      <head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <InterceptorProvider>
            <NavigationProgressBar />
            {children}
            <Toaster />
          </InterceptorProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
