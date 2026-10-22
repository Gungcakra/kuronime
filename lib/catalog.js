// Server-only: a filterable index of the whole catalogue for /api/explore.
//
// Upstream has no genre/filter endpoint, but search results carry genre,
// status, score, studio and release date, and keyword "a" matches ~99.9% of
// titles. Crawling those ~240 pages (20 items each, fixed) gives us the full
// catalogue to filter locally. Each page sits in Next's data cache, so a
// rebuild (or another serverless instance) mostly reads cached pages.

import { fetchUpstream, toCard } from './upstream';

const SEED_KEYWORD = 'a';
const CONCURRENCY = 8;
const PAGE_REVALIDATE = 12 * 3600;
const TTL_MS = 12 * 3600 * 1000;
// A crawl that lost some pages is kept, but refreshed much sooner
const PARTIAL_TTL_MS = 10 * 60 * 1000;
const MAX_FAILED_RATIO = 0.1;

export const PER_PAGE = 30;
export const SORTS = ['newest', 'oldest', 'score', 'title', 'episodes'];

// Upstream genre tags are hand-typed: merge typos, drop junk
const GENRE_FIX = {
  'sci-fi': 'Sci-Fi',
  'slice of life': 'Slice of Life',
  actions: 'Action',
  ction: 'Action',
  adven: 'Adventure',
  omedy: 'Comedy',
  historicial: 'Historical',
  reincaranation: 'Reincarnation',
  scholl: 'School',
  kids: 'Kids',
  cgdct: 'CGDCT'
};
const GENRE_DROP = new Set(['', 'tes', 'test', 'pengumuman', 'fall 2022', 'animation', 'life']);
const MIN_GENRE_COUNT = 3;

const STATUS_FIX = { finished: 'Completed', drop: 'Dropped', 'n/a': '', pengumuman: '' };

let state = { catalog: null, expiresAt: 0, building: null, progress: { done: 0, total: 0 }, error: null };

function searchPage(page) {
  return fetchUpstream(`search.php?keyword=${SEED_KEYWORD}&page=${page}`, { revalidate: PAGE_REVALIDATE })
    .then(data => data?.data?.[0]);
}

const fold = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

function normStatus(raw = '') {
  const k = raw.trim().toLowerCase();
  return k in STATUS_FIX ? STATUS_FIX[k] : raw.trim();
}

function buildIndex(rawItems) {
  // Display name per genre key: the fix table, else the most common casing
  const variants = new Map();
  for (const item of rawItems) {
    for (const g of Array.isArray(item.genre) ? item.genre : []) {
      const key = String(g).trim().toLowerCase();
      if (GENRE_DROP.has(key)) continue;
      const k = GENRE_FIX[key] ? GENRE_FIX[key].toLowerCase() : key;
      const counts = variants.get(k) || new Map();
      const label = GENRE_FIX[key] || String(g).trim();
      counts.set(label, (counts.get(label) || 0) + 1);
      variants.set(k, counts);
    }
  }
  const genreName = new Map([...variants].map(([k, counts]) => [k, [...counts].sort((a, b) => b[1] - a[1])[0][0]]));
  const toGenre = g => {
    const key = String(g).trim().toLowerCase();
    if (GENRE_DROP.has(key)) return null;
    return genreName.get(GENRE_FIX[key] ? GENRE_FIX[key].toLowerCase() : key) || null;
  };

  const seen = new Set();
  const items = [];
  for (const raw of rawItems) {
    const card = toCard(raw);
    if (!card.slug || seen.has(card.slug)) continue;
    seen.add(card.slug);
    const year = Number(String(raw.rilis || '').match(/\b(19|20)\d{2}\b/)?.[0]) || null;
    const score = parseFloat(raw.score);
    items.push({
      slug: card.slug,
      title: card.title,
      cover: card.cover,
      episode: card.episode,
      status: normStatus(card.status),
      score: Number.isFinite(score) && score > 0 ? score : null,
      genres: [...new Set(card.genres.map(toGenre).filter(Boolean))],
      year,
      studio: card.studio,
      episodes: Number(raw.total_episode) || 0,
      id: Number(raw.id) || 0,
      search: fold(card.title)
    });
  }

  const tally = pick => {
    const counts = new Map();
    for (const item of items) for (const v of pick(item)) counts.set(v, (counts.get(v) || 0) + 1);
    return counts;
  };
  const genres = [...tally(i => i.genres)]
    .filter(([, n]) => n >= MIN_GENRE_COUNT)
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({ name, count }));
  const statuses = [...tally(i => (i.status ? [i.status] : []))]
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({ name, count }));
  const years = [...tally(i => (i.year ? [i.year] : []))]
    .sort((a, b) => b[0] - a[0])
    .map(([name, count]) => ({ name, count }));

  return { items, facets: { genres, statuses, years }, indexedAt: Date.now() };
}

