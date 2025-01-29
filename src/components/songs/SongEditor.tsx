import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Music, Plus, Save, Trash2, Clock, ArrowLeft, Copy, Cable, X, Settings, Radio } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { type Song, type TimelineEntry, type InstrumentType } from '../../types/database';

const INSTRUMENT_TYPES = {
  CASIO_SA1: 'CASIO_SA1',
  HEXAOXILATOR: 'HEXAOXILATOR',
  ZOOM_PEDAL: 'ZOOM_PEDAL',
  ATARIPUNK: 'ATARIPUNK',
} as const;

const INSTRUMENT_COLORS = {
  [INSTRUMENT_TYPES.CASIO_SA1]: 'bg-blue-500',
  [INSTRUMENT_TYPES.HEXAOXILATOR]: 'bg-green-500',
  [INSTRUMENT_TYPES.ZOOM_PEDAL]: 'bg-purple-500',
  [INSTRUMENT_TYPES.ATARIPUNK]: 'bg-orange-500',
  MIXER: 'bg-red-500',
};

const INSTRUMENT_ICONS = {
  [INSTRUMENT_TYPES.CASIO_SA1]: '🎹',
  [INSTRUMENT_TYPES.HEXAOXILATOR]: '🎛️',
  [INSTRUMENT_TYPES.ZOOM_PEDAL]: '🎛️',
  [INSTRUMENT_TYPES.ATARIPUNK]: '🎮',
};

interface Connection {
  from: string;
  to: string;
}

interface Position {
  x: number;
  y: number;
}

interface DraggableInstrument extends TimelineEntry {
  position: Position;
}

const handleContextMenu = (e: React.MouseEvent, fromId: string, toId: string) => {
  e.preventDefault();
  removeConnection(fromId, toId);
};

const drawConnection = (from: Position, to: Position, fromId: string, toId: string) => {
  const midY = (from.y + to.y) / 2;
  
  return (
    <g>
      <path
        d={`M ${from.x} ${from.y} C ${from.x} ${midY}, ${to.x} ${midY}, ${to.x} ${to.y}`}
        stroke="white"
        strokeWidth="2"
        fill="none"
        strokeDasharray="4"
        style={{ cursor: 'context-menu' }}
        onContextMenu={(e) => handleContextMenu(e, fromId, toId)}
      />
      <path
        d={`M ${from.x} ${from.y} C ${from.x} ${midY}, ${to.x} ${midY}, ${to.x} ${to.y}`}
        stroke="transparent"
        strokeWidth="10"
        fill="none"
        style={{ cursor: 'context-menu' }}
        onContextMenu={(e) => handleContextMenu(e, fromId, toId)}
      />
    </g>
  );
};

