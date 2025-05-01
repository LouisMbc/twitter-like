"use client";

import LoginForm from '@/components/auth/LoginForm';
import Link from 'next/link';
import { FaArrowLeft } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function LoginPage() {
  const router = useRouter();
  
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-md mx-auto pt-8 px-4">
        <div className="flex items-center mb-6">
          <button 
            onClick={() => router.back()} 
            className="p-2 rounded-full hover:bg-gray-800 mr-4"
          >
            <FaArrowLeft />
          </button>
          <div className="text-xl font-bold">Se connecter</div>
        </div>
        
        <div className="flex justify-center mb-8">
          <Image 
            src="/logo_Flow.png" 
            alt="Flow Logo" 
            width={120} 
            height={40} 
            priority
          />
        </div>
        
        <LoginForm />
        
      </div>
    </div>
  );
}