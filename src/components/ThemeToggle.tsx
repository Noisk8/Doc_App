import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useThemeStore } from '../stores/themeStore';

export default function ThemeToggle() {
  const { isDark, toggleTheme } = useThemeStore();

  return (
    <button
      onClick={toggleTheme}
      className="relative inline-flex h-10 w-20 items-center justify-center rounded-xl bg-gradient-to-r from-cyan-500/20 to-purple-500/20 p-1 backdrop-blur-sm transition-all hover:from-cyan-500/30 hover:to-purple-500/30 dark:from-cyan-500/40 dark:to-purple-500/40 dark:hover:from-cyan-500/50 dark:hover:to-purple-500/50"
      style={{
        boxShadow: '0 0 20px rgba(6, 182, 212, 0.3), inset 0 0 10px rgba(168, 85, 247, 0.2)'
      }}
    >
      <span className="sr-only">Toggle theme</span>
      <div
        className={`absolute h-8 w-8 rounded-lg transition-transform duration-300 ${
          isDark ? 'translate-x-[2rem]' : '-translate-x-[2rem]'
        } bg-gradient-to-br from-cyan-400 to-purple-500 shadow-lg`}
        style={{
          boxShadow: '0 0 15px rgba(6, 182, 212, 0.5)'
        }}
      />
      <Sun className={`h-6 w-6 transition-all ${isDark ? 'opacity-0' : 'opacity-100'} text-yellow-300`} />
      <Moon className={`h-6 w-6 transition-all ${isDark ? 'opacity-100' : 'opacity-0'} text-purple-200`} />
    </button>
  );
}