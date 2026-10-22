import { getOngoing, jsonRoute } from '@/lib/upstream';

export const GET = jsonRoute('ongoing anime', async () => ({ result: await getOngoing({ full: true }) }));
