"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaGoogle, FaApple, FaEnvelope, FaSignInAlt } from 'react-icons/fa';

export default function AuthPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-black text-white flex" style={{ backgroundColor: '#282325' }}>
      {/* Left side - Hero Image */}
      <div className="hidden lg:block lg:w-1/2 relative bg-red-600">
        <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-red-800">
          <div className="absolute inset-0 opacity-20 mix-blend-overlay"
            style={{ backgroundImage: 'url("/patterns/flow-pattern.png")', backgroundSize: 'cover' }}></div>
        </div>
        <div className="flex items-center justify-center h-full relative z-10">
          <Image
            src="/logo_Flow.png"
            alt="Flow Logo"
            width={1000}
            height={500}
            priority
            className="object-contain"
          />
        </div>
      </div>

      {/* Right side - Authentication Options */}
      <div className="w-full lg:w-1/2 p-6 md:p-12 flex flex-col justify-between">
        <div>
          <div className="mb-12">
            <div className="lg:hidden flex justify-center mb-8">
              <Image
                src="/logo_Flow.png"
                alt="Flow Logo"
                width={150}
                height={50}
                priority
                className="object-contain"
              />
            </div>

            <h1 className="text-3xl md:text-4xl xl:text-5xl font-extrabold mb-8">
              Connectez-vous à votre compte Flow
            </h1>

            <h2 className="text-xl md:text-2xl font-bold mb-10">
              Choisissez votre méthode d'authentification
            </h2>
          </div>

          <div className="space-y-6 max-w-sm">
            <div className="bg-gray-800/40 p-6 rounded-xl border border-gray-700 mb-8">
              <h3 className="text-xl font-semibold mb-4">Nouveau sur Flow?</h3>
              <div className="space-y-4">
                <button 
                  onClick={() => router.push('/auth/register')}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold rounded-full py-3.5 transition-colors flex items-center justify-center"
                >
                  <FaEnvelope className="mr-2" />
                  Créer un compte
                </button>
                
                <button className="w-full flex items-center justify-center bg-white text-black rounded-full py-3 px-4 font-medium hover:bg-gray-100 transition-colors">
                  <FaGoogle className="mr-2" color="black" />
                  S'inscrire avec Google
                </button>

                <button className="w-full flex items-center justify-center bg-white text-black rounded-full py-3 px-4 font-medium hover:bg-gray-100 transition-colors">
                  <FaApple className="mr-2" />
                  S'inscrire avec Apple
                </button>
                
                <p className="text-gray-400 text-xs mt-2">
                  En vous inscrivant, vous acceptez les <Link href="#" className="text-red-500">Conditions d'utilisation</Link> et
                  la <Link href="#" className="text-red-500">Politique de confidentialité</Link>.
                </p>
              </div>
            </div>
            
            <div className="bg-gray-800/40 p-6 rounded-xl border border-gray-700">
              <h3 className="text-xl font-semibold mb-4">Déjà membre?</h3>
              <button
                onClick={() => router.push('/auth/login')}
                className="w-full flex items-center justify-center border border-red-500 text-red-500 hover:bg-red-500 hover:text-white font-medium rounded-full py-3.5 px-6 transition-colors"
              >
                <FaSignInAlt className="mr-2" />
                Se connecter
              </button>
            </div>
          </div>
        </div>

        <div className="mt-12">
          <Link href="/" className="text-gray-400 hover:text-white transition-colors">
            ← Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
}
