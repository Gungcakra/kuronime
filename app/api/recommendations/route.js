import { getRecommendations, jsonRoute } from '@/lib/upstream';

export const GET = jsonRoute('recommendations', async () => ({ result: await getRecommendations() }));
