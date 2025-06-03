"use client";

import { useTheme } from '@/context/ThemeContext';
import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return <ThemeToggleContent />;
}

function ThemeToggleContent() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="flex items-center">
      <label 
        className="relative flex items-center w-[60px] h-fit bg-[#0c0f14] rounded-[30px] p-1 cursor-pointer overflow-hidden transition-all duration-500 select-none has-[:checked]:bg-[#cecece] shadow-lg hover:shadow-xl transform hover:scale-105" 
        htmlFor="theme-switch"
        title={theme === 'light' ? 'Passer en mode sombre' : 'Passer en mode clair'}
      >
        <input 
          id="theme-switch" 
          type="checkbox" 
          checked={theme === 'light'}
          onChange={toggleTheme}
          className="appearance-none relative w-[25px] h-[25px] rounded-full bg-[#21262e] border border-[#21262e] transition-all duration-500 shadow-[1px_1px_20px_3px_#21262e] hover:ml-[3px] checked:left-[calc(100%-24px)] checked:bg-white checked:border-white checked:shadow-[1px_1px_30px_12px_white] checked:hover:ml-[-3px]" 
        />
        
        {/* Moon SVG */}
        <svg 
          viewBox="0 0 384 512" 
          xmlns="http://www.w3.org/2000/svg" 
          className={`absolute left-[5px] w-[18px] fill-[#52555a] transition-all duration-300 ${theme === 'light' ? 'opacity-0' : 'opacity-100'}`}
        >
          <path d="M223.5 32C100 32 0 132.3 0 256S100 480 223.5 480c60.6 0 115.5-24.2 155.8-63.4c5-4.9 6.3-12.5 3.1-18.7s-10.1-9.7-17-8.5c-9.8 1.7-19.8 2.6-30.1 2.6c-96.9 0-175.5-78.8-175.5-176c0-65.8 36-123.1 89.3-153.3c6.1-3.5 9.2-10.5 7.7-17.3s-7.3-11.9-14.3-12.5c-6.3-.5-12.6-.8-19-.8z" />
        </svg>
        
        {/* Sun */}
        <div className={`absolute left-[calc(100%-21.5px)] top-[15px] -translate-y-1/2 w-3 h-3 rounded-full flex items-center justify-center scale-75 transition-all duration-300 ${theme === 'light' ? 'opacity-100' : 'opacity-0'}`}>
          <span className="relative block w-[3px] h-[3px] rounded-full bg-white z-[1] shadow-[11px_0px_0px_#0c0f14,10.3px_0px_0px_#0c0f14,-11px_0px_0px_#0c0f14,-10.3px_0px_0px_#0c0f14,0px_-11px_0px_#0c0f14,0px_-10.3px_0px_#0c0f14,0px_11px_0px_#0c0f14,0px_10.3px_0px_#0c0f14,8px_8px_0px_#0c0f14,7.3px_7.3px_0px_#0c0f14,8px_-8px_0px_#0c0f14,7.3px_-7.3px_0px_#0c0f14,-8px_-8px_0px_#0c0f14,-7.3px_-7.3px_0px_#0c0f14,-8px_8px_0px_#0c0f14,-7.3px_7.3px_0px_#0c0f14] before:content-[''] before:absolute before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:w-[10px] before:h-[10px] before:rounded-full before:bg-white before:border-2 before:border-[#0c0f14]" />
        </div>
      </label>
    </div>
  );
}
