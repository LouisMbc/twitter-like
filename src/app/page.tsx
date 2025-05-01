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
    <div className="min-h-screen flex flex-col text-white" style={{ backgroundColor: '#171717' }}>
      {/* Main content container with max width */}
      <div className="flex-grow flex flex-col w-full max-w-4xl mx-auto px-4 py-8">
        {/* Main heading - centered at top */}
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-2xl md:text-3xl font-bold">
            L'essentiel de l'information est ici
          </h1>
        </div>
        
        <div className="flex flex-col md:flex-row flex-grow items-center">
          {/* Left side - Logo */}
          <div className="w-full md:w-1/2 flex justify-center mb-8 md:mb-0">
            <div className="w-48 h-48 sm:w-64 sm:h-64 relative">
              <Image 
                src="/logo_Flow.png" 
                alt="Flow Logo" 
                fill
                style={{objectFit: "contain"}}
                priority
              />
            </div>
          </div>

          {/* Right side - Sign up options */}
          <div className="w-full md:w-1/2 px-6 md:px-8 max-w-md mx-auto md:mx-0">
            <h2 className="text-xl font-bold mb-6">
              Inscrivez vous
            </h2>
            
            <div className="space-y-4">
              <button className="w-full flex items-center justify-center bg-white text-black rounded-full py-3 px-4 font-medium hover:bg-gray-100 transition-colors">
                <FaGoogle className="mr-2" />
                Inscrivez vous avec Google
              </button>
              
              <button className="w-full flex items-center justify-center bg-white text-black rounded-full py-3 px-4 font-medium hover:bg-gray-100 transition-colors">
                <FaApple className="mr-2" />
                Inscrivez vous avec Apple
              </button>

              <div className="flex items-center my-4">
                <div className="flex-grow h-px bg-gray-700"></div>
                <span className="px-4 text-gray-400 text-sm">ou</span>
                <div className="flex-grow h-px bg-gray-700"></div>
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
              <p className="text-base mb-3">Vous avez déjà un compte?</p>
              <button 
                onClick={() => router.push('/auth/login')}
                className="w-full border border-gray-600 text-white font-medium rounded-full py-2.5 transition-colors hover:bg-white/10"
              >
                Se connecter
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="text-xs text-gray-600 text-center py-4">
        Flow© Tous droits réservés
      </div>
    </div>
  );
}