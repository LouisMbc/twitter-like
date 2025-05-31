"use client";

import React from 'react';
import LoginForm from '@/components/auth/LoginForm';
import { useRouter } from 'next/navigation';
import { FaArrowLeft } from 'react-icons/fa';
import { useEffect } from 'react';
import supabase from '@/lib/supabase';
import Footer from "@/components/shared/Footer";

export default function LoginPage() {
  const router = useRouter();
  
  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push('/dashboard');
      }
    };
    
    checkAuth();
  }, [router]);


  return (
    <div className="min-h-screen flex flex-col justify-between bg-black text-white relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900/20 via-black to-gray-900/20"></div>
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-500/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
      
      <div className="relative z-10">
        <div className="w-full py-16">
          <h1 className="text-4xl md:text-6xl font-bold text-center bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
            Connexion
          </h1>
          <p className="text-center text-gray-400 mt-4 text-lg">
            Retrouvez votre Flow
          </p>
        </div>
        
        {/* Contenu principal centré */}
        <div className="flex-1 flex items-center justify-center px-8">
          <div className="w-full max-w-md">
            <div className="bg-gray-900/80 backdrop-blur-sm rounded-2xl shadow-2xl px-8 py-10 w-full border border-gray-700/50 relative overflow-hidden">
              {/* Subtle glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-blue-500/5 rounded-2xl"></div>
              
              <div className="relative z-10">
                <div className="flex items-center mb-8 w-full">
                  <button
                    onClick={() => router.back()}
                    className="p-3 rounded-full hover:bg-gray-800 mr-4 text-white transition-all duration-200 hover:scale-110 group"
                  >
                    <FaArrowLeft className="group-hover:-translate-x-1 transition-transform duration-200" />
                  </button>
                  <div className="text-2xl font-bold text-white">Se connecter</div>
                </div>

                <LoginForm />
              </div>
            </div>
          </div>
        </div>
        
        {/* Séparateur au-dessus du footer */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent mt-16" />
        
        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}