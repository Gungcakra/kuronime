import { Suspense } from 'react';
import { AnimeSkeleton } from '@/components/Skeletons';
import Anime from '@/views/Anime';

export const metadata = { title: 'Anime' };

export default function Page() {
  return (
    <Suspense fallback={<AnimeSkeleton />}>
      <Anime />
    </Suspense>
  );
}
