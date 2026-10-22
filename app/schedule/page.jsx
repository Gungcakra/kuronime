import { Suspense } from 'react';
import { ScheduleSkeleton } from '@/components/Skeletons';
import Schedule from '@/views/Schedule';

export const metadata = { title: 'Jadwal Rilis' };

export default function Page() {
  return (
    <Suspense fallback={<ScheduleSkeleton />}>
      <Schedule />
    </Suspense>
  );
}
