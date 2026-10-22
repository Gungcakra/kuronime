// Server-only helpers for talking to the upstream anime API, ported
// from AmbaFlix-api/services/animeService.js. Used by the route handlers.

// Base URL lives in .env (API_BASE_URL) so it never lands in the repo
const API_BASE = (process.env.API_BASE_URL || '').replace(/\/+$/, '');
const CACHE_SECONDS = 180;

// Upstream answers 403 to anything that doesn't look like the Flutter app
export const UPSTREAM_HEADERS = {
  'User-Agent': 'Dart/3.4 (dart:io)',
  'Accept': 'application/json, text/plain, */*'
};

// Only sent when the base points at the Cloudflare Worker proxy (worker/proxy.js)
const API_HEADERS = process.env.API_PROXY_TOKEN
  ? { ...UPSTREAM_HEADERS, 'X-Proxy-Token': process.env.API_PROXY_TOKEN }
  : UPSTREAM_HEADERS;

const UPSTREAM_TIMEOUT_MS = 12_000;
const UPSTREAM_ATTEMPTS = 2;

// Some endpoints prefix the JSON with PHP warnings (<br /><b>Warning</b>...)
function parseLenient(text) {
  const starts = [text.indexOf('{'), text.indexOf('[')].filter(i => i !== -1);
  if (!starts.length) throw new Error('Upstream API returned no JSON');
  return JSON.parse(text.slice(Math.min(...starts)));
}

export async function fetchUpstream(endpoint, { cache = true, revalidate = CACHE_SECONDS } = {}) {
  if (!API_BASE) throw new Error('API_BASE_URL is not set (see .env.example)');
  let lastError;
  for (let attempt = 1; attempt <= UPSTREAM_ATTEMPTS; attempt++) {
    try {
      const response = await fetch(`${API_BASE}/${endpoint}`, {
        headers: API_HEADERS,
        signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
        ...(cache ? { next: { revalidate } } : { cache: 'no-store' })
      });
      if (response.ok) return parseLenient(await response.text());

      lastError = new Error(`Upstream API responded with status ${response.status} ${response.statusText}`);
      // Only server-side failures are worth retrying
      if (response.status < 500) break;
    } catch (err) {
      lastError = err.name === 'TimeoutError' ? new Error('Upstream API timeout') : err;
    }
    if (attempt < UPSTREAM_ATTEMPTS) await new Promise(r => setTimeout(r, 400));
  }
  throw lastError;
}

export class NotFoundError extends Error {}

// Builds a GET route handler. load(searchParams, ctx) returns the JSON body,
// or a Response to short-circuit.
export function jsonRoute(label, load) {
  return async (request, ctx) => {
    try {
      const body = await load(new URL(request.url).searchParams, ctx);
      return body instanceof Response ? body : Response.json(body);
    } catch (err) {
      console.error(`Error fetching ${label}:`, err.message);
      const notFound = err instanceof NotFoundError;
      // Anything but a confirmed miss is an upstream problem (502), which the
      // client treats as transient and retries
      return Response.json(
        { error: `Failed to fetch ${label}`, details: err.message, notFound },
        { status: notFound ? 404 : 502 }
      );
    }
  };
}

export function parseHttpUrl(raw) {
  try {
    const u = new URL(raw);
    return u.protocol === 'http:' || u.protocol === 'https:' ? u : null;
  } catch {
    return null;
  }
}

export const parsePage = params => Math.max(1, parseInt(params.get('page'), 10) || 1);

// ---------------------------------------------------------------------------
// Normalisation: upstream field names (judul, lastch, ...) -> Kuronime shape

export function cleanSlug(url) {
  return url == null ? '' : String(url).trim().replace(/^\/+|\/+$/g, '');
}

export function toCard(item) {
  return {
    slug: cleanSlug(item.url || item.slug || item.link || item.id),
    title: item.judul || item.title || item.anime_name || '',
    cover: item.cover || item.thumbnail || '',
    episode: item.lastch || (item.total_episode ? `${item.total_episode} Ep` : ''),
    updated: item.lastup || '',
    status: item.status || '',
    score: item.score || item.rating || '',
    genres: Array.isArray(item.genre) ? item.genre : [],
    synopsis: item.sinopsis || '',
    studio: item.studio || '',
    released: item.rilis || ''
  };
}

const toCards = data => (Array.isArray(data) ? data.map(toCard).filter(c => c.slug) : []);

