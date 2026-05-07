import { Vibrant } from 'node-vibrant/browser';
import {
  fetchTracks,
  pickRandom,
  withAppId,
  CACHE_DURATION_MS,
  API_CALLS,
  type Track,
} from '@dzr-tab/deezer-api';

interface SessionCache {
  dzTracks: Track[];
  dzLastCall: number;
  dzCallIndex: number;
}

async function readCache(): Promise<SessionCache | null> {
  const result = await browser.storage.session.get(['dzTracks', 'dzLastCall', 'dzCallIndex']);
  const tracks = result.dzTracks;
  if (!Array.isArray(tracks) || !tracks.length) return null;
  return {
    dzTracks: tracks as Track[],
    dzLastCall: (result.dzLastCall as number) ?? 0,
    dzCallIndex: (result.dzCallIndex as number) ?? 0,
  };
}

async function writeCache(tracks: Track[], callIndex: number): Promise<void> {
  await browser.storage.session.set({
    dzTracks: tracks,
    dzLastCall: Date.now(),
    dzCallIndex: (callIndex + 1) % API_CALLS.length,
  } satisfies SessionCache);
}

async function ensureUuid(): Promise<void> {
  const { uuid } = await browser.storage.sync.get('uuid');
  if (!uuid) {
    const id = (Date.now().toString(36) + Math.random().toString(36).slice(2, 7)).toUpperCase();
    await browser.storage.sync.set({ uuid: id });
  }
}

async function applyPalette(imageUrl: string): Promise<void> {
  try {
    const palette = await Vibrant.from(imageUrl).getPalette();
    const v = palette.Vibrant;
    const m = palette.Muted ?? palette.DarkMuted ?? palette.Vibrant;
    if (!v || !m) return;

    const [vr, vg, vb] = v.rgb;
    const [mr, mg, mb] = m.rgb;
    document.body.style.backgroundImage =
      `linear-gradient(to right top, rgb(${vr},${vg},${vb}), rgb(${mr},${mg},${mb}))`;

    const luminance = (vr * 299 + vg * 587 + vb * 114) / 1000;
    document.body.classList.toggle('palette-light', luminance > 130);
  } catch {
    // keep default gradient
  }
}

function renderTrack(track: Track): void {
  const coverUrl =
    track.album.cover_big ?? `https://api.deezer.com/album/${track.album.id}/image?size=500`;

  const coverLink = document.querySelector<HTMLAnchorElement>('.track-cover a')!;
  coverLink.href = withAppId(track.link);
  const img = coverLink.querySelector<HTMLImageElement>('img')!;
  img.src = coverUrl;
  img.alt = `${track.title} — ${track.artist.name}`;

  const titleLink = document.querySelector<HTMLAnchorElement>('.track-title a')!;
  titleLink.href = withAppId(track.link);
  titleLink.textContent = track.title;

  const artistLink = document.querySelector<HTMLAnchorElement>('.track-artist a')!;
  artistLink.href = withAppId(track.artist.link);
  artistLink.textContent = track.artist.name;

  applyPalette(coverUrl);
}

async function init(): Promise<void> {
  const logoLink = document.querySelector<HTMLAnchorElement>('#logo a')!;
  logoLink.href = withAppId('https://www.deezer.com');

  await ensureUuid();

  const cache = await readCache();
  const stale = !cache || Date.now() - cache.dzLastCall > CACHE_DURATION_MS;

  if (stale) {
    const callIndex = cache?.dzCallIndex ?? 0;
    try {
      const tracks = await fetchTracks(callIndex);
      if (tracks.length) {
        await writeCache(tracks, callIndex);
        renderTrack(pickRandom(tracks));
        return;
      }
    } catch {
      // fall through to cached data
    }
  }

  if (cache?.dzTracks.length) {
    renderTrack(pickRandom(cache.dzTracks));
  }
}

document.addEventListener('DOMContentLoaded', init);
