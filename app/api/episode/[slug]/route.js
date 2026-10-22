import { getEpisode, jsonRoute } from '@/lib/upstream';

export const GET = jsonRoute('episode streams', async (_, { params }) => getEpisode((await params).slug));
