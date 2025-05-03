"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaGoogle, FaApple } from 'react-icons/fa';

export default function AuthPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen text-white flex" style={{ backgroundColor: '#282325' }}>
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
            width={300}
            height={100}
            priority
            className="object-contain"
          />
        </div>
      </div>

      {/* Right side - Login/Sign up */}
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
              Découvrez ce qui se passe dans le monde
            </h1>

            <h2 className="text-xl md:text-2xl font-bold mb-8">
              Rejoignez Flow aujourd'hui.
            </h2>
          </div>

          <div className="space-y-4 max-w-sm">
            <button className="w-full flex items-center justify-center bg-white text-black rounded-full py-3 px-4 font-medium hover:bg-gray-100 transition-colors">
              <FaGoogle className="mr-2" />
              S'inscrire avec Google
            </button>

            <button className="w-full flex items-center justify-center bg-white text-black rounded-full py-3 px-4 font-medium hover:bg-gray-100 transition-colors">
              <FaApple className="mr-2" />
              S'inscrire avec Apple
            </button>

            <div className="flex items-center my-4">
              <div className="flex-grow h-px bg-gray-800"></div>
              <span className="px-4 text-gray-500">ou</span>
              <div className="flex-grow h-px bg-gray-800"></div>
            </div>

            <button
              onClick={() => router.push('/auth/register')}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-bold rounded-full py-3 transition-colors"
            >
              S'inscrire avec un email
            </button>

            <p className="text-gray-500 text-xs mt-2">
              En vous inscrivant, vous acceptez les <Link href="#" className="text-red-500">Conditions d'utilisation</Link> et
              la <Link href="#" className="text-red-500">Politique de confidentialité</Link>, y compris l'<Link href="#" className="text-red-500">Utilisation des cookies</Link>.
            </p>
          </div>
        </div>

        <div className="mt-12">
          <p className="font-bold mb-5">Vous avez déjà un compte?</p>
          <button
            onClick={() => router.push('/auth/login')}
            className="w-full md:w-auto border border-gray-600 hover:border-red-500 hover:bg-red-500/10 text-red-500 font-medium rounded-full py-2.5 px-6 transition-colors"
          >
            Se connecter
          </button>
        </div>
      </div>
    </div>
  );
}
