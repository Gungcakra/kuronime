'use client';

import HeroCarousel from '@/components/HeroCarousel';
import MediaRow from '@/components/MediaRow';
import { HomeSkeleton } from '@/components/Skeletons';
import ErrorBox from '@/components/ErrorBox';
import { useFetch } from '@/hooks/useFetch';
import { api } from '@/lib/api';

const ROW_SIZE = 20;

let homeCache = null;

function loadHome(signal) {
  if (homeCache && Date.now() - homeCache.at < 60_000) return Promise.resolve(homeCache.data);
  return api.home(signal).then(data => {
    homeCache = { at: Date.now(), data };
    return data;
  });
}

export default function Home() {
  const { data, loading, error, retry } = useFetch(loadHome, []);

  if (loading) return <HomeSkeleton />;
  if (error) return <ErrorBox message="Gagal memuat konten" error={error} onRetry={retry} />;

  const top = items => items?.slice(0, ROW_SIZE);

  return (
    <>
      <HeroCarousel items={(data.recommended || []).slice(0, 8)} />
      <div className="home-rows">
        <MediaRow title="Sedang Tayang" href="/ongoing" items={top(data.ongoing)} />
        <MediaRow title={`Jadwal Hari Ini${data.today ? ` · ${data.today.day}` : ''}`} href="/schedule" items={top(data.today?.anime)} />
        <MediaRow title="Baru Diupload" href="/latest" items={top(data.latest)} />
        <MediaRow title="Anime Movie" href="/movie" items={top(data.movies)} />
        <MediaRow title="Rekomendasi Lainnya" items={(data.recommended || []).slice(8)} />
      </div>
    </>
  );
}
