import { getAnimeDetail, jsonRoute } from '@/lib/upstream';

export const GET = jsonRoute('anime details', async (_, { params }) => getAnimeDetail((await params).slug));