export default function SongEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [song, setSong] = useState<Song | null>(null);
  const [entries, setEntries] = useState<TimelineEntry[]>([]);
  const [draggableInstruments, setDraggableInstruments] = useState<DraggableInstrument[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draggedInstrument, setDraggedInstrument] = useState<string | null>(null);
  const [mousePosition, setMousePosition] = useState<Position>({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);

  const [newEntry, setNewEntry] = useState<Partial<TimelineEntry>>({
    instrument_type: INSTRUMENT_TYPES.CASIO_SA1,
    start_time: 0,
    end_time: 60,
    notes: '',
    settings: {}
  });

  useEffect(() => {
    loadSongData();
  }, [id]);

  useEffect(() => {
    // Initialize draggable instruments with positions
    const centerX = canvasRef.current ? canvasRef.current.clientWidth / 2 : 400;
    const centerY = canvasRef.current ? canvasRef.current.clientHeight / 2 : 300;

    // Position instruments in a circle around the mixer
    const radius = 200;
    const angleStep = (2 * Math.PI) / (entries.length || 1);
    
    const instrumentsWithPositions = entries.map((entry, index) => ({
      ...entry,
      position: {
        x: centerX + radius * Math.cos(angleStep * index),
        y: centerY + radius * Math.sin(angleStep * index),
      }
    }));

    setDraggableInstruments(instrumentsWithPositions);
  }, [entries]);

  async function loadSongData() {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);

      const { data: songData, error: songError } = await supabase
        .from('songs')
        .select('*')
        .eq('id', id)
        .single();

      if (songError) throw songError;
      setSong(songData);

      const { data: entriesData, error: entriesError } = await supabase
        .from('timeline_entries')
        .select('*')
        .eq('song_id', id)
        .order('start_time', { ascending: true });

      if (entriesError) throw entriesError;
      setEntries(entriesData || []);
    } catch (error: any) {
      console.error('Error loading song data:', error);
      setError('Failed to load song data. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function saveSong(e: React.FormEvent) {
    e.preventDefault();
    if (!song || !id) return;

    try {
      setSaving(true);
      setError(null);

      const { error } = await supabase
        .from('songs')
        .update({
          title: song.title,
          duration: song.duration,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
    } catch (error: any) {
      console.error('Error saving song:', error);
      setError('Failed to save song. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  async function addTimelineEntry() {
    if (!id || !song) return;

    if (newEntry.start_time! >= newEntry.end_time!) {
      setError('Start time must be less than end time');
      return;
    }

    if (newEntry.end_time! > song.duration) {
      setError('End time cannot be greater than song duration');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const { data, error } = await supabase
        .from('timeline_entries')
        .insert([{
          ...newEntry,
          song_id: id
        }])
        .select()
        .single();

      if (error) throw error;
      if (data) {
        setEntries([...entries, data]);
        setNewEntry({
          instrument_type: INSTRUMENT_TYPES.CASIO_SA1,
          start_time: 0,
          end_time: 60,
          notes: '',
          settings: {}
        });
      }
    } catch (error: any) {
      console.error('Error adding timeline entry:', error);
      setError('Failed to add timeline entry. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  async function deleteTimelineEntry(entryId: string) {
    try {
      setSaving(true);
      setError(null);

      const { error } = await supabase
        .from('timeline_entries')
        .delete()
        .eq('id', entryId);

      if (error) throw error;
      setEntries(entries.filter(entry => entry.id !== entryId));
    } catch (error: any) {
      console.error('Error deleting timeline entry:', error);
      setError('Failed to delete timeline entry. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  const handleDragStart = (instrumentId: string, e: React.MouseEvent) => {
    setDraggedInstrument(instrumentId);
    setMousePosition({ x: e.clientX, y: e.clientY });
  };

  const handleDrag = (e: React.MouseEvent) => {
    if (!draggedInstrument) return;

    const dx = e.clientX - mousePosition.x;
    const dy = e.clientY - mousePosition.y;

    setDraggableInstruments(instruments => 
      instruments.map(inst => {
        if (inst.id === draggedInstrument) {
          return {
            ...inst,
            position: {
              x: inst.position.x + dx,
              y: inst.position.y + dy,
            }
          };
        }
        return inst;
      })
    );

    setMousePosition({ x: e.clientX, y: e.clientY });
  };

  const handleDragEnd = () => {
    setDraggedInstrument(null);
  };

  const handleStartConnection = (instrumentId: string) => {
    if (connectingFrom === instrumentId) {
      setConnectingFrom(null);
    } else if (connectingFrom) {
      // Complete the connection
      if (connectingFrom !== 'mixer' && instrumentId !== 'mixer') {
        setConnections(prev => [...prev, { from: connectingFrom, to: 'mixer' }]);
      }
      setConnections(prev => [...prev, { from: connectingFrom, to: instrumentId }]);
      setConnectingFrom(null);
    } else {
      setConnectingFrom(instrumentId);
    }
  };

  const removeConnection = (fromId: string, toId: string) => {
    setConnections(prev => prev.filter(conn => !(conn.from === fromId && conn.to === toId)));
  };

  function formatTime(seconds: number) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  function formatDetailedTime(seconds: number) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  function generateTimeMarkers(duration: number) {
    const markers = [];
    const majorInterval = 60; // 1 minute
    const minorInterval = 5; // 5 seconds
    
    for (let time = 0; time <= duration; time += minorInterval) {
      const isMajor = time % majorInterval === 0;
      markers.push({
        time,
        isMajor,
        label: formatDetailedTime(time)
      });
    }
    
    return markers;
  }

  function safeParseInt(value: string): number {
    const parsed = parseInt(value);
    return isNaN(parsed) ? 0 : parsed;
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!song) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Song not found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/songs')}
          className="inline-flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Songs
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      <form onSubmit={saveSong} className="bg-white shadow-sm rounded-lg p-6">
        <div className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Song Title
            </label>
            <input
              type="text"
              id="title"
              value={song.title}
              onChange={(e) => setSong({ ...song, title: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="duration" className="block text-sm font-medium text-gray-700">
              Duration (seconds)
            </label>
            <input
              type="number"
              id="duration"
              min="1"
              value={song.duration || 0}
              onChange={(e) => setSong({ ...song, duration: safeParseInt(e.target.value) })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Workflow Canvas */}
      <div className="mb-6 bg-gray-900 p-8 rounded-lg relative overflow-hidden" style={{ height: '600px' }} ref={canvasRef}>
        <h3 className="text-sm font-medium text-white mb-4">Instrument Workflow</h3>
        
        {/* Central Mixer */}
        <div
          className={`absolute p-4 rounded-lg ${INSTRUMENT_COLORS.MIXER} text-white shadow-lg cursor-pointer transition-shadow hover:shadow-xl`}
          style={{
            left: canvasRef.current ? canvasRef.current.clientWidth / 2 - 50 : 350,
            top: canvasRef.current ? canvasRef.current.clientHeight / 2 - 50 : 250,
            width: '100px',
            height: '100px',
            zIndex: 10,
          }}
          onClick={() => handleStartConnection('mixer')}
        >
          <div className="flex flex-col items-center justify-center h-full">
            <Radio className="h-8 w-8 mb-2" />
            <span className="text-sm font-medium">Mixer</span>
            <div className="mt-2 text-xs">
              {connections.filter(c => c.to === 'mixer').length} inputs
            </div>
          </div>
        </div>

        {/* Connection Lines */}
        <svg className="absolute top-0 left-0 w-full h-full" style={{ zIndex: 0 }}>
          {connections.map((conn, idx) => {
            const fromInst = draggableInstruments.find(i => i.id === conn.from);
            const toInst = conn.to === 'mixer' 
              ? { position: { 
                  x: canvasRef.current ? canvasRef.current.clientWidth / 2 : 400,
                  y: canvasRef.current ? canvasRef.current.clientHeight / 2 : 300
                }}
              : draggableInstruments.find(i => i.id === conn.to);

            if (fromInst && toInst) {
              return (
                <g key={`conn-${idx}`}>
                  {drawConnection(fromInst.position, toInst.position, conn.from, conn.to)}
                </g>
              );
            }
            return null;
          })}
        </svg>

        {/* Draggable Instruments */}
        {draggableInstruments.map((instrument) => (
          <div
            key={instrument.id}
            className={`absolute p-4 rounded-lg ${
              INSTRUMENT_COLORS[instrument.instrument_type as keyof typeof INSTRUMENT_COLORS]
            } text-white shadow-lg cursor-move transition-shadow hover:shadow-xl`}
            style={{
              left: instrument.position.x - 50,
              top: instrument.position.y - 50,
              width: '100px',
              height: '100px',
              zIndex: draggedInstrument === instrument.id ? 20 : 10,
            }}
            onMouseDown={(e) => handleDragStart(instrument.id, e)}
            onMouseMove={handleDrag}
            onMouseUp={handleDragEnd}
            onMouseLeave={handleDragEnd}
          >
            <div className="flex flex-col items-center justify-center h-full">
              <span className="text-2xl mb-2" role="img" aria-label={instrument.instrument_type}>
                {INSTRUMENT_ICONS[instrument.instrument_type as keyof typeof INSTRUMENT_ICONS]}
              </span>
              <span className="text-sm font-medium text-center">{instrument.instrument_type}</span>
              <div className="flex space-x-1 mt-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStartConnection(instrument.id);
                  }}
                  className={`p-1 rounded hover:bg-black hover:bg-opacity-20 ${
                    connectingFrom === instrument.id ? 'bg-black bg-opacity-20' : ''
                  }`}
                  title={connectingFrom === instrument.id ? 'Click another instrument to connect' : 'Connect'}
                >
                  <Cable className="h-4 w-4" />
                </button>
                <button
                  onClick={(e) => e.stopPropagation()}
                  className="p-1 rounded hover:bg-black hover:bg-opacity-20"
                  title="Settings"
                >
                  <Settings className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Timeline Section */}
      <div className="bg-white shadow-sm rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-6">Timeline</h2>

        <div className="mb-8">
          <div className="relative bg-gray-100 rounded-lg overflow-hidden" style={{ height: "400px" }}>
            {/* Time markers */}
            <div className="absolute top-0 left-0 w-full h-8 bg-gray-200 border-b border-gray-300">
              <div className="relative w-full h-full">
                {generateTimeMarkers(song?.duration || 0).map(({ time, isMajor, label }) => (
                  <div
                    key={time}
                    className="absolute top-0 flex flex-col items-center"
                    style={{ left: `${(time / (song?.duration || 1)) * 100}%` }}
                  >
                    <div 
                      className={`h-3 w-px ${isMajor ? 'bg-gray-600' : 'bg-gray-400'}`}
                    />
                    {isMajor && (
                      <span className="text-xs text-gray-600 mt-1">{label}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Grid lines */}
            <div className="absolute top-8 left-0 w-full h-[calc(100%-2rem)] pointer-events-none">
              {generateTimeMarkers(song?.duration || 0)
                .filter(marker => marker.isMajor)
                .map(({ time }) => (
                  <div
                    key={time}
                    className="absolute top-0 h-full w-px bg-gray-300 opacity-50"
                    style={{ left: `${(time / (song?.duration || 1)) * 100}%` }}
                  />
                ))}
            </div>

            {/* Timeline entries with scrollable container */}
            <div className="absolute top-8 left-0 w-full h-[calc(100%-2rem)] overflow-y-auto">
              <div className="p-2">
                {entries.map((entry) => (
                  <div
                    key={entry.id}
                    className="relative h-16 mb-4 last:mb-0"
                    title={`${entry.instrument_type} (${formatDetailedTime(entry.start_time)} - ${formatDetailedTime(entry.end_time)})`}
                  >
                    <div
                      className={`absolute h-full rounded-md ${
                        INSTRUMENT_COLORS[entry.instrument_type as keyof typeof INSTRUMENT_COLORS]
                      } bg-opacity-75 flex items-center justify-between px-3 text-white font-medium group transition-all hover:bg-opacity-90`}
                      style={{
                        left: `${(entry.start_time / song.duration) * 100}%`,
                        width: `${((entry.end_time - entry.start_time) / song.duration) * 100}%`,
                        zIndex: 10
                      }}
                    >
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl" role="img" aria-label={entry.instrument_type}>
                          {INSTRUMENT_ICONS[entry.instrument_type as keyof typeof INSTRUMENT_ICONS]}
                        </span>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold">{entry.instrument_type}</span>
                          {entry.notes && (
                            <span className="text-xs opacity-90">{entry.notes}</span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => deleteTimelineEntry(entry.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-black hover:bg-opacity-20 rounded transition-opacity"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Current time indicator */}
            <div
              className="absolute top-0 h-full w-px bg-indigo-600 z-20"
              style={{ left: '0%' }}
            >
              <div className="absolute -top-1 -left-1.5 w-3 h-3 bg-indigo-600 rounded-full" />
            </div>
          </div>
        </div>

        <div className="border-t pt-6">
          <h3 className="text-sm font-medium text-gray-900 mb-4">Add New Entry</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Instrument
              </label>
              <select
                value={newEntry.instrument_type}
                onChange={(e) => setNewEntry({
                  ...newEntry,
                  instrument_type: e.target.value as InstrumentType
                })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                {Object.values(INSTRUMENT_TYPES).map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Start Time
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="range"
                  min="0"
                  max={song.duration}
                  value={newEntry.start_time || 0}
                  onChange={(e) => setNewEntry({
                    ...newEntry,
                    start_time: safeParseInt(e.target.value)
                  })}
                  className="flex-1"
                />
                <span className="text-sm text-gray-500 w-16">
                  {formatTime(newEntry.start_time || 0)}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                End Time
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="range"
                  min={newEntry.start_time || 0}
                  max={song.duration}
                  value={newEntry.end_time || 0}
                  onChange={(e) => setNewEntry({
                    ...newEntry,
                    end_time: safeParseInt(e.target.value)
                  })}
                  className="flex-1"
                />
                <span className="text-sm text-gray-500 w-16">
                  {formatTime(newEntry.end_time || 0)}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Notes
              </label>
              <input
                type="text"
                value={newEntry.notes || ''}
                onChange={(e) => setNewEntry({
                  ...newEntry,
                  notes: e.target.value
                })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
          </div>

          <div className="mt-4">
            <button
              type="button"
              onClick={addTimelineEntry}
              disabled={saving}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Entry
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}