async function crawl() {
  const first = await searchPage(1);
  const totalPages = Number(first?.pagination?.total_pages) || 1;
  const raw = [...(first?.result || [])];
  state.progress = { done: 1, total: totalPages };

  let next = 2;
  let failed = 0;
  await Promise.all(Array.from({ length: CONCURRENCY }, async () => {
    while (next <= totalPages) {
      const page = next++;
      try {
        raw.push(...((await searchPage(page))?.result || []));
      } catch {
        failed++;
      }
      state.progress = { done: state.progress.done + 1, total: totalPages };
    }
  }));

  if (failed > totalPages * MAX_FAILED_RATIO) {
    throw new Error(`Gagal memuat ${failed} dari ${totalPages} halaman katalog`);
  }
  return { ...buildIndex(raw), partial: failed > 0 };
}

function startBuild() {
  if (state.building) return state.building;
  state.error = null;
  state.building = crawl()
    .then(catalog => {
      state.catalog = catalog;
      state.expiresAt = Date.now() + (catalog.partial ? PARTIAL_TTL_MS : TTL_MS);
    })
    .catch(err => {
      console.error('Catalog build failed:', err.message);
      state.error = err;
      // Keep serving the old index; try again on a later request
      if (state.catalog) state.expiresAt = Date.now() + PARTIAL_TTL_MS;
    })
    .finally(() => {
      state.building = null;
    });
  return state.building;
}

// Returns the current index (possibly stale while a refresh runs) and the
// pending build, if any, so the caller can keep the function alive for it.
export function ensureCatalog() {
  if (!state.catalog || Date.now() > state.expiresAt) {
    // Report a failed first build once, then let the next request retry
    if (!state.catalog && state.error && !state.building) {
      const err = state.error;
      state.error = null;
      throw err;
    }
    startBuild();
  }
  return { catalog: state.catalog, building: state.building, progress: state.progress };
}

const list = v => (v ? v.split(',').map(s => s.trim()).filter(Boolean) : []);

const COMPARE = {
  newest: (a, b) => (b.year || 0) - (a.year || 0) || b.id - a.id,
  oldest: (a, b) => (a.year || 9999) - (b.year || 9999) || a.id - b.id,
  score: (a, b) => (b.score || 0) - (a.score || 0) || (b.year || 0) - (a.year || 0),
  title: (a, b) => a.title.localeCompare(b.title),
  episodes: (a, b) => b.episodes - a.episodes || (b.score || 0) - (a.score || 0)
};

export function queryCatalog(catalog, params) {
  const q = fold((params.get('q') || '').trim());
  const genres = list(params.get('genre'));
  const status = params.get('status') || '';
  const year = Number(params.get('year')) || null;
  const minScore = Number(params.get('score')) || 0;
  const sort = SORTS.includes(params.get('sort')) ? params.get('sort') : 'newest';

  const matches = catalog.items.filter(item =>
    (!q || item.search.includes(q)) &&
    genres.every(g => item.genres.includes(g)) &&
    (!status || item.status === status) &&
    (!year || item.year === year) &&
    (!minScore || (item.score || 0) >= minScore)
  );
  matches.sort(COMPARE[sort]);

  const total = matches.length;
  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));
  const page = Math.min(Math.max(1, parseInt(params.get('page'), 10) || 1), totalPages);
  const result = matches
    .slice((page - 1) * PER_PAGE, page * PER_PAGE)
    .map(({ search, id, ...item }) => ({ ...item, score: item.score ? item.score.toFixed(2) : '' }));

  return {
    page,
    perPage: PER_PAGE,
    total,
    totalPages,
    sort,
    result,
    facets: catalog.facets,
    indexedAt: catalog.indexedAt,
    partial: catalog.partial
  };
}
