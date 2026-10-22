'use client';

import Link from 'next/link';
import ErrorBox from './ErrorBox';
import { PlayIcon } from './Icons';
import { animeHref, proxyImage, statusClass } from '@/lib/utils';

export function GridSkeleton({ count = 12 }) {
  return (
    <section className="media-grid">
      {Array.from({ length: count }, (_, i) => <div key={i} className="card-skeleton" />)}
    </section>
  );
}

export function MediaCard({ item }) {
  const badge = item.episode || item.status;
  const score = item.score && item.score !== 'N/A' ? item.score : '';
  const meta = item.updated || (item.episode ? item.status : '');
  return (
    <Link href={animeHref(item.slug)} className="media-card">
      <div className="card-poster-wrap">
        {badge && <span className={`card-badge ${statusClass(item.status)}`}>{badge}</span>}
        {score && <span className="card-score">★ {score}</span>}
        <img className="card-poster" src={proxyImage(item.cover)} alt={item.title} loading="lazy" />
        <div className="card-play-overlay">
          <div className="play-circle"><PlayIcon size={20} /></div>
        </div>
      </div>
      <div className="card-info">
        <h3 className="card-title" title={item.title}>{item.title}</h3>
        {meta && <div className="card-meta"><span>{meta}</span></div>}
      </div>
    </Link>
  );
}

export default function MediaGrid({ items, loading, error, onRetry, onReset }) {
  if (loading) return <GridSkeleton />;
  if (error) {
    return <ErrorBox message="Gagal memuat konten" error={error} onRetry={onRetry} />;
  }
  if (!items?.length) {
    return (
      <div className="empty-state">
        <div className="empty-icon">📺</div>
        <h3>Tidak ada anime ditemukan</h3>
        <p>Coba gunakan kata kunci lain atau buka daftar A-Z.</p>
        {onReset && <button className="btn-primary" onClick={onReset}>Kembali ke Beranda</button>}
      </div>
    );
  }
  return (
    <section className="media-grid">
      {items.map(item => <MediaCard key={item.slug} item={item} />)}
    </section>
  );
}
