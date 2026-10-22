import { getLatest, jsonRoute, parsePage } from '@/lib/upstream';

export const GET = jsonRoute('latest anime', async params => {
  const page = parsePage(params);
  return { page, result: await getLatest(page) };
});
