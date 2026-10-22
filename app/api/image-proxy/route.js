import { UPSTREAM_HEADERS, parseHttpUrl } from '@/lib/upstream';

// Proxies cover images to bypass hotlink / referrer protection. A page asks for
// dozens of covers at once and the image hosts (AniList, MAL) rate-limit bursts,
// so every layer caches:
//   1. Vercel CDN       - Cache-Control s-maxage, repeat views never reach here
//   2. Next data cache  - shared by all function instances, survives cold starts
//   3. In-flight map    - concurrent requests for one cover share a single fetch
// and only a few covers are fetched from the hosts at the same time.

const DATA_CACHE_SECONDS = 60 * 60 * 24 * 30;
const MAX_CONCURRENT = 6;
const ATTEMPTS = 3;
const CACHE_HEADER = 'public, max-age=86400, s-maxage=2592000, stale-while-revalidate=86400, immutable';

const inFlight = new Map();
let active = 0;
const queue = [];

async function limited(task) {
  if (active >= MAX_CONCURRENT) await new Promise(resolve => queue.push(resolve));
  active++;
  try {
    return await task();
  } finally {
    active--;
    queue.shift()?.();
  }
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

// Body included, so a slot is held until the whole image has arrived
const download = url =>
  limited(async () => {
    const res = await fetch(url, {
      headers: { ...UPSTREAM_HEADERS, Accept: 'image/*,*/*' },
      signal: AbortSignal.timeout(8000),
      next: { revalidate: DATA_CACHE_SECONDS }
    });
    const type = res.headers.get('content-type') || '';
    if (res.ok && type.startsWith('image/')) return { ok: true, type, body: await res.arrayBuffer() };
    await res.body?.cancel();
    return { ok: false, status: res.ok ? 415 : res.status, retryAfter: Number(res.headers.get('retry-after')) };
  });

async function fetchImage(url) {
  for (let attempt = 1; ; attempt++) {
    const result = await download(url);
    if (result.ok) return result;
    // Rate limits and host hiccups are worth another try; anything else isn't
    const retryable = result.status === 429 || result.status >= 500;
    if (!retryable || attempt >= ATTEMPTS) throw new Error(`Image host responded ${result.status}`);
    await sleep(Math.min(result.retryAfter * 1000 || 400 * 2 ** attempt, 3000));
  }
}

function loadImage(url) {
  let pending = inFlight.get(url);
  if (!pending) {
    pending = fetchImage(url).finally(() => inFlight.delete(url));
    inFlight.set(url, pending);
  }
  return pending;
}

export async function GET(request) {
  const target = parseHttpUrl(new URL(request.url).searchParams.get('url'));
  if (!target) return new Response('Invalid url parameter', { status: 400 });

  try {
    const { type, body } = await loadImage(target.href);
    return new Response(body, { headers: { 'Content-Type': type, 'Cache-Control': CACHE_HEADER } });
  } catch {
    // Still failing: let the browser load the cover straight from the host
    // rather than show a broken image, and don't cache the redirect
    return new Response(null, {
      status: 302,
      headers: { Location: target.href, 'Cache-Control': 'no-store' }
    });
  }
}
