"use client";

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from '@/context/ThemeContext';
import { LanguageProvider } from '@/context/LanguageContext';
import { useRef } from "react";

// Define fonts outside the component
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Metadata is handled in metadata.ts since we're using "use client"

function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const htmlRef = useRef<HTMLHtmlElement>(null);

  return (
    // Add suppressHydrationWarning to prevent hydration mismatches from browser extensions
    <html lang="en" ref={htmlRef} suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider>
          <LanguageProvider>
            {children}
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

export default RootLayout;
