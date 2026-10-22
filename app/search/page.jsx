import { Suspense } from 'react';
import { ListingSkeleton } from '@/components/Skeletons';
import Search from '@/views/Search';

export const metadata = { title: 'Pencarian' };

export default function Page() {
  return (
    <Suspense fallback={<ListingSkeleton />}>
      <Search />
    </Suspense>
  );
}
