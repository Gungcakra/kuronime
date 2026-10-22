const TIMEOUT_MS = 20_000;

export class ApiError extends Error {
  constructor(message, status, { notFound = false } = {}) {
    super(message);
    this.status = status;
    // The server confirmed the item doesn't exist; retrying won't help
    this.notFound = notFound;
  }
}

async function apiFetch(endpoint, signal) {
  const timeout = AbortSignal.timeout(TIMEOUT_MS);
  let res;
  try {
    res = await fetch(`/api/${endpoint}`, { signal: signal ? AbortSignal.any([signal, timeout]) : timeout });
  } catch (err) {
    if (signal?.aborted) throw err;
    throw new ApiError(timeout.aborted ? 'Server terlalu lama merespons' : 'Koneksi ke server gagal', 0);
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(body.details || body.error || `HTTP ${res.status}`, res.status, { notFound: body.notFound === true });
  }
  return res.json();
}

const enc = encodeURIComponent;

export const api = {
  home: signal => apiFetch('home', signal),
  ongoing: (_page, signal) => apiFetch('ongoing', signal),
  latest: (page = 1, signal) => apiFetch(`latest?page=${page}`, signal),
  search: (q, page = 1, signal) => apiFetch(`search?q=${enc(q)}&page=${page}`, signal),
  movie: (_page, signal) => apiFetch('movie', signal),
  explore: (query, signal) => apiFetch(`explore?${query}`, signal),
  anime: (slug, signal) => apiFetch(`anime/${enc(slug)}`, signal),
  episode: (slug, signal) => apiFetch(`episode/${enc(slug)}`, signal),
  schedule: signal => apiFetch('schedule', signal),
  animeList: signal => apiFetch('anime-list', signal)
};
