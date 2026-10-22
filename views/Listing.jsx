'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import MediaGrid from '@/components/MediaGrid';
import Pagination from '@/components/Pagination';
import SectionHeader from '@/components/SectionHeader';
import { useFetch } from '@/hooks/useFetch';
import { api } from '@/lib/api';
import { LISTINGS } from '@/lib/utils';

// Upstream gives no total count, so an empty page marks the end and the
// pagination only ever offers one page beyond the current one. Unpaged
// listings come back whole.
export default function Listing({ slug }) {
  const listing = LISTINGS.find(l => l.slug === slug);
  const params = useSearchParams();
  const page = listing.paged ? Math.max(1, parseInt(params.get('page'), 10) || 1) : 1;

  const { data, loading, error, retry } = useFetch(signal => api[slug](page, signal), [slug, page]);
  const items = data?.result || [];
  const hrefFor = n => (n === 1 ? `/${slug}` : `/${slug}?page=${n}`);

  if (!loading && !error && page > 1 && !items.length) {
    return (
      <div className="empty-state">
        <div className="empty-icon">📄</div>
        <h3>Halaman {page} kosong</h3>
        <p>Sudah mencapai akhir daftar {listing.label}.</p>
        <Link className="btn-primary" href={hrefFor(page - 1)}>Ke halaman sebelumnya</Link>
      </div>
    );
  }

  return (
    <>
      <SectionHeader
        title={listing.title}
        count={loading ? null : items.length}
        countLabel={listing.paged && !loading ? `Halaman ${page}` : undefined}
      />
      <MediaGrid items={items} loading={loading} error={error} onRetry={retry} />
      {listing.paged && !loading && !error && (
        <Pagination page={page} lastPage={page} hasMore={items.length > 0} hrefFor={hrefFor} />
      )}
    </>
  );
}
