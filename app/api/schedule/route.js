import { getSchedule, jsonRoute } from '@/lib/upstream';

export const GET = jsonRoute('schedule', async () => ({ data: await getSchedule() }));
