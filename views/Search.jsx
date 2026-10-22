'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import MediaGrid from '@/components/MediaGrid';
import Pagination from '@/components/Pagination';
import SectionHeader from '@/components/SectionHeader';
import { useFetch } from '@/hooks/useFetch';
import { api } from '@/lib/api';

export default function Search() {
  const router = useRouter();
  const params = useSearchParams();
  const q = params.get('q') || '';
  const page = Math.max(1, parseInt(params.get('page'), 10) || 1);

  const { data, loading, error, retry } = useFetch(
    signal => (q ? api.search(q, page, signal) : Promise.resolve({ result: [], total: 0, totalPages: 1 })),
    [q, page]
  );
  const items = data?.result || [];
  const hrefFor = n => `/search?q=${encodeURIComponent(q)}${n > 1 ? `&page=${n}` : ''}`;

  return (
    <>
      <SectionHeader
        title={`Hasil Pencarian untuk "${q}"`}
        count={loading ? null : data.total}
        countLabel={!loading && data.totalPages > 1 ? `${data.total} Anime · Hal. ${page}/${data.totalPages}` : undefined}
        filterLabel={`Pencarian: "${q}"`}
        onClearFilter={() => router.push('/')}
      />
      {q && (
        <p className="search-explore-hint">
          Mau saring berdasarkan genre, status, atau tahun?{' '}
          <Link href={`/explore?q=${encodeURIComponent(q)}`}>Buka di Explore →</Link>
        </p>
      )}
      <MediaGrid items={items} loading={loading} error={error} onRetry={retry} onReset={() => router.push('/')} />
      {!loading && !error && (
        <Pagination page={page} lastPage={data.totalPages} hrefFor={hrefFor} />
      )}
    </>
  );
}
