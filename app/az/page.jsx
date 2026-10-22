import { Suspense } from 'react';
import { AZSkeleton } from '@/components/Skeletons';
import AZ from '@/views/AZ';

export const metadata = { title: 'Daftar Anime A-Z' };

export default function Page() {
  return (
    <Suspense fallback={<AZSkeleton />}>
      <AZ />
    </Suspense>
  );
}
