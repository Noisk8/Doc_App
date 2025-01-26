import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Music, LogOut } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuthStore();
  
  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Link to="/songs" className="flex items-center">
                <Music className="h-6 w-6 text-indigo-600" />
                <span className="ml-2 text-xl font-semibold text-gray-900">
                  Music Docs
                </span>
              </Link>
            </div>
            <div className="flex items-center">
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-500 hover:text-gray-700 focus:outline-none transition"
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