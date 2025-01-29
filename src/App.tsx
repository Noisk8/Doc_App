import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Music, Settings } from 'lucide-react';
import Layout from './components/Layout';
import Login from './components/auth/Login';
import Songs from './components/songs/Songs';
import SongEditor from './components/songs/SongEditor';
import { useAuthStore } from './stores/authStore';
import { useThemeStore } from './stores/themeStore';

export default function App() {
  const { session } = useAuthStore();
  const { isDark } = useThemeStore();

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  if (!session) {
    return <Login />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/songs" replace />} />
          <Route path="songs" element={<Songs />} />
          <Route path="songs/:id" element={<SongEditor />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}