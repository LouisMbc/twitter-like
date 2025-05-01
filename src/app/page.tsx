"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '../lib/supabase';
import Link from 'next/link';
import Image from 'next/image';

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
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Hero Section */}
      <main className="flex-grow flex flex-col items-center justify-center p-4">
        <div className="max-w-4xl w-full">
          <div className="text-center mb-12">
            <div className="mb-6 flex justify-center">
              <Image 
                src="/logo_Flow.png" 
                alt="Flow Logo" 
                width={250} 
                height={80} 
                priority
                className="object-contain"
              />
            </div>
            <p className="text-xl md:text-2xl text-gray-300 mb-8">
              Connectez-vous avec le monde, partagez vos idées
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              {isLoggedIn ? (
                <button 
                  onClick={() => router.push('/dashboard')}
                  className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-full transition-colors"
                >
                  Accéder à mon flow
                </button>
              ) : (
                <>
                  <button 
                    onClick={() => router.push('/auth')}
                    className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-full transition-colors"
                  >
                    Commencer
                  </button>
                  <button 
                    onClick={() => router.push('/auth/login')}
                    className="bg-transparent hover:bg-gray-800 text-white font-bold py-3 px-6 rounded-full border border-white transition-colors"
                  >
                    Se connecter
                  </button>
                </>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className="bg-gray-900 p-6 rounded-lg">
              <div className="text-red-500 text-3xl mb-4">💬</div>
              <h3 className="text-xl font-bold mb-2">Partagez vos idées</h3>
              <p className="text-gray-400">Exprimez-vous et partagez vos pensées avec le monde entier en quelques clics.</p>
            </div>
            
            <div className="bg-gray-900 p-6 rounded-lg">
              <div className="text-red-500 text-3xl mb-4">🔍</div>
              <h3 className="text-xl font-bold mb-2">Découvrez</h3>
              <p className="text-gray-400">Explorez des sujets tendances et découvrez du contenu qui vous passionne.</p>
            </div>
            
            <div className="bg-gray-900 p-6 rounded-lg">
              <div className="text-red-500 text-3xl mb-4">🌐</div>
              <h3 className="text-xl font-bold mb-2">Connectez-vous</h3>
              <p className="text-gray-400">Créez des liens avec des personnes partageant vos intérêts du monde entier.</p>
            </div>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="p-4 text-center text-gray-600 text-sm border-t border-gray-800">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0 flex items-center">
            <Image 
              src="/logo_Flow.png" 
              alt="Flow Logo" 
              width={60} 
              height={20} 
              className="mr-2"
              priority
            />
            © {new Date().getFullYear()}
          </div>
          <div className="flex space-x-6">
            <Link href="#" className="text-gray-400 hover:text-white">À propos</Link>
            <Link href="#" className="text-gray-400 hover:text-white">Confidentialité</Link>
            <Link href="#" className="text-gray-400 hover:text-white">Conditions</Link>
            <Link href="#" className="text-gray-400 hover:text-white">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}