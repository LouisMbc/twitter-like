"use client";

import LoginForm from '@/components/auth/LoginForm';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { FaArrowLeft } from 'react-icons/fa';
import { useEffect } from 'react';
import supabase from '@/lib/supabase';

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
    <div className="min-h-screen bg-black text-white flex">
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

      {/* Right side - Login Form */}
      <div className="w-full lg:w-1/2 p-6 md:p-12 flex flex-col">
        <div className="max-w-md mx-auto w-full">
          <div className="flex items-center mb-8">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-full hover:bg-gray-800 mr-4 text-white"
            >
              <FaArrowLeft />
            </button>
            <h1 className="text-xl font-bold text-white">
              Se connecter
            </h1>
          </div>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}