"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '../lib/supabase';
import Link from 'next/link';
import Image from 'next/image';
import { FaGoogle, FaApple } from 'react-icons/fa';


export default function Home() {
  const router = useRouter();
  const [status, setStatus] = useState<string>('Vérification de la connexion...');
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  useEffect(() => {
    async function checkAuth() {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (session) {
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false);
        }

        setStatus('Prêt');
      } catch (err) {
        setStatus('Erreur: ' + (err as Error).message);
      }
    }

    checkAuth();
  }, []);

  return (
    <div className="min-h-screen text-white" style={{ backgroundColor: '#282325' }}>
      <div className="flex flex-col md:flex-row h-screen">
        {/* Left side - Logo and tagline */}
        <div className="w-full md:w-1/2 flex items-center justify-center p-6">
          <div className="max-w-md">
            <h1 className="text-2xl md:text-2xl lg:text-4xl font-bold mb-10 text-center md:text-left whitespace-nowrap">
              L'essentiel de l'information est ici
            </h1>
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
          </div>
        </div>

        {/* Right side - Sign up options */}
        <div className="w-full md:w-1/2 style={{ backgroundColor: '#282325' } p-8 flex items-center justify-center ">
          <div className="w-full max-w-md space-y-6">
            <h2 className="text-2xl font-bold mb-8">
              Inscrivez vous
            </h2>

            <div className="space-y-4">
                <button className="w-full flex items-center justify-center bg-white text-black rounded-full py-3 px-4 font-medium hover:bg-gray-100 transition-colors">
                <FaGoogle className="mr-2 text-lg" />
                Inscrivez vous avec Google
                </button>

              <button className="w-full flex items-center justify-center bg-white text-black rounded-full py-3 px-4 font-medium hover:bg-gray-100 transition-colors">
              <FaApple className="mr-2 text-lg" />
              Inscrivez vous avec Apple
              </button>

                <div className="flex items-center my-4" style={{ width: "412px", height: "23.99px", position: "relative" }}>
                <div className="flex-grow h-px #FFFFFF border #FFFFFF"></div>
                <span className="px-4 text-lg text-white ">ou</span>
                <div className="flex-grow h-px #FFFFFF border #FFFFFF"></div>
                </div>

              <button
                onClick={() => router.push('/auth/register')}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-medium rounded-full py-3 transition-colors"
              >
                Créer un compte
              </button>

              <p className="text-gray-500 text-xs mt-2">
                En vous inscrivant, vous acceptez les <Link href="#" className="text-red-500">Conditions d'utilisation</Link> et la <Link href="#" className="text-red-500">Politique de confidentialité</Link>, notamment l'<Link href="#" className="text-red-500">Utilisation des cookies</Link>.
              </p>
            </div>

            <div className="mt-8">
              <p className="font-medium mb-3">Vous avez déjà un compte?</p>
              <button
                onClick={() => router.push('/auth/login')}
                className="w-full border border-gray-600 text-white font-medium rounded-full py-3 transition-colors hover:bg-white/10"
              >
                Se connecter
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}