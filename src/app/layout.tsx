"use client";

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from '@/context/ThemeContext';
import { LanguageProvider } from '@/context/LanguageContext';
import { useEffect, useRef } from "react";

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
  
  // More aggressive approach to remove problematic attributes
  useEffect(() => {
    // Run once on mount
    const htmlElement = document.documentElement;
    const essentialAttributes = ["lang", "class", "data-theme", "style"];
    
    // Function to clean attributes
    const cleanAttributes = () => {
      Array.from(htmlElement.attributes).forEach(attr => {
        if (!essentialAttributes.includes(attr.name)) {
          htmlElement.removeAttribute(attr.name);        }
      });
    };
    
    // Initial cleanup
    cleanAttributes();
    
    // Setup observer to catch any new attributes
    const observer = new MutationObserver(() => {
      cleanAttributes();
    });
    
    // Start observing
    observer.observe(htmlElement, { attributes: true });
    
    // Clean up observer on unmount
    return () => observer.disconnect();
  }, []);

  return (
    <html lang="en" ref={htmlRef}>
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
