"use client";

import LoginForm from '@/components/auth/LoginForm';
import { FaArrowLeft } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function LoginPage() {
  const router = useRouter();
  
  return (
    <div className="min-h-screen bg-black text-white flex">
      {/* Left side - Hero Image */}
      <div className="hidden lg:block lg:w-1/2 relative bg-red-600">
        <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-red-800">
          <div className="absolute inset-0 opacity-20 mix-blend-overlay" 
               style={{backgroundImage: 'url("/patterns/flow-pattern.png")', backgroundSize: 'cover'}}></div>
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
              className="p-2 rounded-full hover:bg-gray-800 mr-4"
            >
              <FaArrowLeft />
            </button>
            <div className="lg:hidden flex items-center">
              <Image 
                src="/logo_Flow.png" 
                alt="Flow Logo" 
                width={80} 
                height={30} 
                priority
              />
            </div>
          </div>
          
          <LoginForm />
        </div>
      </div>
    </div>
  );
}