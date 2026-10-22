import { getLatest, getMovies, getOngoing, getRecommendations, getSchedule, jsonRoute } from '@/lib/upstream';

export const GET = jsonRoute('home', async () => {
  const [recommended, ongoing, latest, schedule, movies] = await Promise.all([
    getRecommendations(),
    getOngoing(),
    getLatest(1),
    // The home page still works without the schedule strip
    getSchedule().catch(() => []),
    getMovies().catch(() => [])
  ]);
  return { recommended, ongoing, latest, movies, today: schedule[0] || null };
});
