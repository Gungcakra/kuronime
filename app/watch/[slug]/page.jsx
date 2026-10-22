import { Suspense } from 'react';
import { WatchSkeleton } from '@/components/Skeletons';
import Watch from '@/views/Watch';

export const metadata = { title: 'Tonton' };

export default function Page() {
  return (
    <Suspense fallback={<WatchSkeleton />}>
      <Watch />
    </Suspense>
  );
}
