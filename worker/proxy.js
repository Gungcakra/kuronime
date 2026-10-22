// Cloudflare Worker that relays Kuronime's API calls to the upstream anime API.
// The upstream blocks datacenter IPs (Vercel runs on AWS), so the Next.js routes
// call this Worker instead via API_BASE_URL. Cloudflare's egress IP is allowed,
// so the request goes through.
//
//   https://<worker>.workers.dev/search.php?keyword=a&page=1
//     -> <UPSTREAM_BASE>/search.php?keyword=a&page=1
//
// Set the PROXY_TOKEN secret to require a matching X-Proxy-Token header so the
// Worker isn't an open relay. Kuronime sends it from API_PROXY_TOKEN.
// UPSTREAM_BASE is a secret too, so the real API host stays out of the repo.

// Upstream answers 403 to anything that doesn't look like the Flutter app
const UPSTREAM_HEADERS = {
  'User-Agent': 'Dart/3.4 (dart:io)',
  Accept: 'application/json, text/plain, */*'
};

const json = (body, status) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

export default {
  async fetch(request, env) {
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return json({ error: 'Method not allowed' }, 405);
    }
    if (env.PROXY_TOKEN && request.headers.get('X-Proxy-Token') !== env.PROXY_TOKEN) {
      return json({ error: 'Forbidden' }, 403);
    }

    const url = new URL(request.url);
    // Endpoint paths like "search.php" or "home/ongoing.php" - no "..", no other files
    const endpoint = url.pathname.replace(/^\/+/, '');
    if (!/^(?:[\w-]+\/)*[\w-]+\.php$/.test(endpoint)) {
      return json({ error: 'Unknown endpoint' }, 404);
    }

    if (!env.UPSTREAM_BASE) return json({ error: 'UPSTREAM_BASE is not configured' }, 500);
    const base = env.UPSTREAM_BASE.replace(/\/+$/, '');
    const upstream = await fetch(`${base}/${endpoint}${url.search}`, {
      method: request.method,
      headers: UPSTREAM_HEADERS
    });

    // Pass the body and status through untouched; Kuronime handles both
    const headers = new Headers({
      'Content-Type': upstream.headers.get('Content-Type') || 'application/json',
      'Cache-Control': 'no-store'
    });
    return new Response(upstream.body, { status: upstream.status, headers });
  }
};
