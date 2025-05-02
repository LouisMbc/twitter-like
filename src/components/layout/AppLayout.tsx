"use client";

import { ReactNode } from 'react';
import Sidebar from './Sidebar';


interface AppLayoutProps {
  children: ReactNode;
  title?: string;
  hideAuth?: boolean;
}

export default function AppLayout({ children, title, hideAuth = false }: AppLayoutProps) {
  const content = (
    <div className="min-h-screen bg-black text-white">
      <div className="flex">
        <Sidebar />
        
        <div className="ml-64 flex-1">
          {title && (
            <div className="border-b border-gray-800 p-4">
              <h1 className="text-xl font-bold">{title}</h1>
            </div>
          )}
          
          <div className="w-full max-w-2xl mx-auto">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
  
  if (hideAuth) {
    return content;
  }
  
  return content;
}
