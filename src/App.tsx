import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Music, Settings } from 'lucide-react';
import Layout from './components/Layout';
import Login from './components/auth/Login';
import Songs from './components/songs/Songs';
import SongEditor from './components/songs/SongEditor';
import { useAuthStore } from './stores/authStore';

function App() {
  const { session } = useAuthStore();

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

export default App;