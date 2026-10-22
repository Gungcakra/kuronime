import { getAnimeList, jsonRoute } from '@/lib/upstream';

export const GET = jsonRoute('anime list', async () => ({ data: await getAnimeList() }));
