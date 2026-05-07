export const APP_ID = 216424;
export const BASE_URL = 'https://api.deezer.com/';
export const CACHE_DURATION_MS = 60 * 60 * 1000;

export const API_CALLS = [
  { title: 'Top playlists', url: 'chart/0/playlists' },
  { title: 'Moments', url: 'playlist/53362031/tracks' },
  { title: 'Charts', url: 'chart/0/tracks' },
] as const;

export interface Artist {
  id: number;
  name: string;
  link: string;
  picture_medium: string;
}

export interface Album {
  id: number;
  title: string;
  cover_big: string;
}

export interface Track {
  id: number;
  title: string;
  link: string;
  type: 'track';
  artist: Artist;
  album: Album;
}

export interface Playlist {
  id: number;
  type: 'playlist' | 'album';
}

export type DeezerItem = Track | Playlist;

async function apiFetch<T>(path: string): Promise<{ data: T[] }> {
  const res = await fetch(`${BASE_URL}${path}`);
  if (!res.ok) throw new Error(`Deezer API ${res.status}: ${path}`);
  return res.json();
}

export function pickRandom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

export function withAppId(url: string): string {
  return `${url}${url.includes('?') ? '&' : '?'}app_id=${APP_ID}`;
}

export async function fetchTracks(callIndex: number, limit = 50): Promise<Track[]> {
  const call = API_CALLS[callIndex % API_CALLS.length];
  const { data } = await apiFetch<DeezerItem>(`${call.url}?limit=${limit}`);

  if (!data?.length) return [];

  const first = data[0];

  if (first.type === 'playlist' || first.type === 'album') {
    const pool = data.slice(0, 5) as Playlist[];
    const chosen = pickRandom(pool);
    const { data: tracks } = await apiFetch<Track>(`playlist/${chosen.id}/tracks?limit=${limit}`);
    return tracks ?? [];
  }

  return data as Track[];
}
