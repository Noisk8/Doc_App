export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface Song {
  id: string;
  user_id: string;
  title: string;
  duration: number;
  created_at: string;
  updated_at: string;
}

export interface TimelineEntry {
  id: string;
  song_id: string;
  instrument_type: string;
  start_time: number;
  end_time: number;
  settings: Record<string, any>;
  notes: string | null;
  created_at: string;
}

export const INSTRUMENT_TYPES = {
  CASIO_SA1: 'CASIO_SA1',
  HEXAOXILATOR: 'HEXAOXILATOR',
  ZOOM_PEDAL: 'ZOOM_PEDAL',
  ATARIPUNK: 'ATARIPUNK',
} as const;

export type InstrumentType = typeof INSTRUMENT_TYPES[keyof typeof INSTRUMENT_TYPES];