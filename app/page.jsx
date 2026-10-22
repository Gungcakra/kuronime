import { Suspense } from 'react';
import { HomeSkeleton } from '@/components/Skeletons';
import Home from '@/views/Home';


export default function Page() {
  return (
    <Suspense fallback={<HomeSkeleton />}>
      <Home />
    </Suspense>
  );
}
