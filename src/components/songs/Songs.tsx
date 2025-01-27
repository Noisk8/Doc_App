import React, { useEffect, useState, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Music, Clock, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../stores/authStore';
import type { Song } from '../../types/database';
import { SongCardSkeleton } from '../Skeleton';

export default function Songs() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { session } = useAuthStore();

  useEffect(() => {
    loadSongs();
  }, []);

  async function loadSongs() {
    try {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
      .from('songs')
      .select('*')
      .order('created_at', { ascending: false });

      if (error) throw error;
      setSongs(data || []);
    } catch (error) {
      console.error('Error loading songs:', error);
      setError('Failed to load songs. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function createSong() {
    if (!session?.user.id) {
      setError('You must be logged in to create a song.');
      return;
    }

    try {
      setCreating(true);
      setError(null);

      const { error: userError } = await supabase
      .from('users')
      .upsert(
        {
          id: session.user.id,
          email: session.user.email
        },
        { onConflict: 'id' }
      );

      if (userError) throw userError;

      const { data, error } = await supabase
      .from('songs')
      .insert([
        {
          title: 'New Song',
          duration: 300,
          user_id: session.user.id
        },
      ])
      .select()
      .single();

      if (error) throw error;
      if (data) {
        setSongs([data, ...songs]);
        setError(null);
      }
    } catch (error: any) {
      console.error('Error creating song:', error);
      setError('Failed to create song. Please try again.');
    } finally {
      setCreating(false);
    }
  }

  async function deleteSong(songId: string, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    if (!confirm('Are you sure you want to delete this song? This action cannot be undone.')) {
      return;
    }

    try {
      setDeleting(songId);
      setError(null);

      // Delete timeline entries first
      const { error: timelineError } = await supabase
      .from('timeline_entries')
      .delete()
      .eq('song_id', songId);

      if (timelineError) throw timelineError;

      // Then delete the song
      const { error } = await supabase
      .from('songs')
      .delete()
      .eq('id', songId);

      if (error) throw error;

      setSongs(songs.filter(song => song.id !== songId));
    } catch (error: any) {
      console.error('Error deleting song:', error);
      setError('Failed to delete song. Please try again.');
    } finally {
      setDeleting(null);
    }
  }

  function formatDuration(seconds: number) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  if (loading) {
    return (
      <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <SongCardSkeleton key={i} />
      ))}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
    <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">Your Songs</h1>
    <button
    onClick={createSong}
    disabled={creating}
    className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transform-gpu transition-all"
    >
    {creating ? (
      <>
      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3"></div>
      Creating...
      </>
    ) : (
      <>
      <Plus className="h-5 w-5 mr-2" />
      New Song
      </>
    )}
    </button>
    </div>

    {error && (
      <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-6 py-4 rounded-md text-base">
      {error}
      </div>
    )}

    {songs.length === 0 ? (
      <div className="text-center py-12">
      <Music className="mx-auto h-16 w-16 text-gray-400" />
      <h3 className="mt-4 text-xl font-medium text-gray-900">No songs yet</h3>
      <p className="mt-2 text-lg text-gray-500">Get started by creating a new song.</p>
      <div className="mt-8">
      <button
      onClick={createSong}
      disabled={creating}
      className="inline-flex items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transform-gpu transition-all"
      >
      {creating ? (
        <>
        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3"></div>
        Creating...
        </>
      ) : (
        <>
        <Plus className="h-5 w-5 mr-2" />
        New Song
        </>
      )}
      </button>
      </div>
      </div>
    ) : (
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
      <ul className="divide-y divide-gray-200">
      {songs.map((song) => (
        <li key={song.id} className="transform-gpu transition-all hover:bg-gray-50">
        <Link
        to={`/songs/${song.id}`}
        className="block p-6"
        >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center">
        <Music className="h-6 w-6 text-gray-400 mr-4" />
        <p className="text-xl font-medium text-indigo-600 truncate">
        {song.title}
        </p>
        </div>
        <div className="flex items-center space-x-4">
        <div className="flex items-center text-base text-gray-500">
        <Clock className="h-5 w-5 mr-2" />
        {formatDuration(song.duration)}
        </div>
        <button
        onClick={(e) => deleteSong(song.id, e)}
        disabled={deleting === song.id}
        className="inline-flex items-center p-2 border border-transparent rounded-md text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
        >
        {deleting === song.id ? (
          <div className="animate-spin rounded-full h-5 w-5 border-2 border-red-600 border-t-transparent"></div>
        ) : (
          <Trash2 className="h-5 w-5" />
        )}
        </button>
        </div>
        </div>
        <div className="mt-4 sm:mt-2">
        <p className="text-base text-gray-500">
        Created {new Date(song.created_at).toLocaleDateString()}
        </p>
        </div>
        </Link>
        </li>
      ))}
      </ul>
      </div>
    )}
    </div>
  );
}
