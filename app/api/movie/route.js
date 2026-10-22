import { getMovies, jsonRoute } from '@/lib/upstream';

export const GET = jsonRoute('movies', async () => ({ result: await getMovies() }));
