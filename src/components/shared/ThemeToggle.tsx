// src/components/shared/ThemeToggle.tsx
import { useTheme } from '@/context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      aria-label="Toggle theme"
    >
      {theme === 'light' ? (
        <Moon className="h-5 w-5 text-gray-800 dark:text-white" />
      ) : (
        <Sun className="h-5 w-5 text-gray-800 dark:text-white" />
      )}
    </button>
  );
}