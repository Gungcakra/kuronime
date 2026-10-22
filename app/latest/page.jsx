import { Suspense } from 'react';
import { ListingSkeleton } from '@/components/Skeletons';
import Listing from '@/views/Listing';

export const metadata = { title: 'Baru Diupload' };

export default function Page() {
  return (
    <Suspense fallback={<ListingSkeleton />}>
      <Listing slug="latest" />
    </Suspense>
  );
}