// Slugs are stored inconsistently upstream (sometimes with a trailing slash),
// so try the variants until one returns data. Only when every variant got a
// real (empty) answer is the item missing; if a request failed instead, the
// failure is rethrown so the client retries rather than showing "not found".
async function firstMatch(rawSlug, endpointFor, accept) {
  const trimmed = cleanSlug(rawSlug);
  let failure = null;
  for (const cand of new Set([trimmed, `${trimmed}/`, String(rawSlug)])) {
    try {
      const item = (await fetchUpstream(endpointFor(encodeURIComponent(cand))))?.data?.[0];
      if (accept(item)) return item;
    } catch (err) {
      failure = err;
    }
  }
  if (failure) throw failure;
  return null;
}

export async function getOngoing({ full = false } = {}) {
  const recent = toCards(await fetchUpstream('home/ongoing.php?page=1&type='));
  if (!full) return recent;
  const scheduled = (await getSchedule().catch(() => [])).flatMap(day => day.anime);
  const seen = new Set();
  return [...recent, ...scheduled].filter(c => !seen.has(c.slug) && seen.add(c.slug));
}

export async function getLatest(page = 1) {
  return toCards(await fetchUpstream(`baruupload.php?page=${page}`));
}

export async function getRecommendations() {
  return toCards(await fetchUpstream('rekomendasi.php'));
}

// Upstream pages search results 20 at a time and reports the totals
export async function searchAnime(keyword, page = 1) {
  const data = await fetchUpstream(`search.php?keyword=${encodeURIComponent(keyword)}&page=${page}`);
  const block = data?.data?.[0];
  const result = toCards(block?.result);
  return {
    result,
    total: Number(block?.pagination?.total ?? block?.jumlah) || result.length,
    totalPages: Number(block?.pagination?.total_pages) || 1
  };
}

export async function getMovies() {
  return toCards(await fetchUpstream('movie.php'));
}

export async function getSchedule() {
  const data = await fetchUpstream('jadwal.php');
  return (Array.isArray(data?.data) ? data.data : []).map(day => ({
    day: day.day,
    date: day.date,
    timestamp: day.date_ts || null,
    anime: (day.animeList || []).map(item => ({
      ...toCard(item),
      // Unix seconds of the latest episode upload
      uploadedAt: item.updated || null
    }))
  }));
}

// Upstream groups the directory by first letter: { "#": [...], "A": [...] }
export async function getAnimeList() {
  const data = await fetchUpstream('anime-list.php');
  if (!data || typeof data !== 'object' || Array.isArray(data)) return [];
  // Thousands of titles: keep only what the A-Z page shows
  return Object.entries(data).map(([letter, items]) => ({
    letter,
    anime: toCards(items).map(({ slug, title }) => ({ slug, title }))
  }));
}

export async function getAnimeDetail(rawSlug) {
  const series = await firstMatch(rawSlug, s => `series.php?url=${s}`, item => item?.id && item.judul);
  if (!series) throw new NotFoundError(`Anime tidak ditemukan: ${rawSlug}`);

  const slug = cleanSlug(series.series_id || rawSlug);
  return {
    id: series.id,
    slug,
    title: series.judul,
    cover: series.cover || '',
    type: series.type || '',
    status: series.status || '',
    rating: series.rating || '',
    published: series.published || '',
    studio: series.author || '',
    genres: Array.isArray(series.genre) ? series.genre : [],
    synopsis: series.sinopsis || '',
    // Upstream lists episodes newest-first
    episodes: (series.chapter || []).map((ch, idx, all) => ({
      id: ch.id,
      slug: cleanSlug(ch.url) || `${slug}-episode-${all.length - idx}`,
      number: ch.ch || String(all.length - idx),
      date: ch.date || '',
      views: ch.views || 0
    }))
  };
}

const RESO_ORDER = ['1080p', '720p', '480p', '360p'];
const resoRank = r => (RESO_ORDER.indexOf(r) + 1) || RESO_ORDER.length + 1;

export async function getEpisode(rawSlug) {
  const ep = await firstMatch(
    rawSlug,
    s => `series/episode/data.php?url=${s}`,
    item => item && (Object.keys(item.streams || {}).length > 0 || item.reso?.length > 0)
  );
  if (!ep) throw new NotFoundError(`Stream episode tidak ditemukan: ${rawSlug}`);

  const streams = ep.streams || {};
  // Best quality first; each resolution may have several mirrors
  const sources = Object.keys(streams)
    .sort((a, b) => resoRank(a) - resoRank(b))
    .flatMap(reso => (streams[reso] || [])
      .filter(s => s?.link)
      .map((s, idx) => ({
        id: `${reso}-${idx}`,
        quality: reso,
        label: idx ? `${reso} #${idx + 1}` : reso,
        url: s.link,
        sizeKb: s.size_kb || ep.resoSizeKb?.[reso] || null
      })));

  return { id: ep.episode_id, slug: cleanSlug(rawSlug), sources };
}
