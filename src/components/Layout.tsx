import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Music, LogOut } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import ThemeToggle from './ThemeToggle';

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuthStore();
  
  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      <nav className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg shadow-[0_0_15px_rgba(6,182,212,0.3)] dark:shadow-[0_0_20px_rgba(168,85,247,0.3)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Link to="/songs" className="flex items-center group">
                <Music className="h-6 w-6 text-cyan-500 dark:text-purple-400 group-hover:text-cyan-600 dark:group-hover:text-purple-300 transition-colors" />
                <span className="ml-2 text-xl font-semibold bg-gradient-to-r from-cyan-500 to-purple-500 bg-clip-text text-transparent">
                  Music Docs
                </span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-lg text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white focus:outline-none transition bg-white/50 dark:bg-gray-700/50 hover:bg-white/80 dark:hover:bg-gray-700/80 backdrop-blur-sm shadow-[0_0_10px_rgba(6,182,212,0.2)] dark:shadow-[0_0_10px_rgba(168,85,247,0.2)]"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}