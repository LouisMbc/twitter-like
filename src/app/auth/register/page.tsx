"use client";

import RegisterForm from '@/components/auth/RegisterForm';
import { FaArrowLeft } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Footer from "@/components/shared/Footer";

export default function RegisterPage() {
  const router = useRouter();

  return (    <div className="min-h-screen flex flex-col justify-between bg-background text-foreground relative overflow-hidden transition-all duration-300">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-muted/20 via-transparent to-muted/20"></div>
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/3 rounded-full blur-3xl"></div>
      
      <div className="relative z-10 flex flex-col min-h-screen">
        <div className="w-full py-16">
          <h1 className="text-4xl md:text-6xl font-bold text-center bg-gradient-to-r from-foreground via-muted-foreground to-muted-foreground bg-clip-text text-transparent">
            Créer un compte
          </h1>
          <p className="text-center text-muted-foreground mt-4 text-lg">
            Rejoignez Flow en quelques clics
          </p>
        </div>
          {/* Contenu principal centré */}
        <div className="flex-1 flex items-center justify-center px-8 -mt-16">
          <div className="w-full max-w-md">
            <div className="bg-card/80 backdrop-blur-sm rounded-2xl shadow-2xl px-8 py-10 w-full border border-border relative overflow-hidden transition-all duration-300">
              {/* Subtle glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-primary/3 rounded-2xl"></div>
              
              <div className="relative z-10">
                <div className="flex items-center mb-8 w-full">
                  <button
                    onClick={() => router.back()}
                    className="p-3 rounded-full hover:bg-muted mr-4 text-foreground transition-all duration-200 hover:scale-110 group"
                  >
                    <FaArrowLeft className="group-hover:-translate-x-1 transition-transform duration-200" />
                  </button>
                  <div className="text-2xl font-bold text-foreground">Créer un compte</div>
                </div>

                <RegisterForm />
                
                {/* Additional styling */}
                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    En créant un compte, vous acceptez nos{' '}
                    <a href="/terms" className="text-red-500 hover:text-red-400 underline">
                      conditions d'utilisation
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Séparateur au-dessus du footer */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent mt-auto" />
        
        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}