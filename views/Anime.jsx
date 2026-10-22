'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { AnimeSkeleton } from '@/components/Skeletons';
import ErrorBox from '@/components/ErrorBox';
import BookmarkButton from '@/components/BookmarkButton';
import { PlayIcon, SearchIcon } from '@/components/Icons';
import { useFetch } from '@/hooks/useFetch';
import { api } from '@/lib/api';
import { episodeLabel, episodeRanges, formatViews, formatViewsShort, proxyImage, statusClass, watchHref } from '@/lib/utils';

const FACTS = [
  ['type', 'Tipe'],
  ['status', 'Status'],
  ['rating', 'Skor'],
  ['published', 'Tayang'],
  ['studio', 'Studio']
];
const RANGE_SIZE = 100;
const SYNOPSIS_CLAMP = 320;

export default function Anime() {
  const { slug } = useParams();
  const animeSlug = decodeURIComponent(slug);
  const { data: anime, loading, error, retry } = useFetch(signal => api.anime(animeSlug, signal), [animeSlug]);
  const [oldestFirst, setOldestFirst] = useState(false);
  const [filter, setFilter] = useState('');
  const [rangeIdx, setRangeIdx] = useState(0);
  const [synopsisOpen, setSynopsisOpen] = useState(false);

  const ordered = useMemo(() => {
    const list = anime?.episodes || [];
    return oldestFirst ? [...list].reverse() : list;
  }, [anime, oldestFirst]);

  const ranges = useMemo(() => episodeRanges(ordered, RANGE_SIZE), [ordered]);
  const f = filter.trim().toLowerCase();
  // A search looks through every episode; otherwise show the picked range
  const episodes = f
    ? ordered.filter(ep => ep.number.toLowerCase().includes(f))
    : ranges[Math.min(rangeIdx, ranges.length - 1)]?.items || [];

  if (loading) return <AnimeSkeleton />;
  if (error || !anime?.slug) {
    return <ErrorBox message="Gagal memuat anime" error={error || { message: 'Data tidak ditemukan' }} onRetry={retry} />;
  }

  const cover = proxyImage(anime.cover);
  const all = anime.episodes;
  const first = all[all.length - 1];
  const latest = all[0];
  const synopsis = anime.synopsis || 'Sinopsis tidak tersedia.';
  const longSynopsis = synopsis.length > SYNOPSIS_CLAMP;
  const meta = [
    anime.rating && <span key="r" className="detail-score">★ {anime.rating}</span>,
    anime.type && <span key="t">{anime.type}</span>,
    anime.published && <span key="p">{anime.published}</span>,
    all.length > 0 && <span key="e">{all.length} Episode</span>
  ].filter(Boolean);

  return (
    <article className="detail-page">
      <div className="detail-hero" aria-hidden="true">
        <div className="detail-backdrop" style={{ backgroundImage: `url('${cover}')` }} />
        <div className="detail-gradient" />
      </div>

      <div className="detail-content">
        <header className="detail-head">
          <img className="detail-poster" src={cover} alt={anime.title} />
          <div className="detail-info">
            {anime.status && <span className={`detail-status ${statusClass(anime.status)}`}>{anime.status}</span>}
            <h1 className="detail-title">{anime.title}</h1>
            {meta.length > 0 && <div className="detail-meta">{meta}</div>}

            <div className="detail-actions">
              {first ? (
                <Link className="btn-primary btn-pill" href={watchHref(first.slug, anime.slug)}>
                  <PlayIcon /> Tonton {episodeLabel(first.number)}
                </Link>
              ) : (
                <span className="btn-glass btn-pill is-disabled">Belum ada episode</span>
              )}
              {latest && latest !== first && (
                <Link className="btn-glass btn-pill" href={watchHref(latest.slug, anime.slug)}>
                  Terbaru · Ep {latest.number}
                </Link>
              )}
              <BookmarkButton entry={{ kind: 'anime', id: anime.slug, title: anime.title, image: anime.cover, meta: [anime.type, anime.status].filter(Boolean).join(' · ') }} />
            </div>

            {anime.genres.length > 0 && (
              <div className="detail-genres">
                {anime.genres.map(g => (
                  <Link key={g} href={`/explore?genre=${encodeURIComponent(g)}`} className="detail-genre">{g}</Link>
                ))}
              </div>
            )}

            <p className={`detail-synopsis ${longSynopsis && !synopsisOpen ? 'clamped' : ''}`}>{synopsis}</p>
            {longSynopsis && (
              <button className="text-toggle" onClick={() => setSynopsisOpen(o => !o)}>
                {synopsisOpen ? 'Tutup' : 'Selengkapnya'}
              </button>
            )}
          </div>
        </header>

        <dl className="detail-facts">
          {FACTS.filter(([key]) => anime[key]).map(([key, label]) => (
            <div key={key}>
              <dt>{label}</dt>
              <dd>{anime[key]}</dd>
            </div>
          ))}
        </dl>

        <section className="detail-episodes">
          <div className="section-bar">
            <h2>Episode <span>{all.length}</span></h2>
            {all.length > 1 && (
              <div className="section-tools">
                <label className="pill-input">
                  <SearchIcon />
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="Cari episode"
                    value={filter}
                    onChange={e => setFilter(e.target.value)}
                  />
                </label>
                <button className="pill-btn" onClick={() => { setOldestFirst(o => !o); setRangeIdx(0); }}>
                  {oldestFirst ? 'Terlama ↑' : 'Terbaru ↓'}
                </button>
              </div>
            )}
          </div>

          {!f && ranges.length > 1 && (
            <div className="range-tabs" role="tablist">
              {ranges.map((r, i) => (
                <button
                  key={r.label}
                  role="tab"
                  aria-selected={i === rangeIdx}
                  className={`range-tab ${i === rangeIdx ? 'active' : ''}`}
                  onClick={() => setRangeIdx(i)}
                >
                  {r.label}
                </button>
              ))}
            </div>
          )}

          {episodes.length ? (
            <div className="ep-grid">
              {episodes.map(ep => (
                <Link key={ep.slug} href={watchHref(ep.slug, anime.slug)} className="ep-tile" title={[ep.date, formatViews(ep.views)].filter(Boolean).join(' · ')}>
                  {ep === latest && all.length > 1 && <span className="ep-new">Baru</span>}
                  <span className="ep-tile-label">Episode</span>
                  <strong className="ep-tile-num">{ep.number}</strong>
                  {ep.date && <span className="ep-tile-meta">{ep.date}</span>}
                  {ep.views > 0 && <span className="ep-tile-views">{formatViewsShort(ep.views)}</span>}
                  <span className="ep-tile-play"><PlayIcon size={14} /></span>
                </Link>
              ))}
            </div>
          ) : <p className="dim-note">{all.length ? 'Episode tidak ditemukan.' : 'Belum ada episode.'}</p>}
        </section>
      </div>
    </article>
  );
}
