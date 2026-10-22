import { Suspense } from 'react';
import { ExploreSkeleton } from '@/components/Skeletons';
import Explore from '@/views/Explore';

export const metadata = { title: 'Explore Anime' };

export default function Page() {
  return (
    <Suspense fallback={<ExploreSkeleton />}>
      <Explore />
    </Suspense>
  );
}
