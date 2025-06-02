"use client";

import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

export function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark';
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  if (!mounted) return null;

  return (
    <button
      onClick={toggleTheme}
      className="p-2 bg-gray-800/50 dark:bg-gray-200/50 backdrop-blur-sm rounded-full shadow-lg border border-gray-300 dark:border-gray-700 hover:scale-110 transition-all duration-200 group"
      aria-label="Changer le thème"
    >
      <div className="relative w-5 h-5">
        <Sun className={`absolute inset-0 w-5 h-5 text-yellow-500 transition-all duration-300 ${
          theme === 'dark' ? 'opacity-0 rotate-90 scale-0' : 'opacity-100 rotate-0 scale-100'
        }`} />
        <Moon className={`absolute inset-0 w-5 h-5 text-blue-400 transition-all duration-300 ${
          theme === 'light' ? 'opacity-0 -rotate-90 scale-0' : 'opacity-100 rotate-0 scale-100'
        }`} />
      </div>
    </button>
  );
}
