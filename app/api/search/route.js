import { jsonRoute, parsePage, searchAnime } from '@/lib/upstream';

export const GET = jsonRoute('search results', async params => {
  const q = (params.get('q') || params.get('keyword') || '').trim();
  if (!q) return Response.json({ error: 'Parameter "q" wajib diisi' }, { status: 400 });
  const page = parsePage(params);
  return { query: q, page, ...(await searchAnime(q, page)) };
});
