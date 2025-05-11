"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import supabase from "../lib/supabase";
import Link from "next/link";
import Image from "next/image";
import Footer from "@/components/shared/Footer";

export default function Home() {
  const router = useRouter();
  const [status, setStatus] = useState<string>(
    "Vérification de la connexion..."
  );
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  useEffect(() => {
    async function checkAuth() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session) {
          setIsLoggedIn(true);
          // Rediriger les utilisateurs connectés vers leur fil d'actualité
          router.push('/dashboard');
        } else {
          setIsLoggedIn(false);
        }

        setStatus("Prêt");
      } catch (err) {
        setStatus("Erreur: " + (err as Error).message);
      }
    }

    checkAuth();
  }, [router]);

  return (
    <div
      className="min-h-screen text-white bg-black"
      style={{ backgroundColor: "#282325" }}
    >
      <div className="flex flex-col md:flex-row min-h-screen">
        {/* Left side - Logo and presentation */}
        <div className="w-full md:w-1/2 flex items-center justify-center p-6">
          <div className="max-w-md">
            <div className="flex justify-center md:justify-start mb-8">
              <Image
                src="/logo_Flow.png"
                alt="Flow Logo"
                width={400}
                height={300}
                priority
                className="object-contain hover:scale-105 transition-transform duration-300"
              />
            </div>
            <h1 className="text-2xl md:text-2xl lg:text-4xl font-bold mb-6 text-center md:text-left">
              L'essentiel de l'information est ici
            </h1>
            <p className="text-lg mb-8 text-gray-300">
              Rejoignez la communauté Flow pour découvrir et partager les actualités 
              qui comptent vraiment. Une nouvelle façon de rester connecté au monde.
            </p>
          </div>
        </div>

        {/* Right side - Call to action */}
        <div className="w-full md:w-1/2 p-8 flex items-center justify-center" style={{ backgroundColor: '#282325' }}>
          <div className="w-full max-w-md space-y-8">
            <div>
              <h2 className="text-3xl font-bold mb-3">Bienvenue sur Flow</h2>
              <p className="text-gray-300 mb-8">Votre plateforme de partage d'idées et d'actualités</p>
            </div>

            <div className="space-y-5">
              <button
                onClick={() => router.push("/auth")}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold rounded-full py-4 text-lg transition-colors"
              >
                Commencer maintenant
              </button>

              <button
                onClick={() => router.push("/auth/login")}
                className="w-full border border-gray-600 text-white font-medium rounded-full py-3.5 transition-colors hover:bg-white/10"
              >
                Déjà membre ? Se connecter
              </button>
            </div>
            
            <div className="mt-8 text-center">
              <p className="text-gray-400">
                Découvrez comment Flow transforme la façon dont nous partageons l'information
              </p>
              <Link href="/about" className="text-red-500 hover:underline mt-2 inline-block">
                En savoir plus →
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
