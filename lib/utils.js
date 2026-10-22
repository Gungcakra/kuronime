const NO_IMAGE = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="420" viewBox="0 0 300 420"><rect width="300" height="420" fill="%23111111"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23707070" font-family="sans-serif" font-size="14">No Image</text></svg>';

// Paged listings shown in the navbar besides Beranda
export const LISTINGS = [
  { slug: 'ongoing', label: 'Ongoing', title: 'Anime Ongoing', paged: false },
  { slug: 'latest', label: 'Baru Upload', title: 'Baru Diupload', paged: true },
  { slug: 'movie', label: 'Movie', title: 'Anime Movie', paged: false }
];

export const NAV_ITEMS = [
  { href: '/', label: 'Beranda' },
  { href: '/explore', label: 'Explore' },
  ...LISTINGS.map(l => ({ href: `/${l.slug}`, label: l.label })),
  { href: '/schedule', label: 'Jadwal' },
  { href: '/az', label: 'A-Z' }
];

export function proxyImage(url) {
  return url ? `/api/image-proxy?url=${encodeURIComponent(url)}` : NO_IMAGE;
}

export const animeHref = slug => `/anime/${encodeURIComponent(slug)}`;

// The anime slug rides along so the watch page can show the episode list
export const watchHref = (episodeSlug, animeSlug) =>
  `/watch/${encodeURIComponent(episodeSlug)}${animeSlug ? `?anime=${encodeURIComponent(animeSlug)}` : ''}`;

// "220 (End)" -> "Episode 220 (End)", but leave "Movie" or "OVA 2" alone
export function episodeLabel(number) {
  const n = String(number || '').trim();
  return /^\d/.test(n) ? `Episode ${n}` : n || 'Episode';
}

export function formatSize(kb) {
  if (!kb) return '';
  return kb >= 1024 * 1024 ? `${(kb / 1024 / 1024).toFixed(1)} GB` : `${Math.round(kb / 1024)} MB`;
}

// Friendly tier for a resolution string like "1080p"
export function qualityTier(reso) {
  const n = parseInt(reso, 10);
  if (!n) return '';
  if (n >= 2160) return '4K Ultra HD';
  if (n >= 1080) return 'Full HD';
  if (n >= 720) return 'HD';
  if (n >= 480) return 'SD';
  return 'Hemat kuota';
}

export function statusClass(status = '') {
  const s = status.toLowerCase();
  if (s.includes('ongoing')) return 'ongoing';
  if (s.includes('complete')) return 'completed';
  return '';
}

export function formatTime(unixSeconds) {
  if (!unixSeconds) return '';
  return new Date(unixSeconds * 1000).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}

// Splits a long episode list into tabs of `size`, labelled by the episode
// numbers at each end ("1–100"), keeping the list's own order
export function episodeRanges(list, size = 100) {
  const ranges = [];
  for (let i = 0; i < list.length; i += size) {
    const items = list.slice(i, i + size);
    const first = items[0].number;
    const last = items[items.length - 1].number;
    ranges.push({ label: first === last ? first : `${first}–${last}`, items });
  }
  return ranges;
}

export const formatViews = n => (n ? `${Number(n).toLocaleString('id-ID')}x ditonton` : '');

const compact = new Intl.NumberFormat('id-ID', { notation: 'compact', maximumFractionDigits: 1 });
export const formatViewsShort = n => (n ? `${compact.format(n)} ditonton` : '');
