"use client";

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from '@/components/shared/Header';
import { ThemeProvider } from '@/context/ThemeContext';
import { LanguageProvider } from '@/context/LanguageContext';
import { useEffect } from "react";

// Déplacez ces définitions de polices en dehors du composant
// pour qu'elles soient chargées une seule fois
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Note: Metadata ne fonctionne pas avec "use client", nous devrons donc les gérer différemment
// Créez un nouveau fichier metadata.ts pour cela si nécessaire

function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Supprimer les attributs superflus de l'élément HTML qui pourraient être ajoutés par des extensions
  useEffect(() => {
    // Cette fonction s'exécute uniquement côté client
    const htmlElement = document.documentElement;
    // Conserver uniquement les attributs essentiels
    const essentialAttributes = ["lang", "class", "data-theme", "style"];
    
    Array.from(htmlElement.attributes).forEach(attr => {
      if (!essentialAttributes.includes(attr.name)) {
        htmlElement.removeAttribute(attr.name);
      }
    });
  }, []);

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider>
          <LanguageProvider>
            <Header />
            {children}
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

export default RootLayout;
