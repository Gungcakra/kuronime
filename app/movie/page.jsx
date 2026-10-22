import { Suspense } from 'react';
import { ListingSkeleton } from '@/components/Skeletons';
import Listing from '@/views/Listing';

export const metadata = { title: 'Anime Movie' };

export default function Page() {
  return (
    <Suspense fallback={<ListingSkeleton />}>
      <Listing slug="movie" />
    </Suspense>
  );
}
