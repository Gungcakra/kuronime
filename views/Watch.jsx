'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { WatchSkeleton } from '@/components/Skeletons';
import ErrorBox from '@/components/ErrorBox';
import VideoPlayer from '@/components/VideoPlayer';
import { ChevronLeft, ChevronRight, DownloadIcon, ExternalIcon, SearchIcon } from '@/components/Icons';
import { useFetch } from '@/hooks/useFetch';
import { api } from '@/lib/api';
import { animeHref, episodeLabel, formatSize, formatViews, proxyImage, qualityTier, watchHref } from '@/lib/utils';

const QUALITY_KEY = 'kuronime_quality';

function savedQuality() {
  try {
    return localStorage.getItem(QUALITY_KEY);
  } catch {
    return null;
  }
}

export default function Watch() {
  const router = useRouter();
  const { slug } = useParams();
  const episodeSlug = decodeURIComponent(slug);
  const animeSlug = useSearchParams().get('anime') || '';

  const { data: episode, loading, error, retry } = useFetch(signal => api.episode(episodeSlug, signal), [episodeSlug]);
  // The episode endpoint knows nothing about its anime; the list comes from the anime page link
  const { data: anime } = useFetch(
    signal => (animeSlug ? api.anime(animeSlug, signal) : Promise.resolve(null)),
    [animeSlug]
  );

  const sources = useMemo(() => episode?.sources || [], [episode]);
  // Mirrors of the same resolution become one card
  const downloadGroups = useMemo(() => {
    const map = new Map();
    for (const s of sources) {
      if (!map.has(s.quality)) {
        map.set(s.quality, { quality: s.quality, tier: qualityTier(s.quality), size: formatSize(s.sizeKb), mirrors: [] });
      }
      map.get(s.quality).mirrors.push(s);
    }
    return [...map.values()];
  }, [sources]);
  // The pick is tied to the sources it was made for, so a stale id from the
  // previous episode is never used.
  const [picked, setPicked] = useState({ sources: null, id: null });
  const preferred = sources.find(s => s.quality === savedQuality()) || sources[0];
  const active = (picked.sources === sources && sources.find(s => s.id === picked.id)) || preferred;

  function pick(source) {
    setPicked({ sources, id: source.id });
    try {
      localStorage.setItem(QUALITY_KEY, source.quality);
    } catch {
      // storage unavailable - the pick still applies to this episode
    }
  }

  // Braces matter: scrollTo returns a Promise in newer browsers, and an
  // effect must return nothing or a cleanup function
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [episodeSlug]);

  const [epFilter, setEpFilter] = useState('');
  const [synopsisOpen, setSynopsisOpen] = useState(false);
  const listRef = useRef(null);
  const activeRef = useRef(null);

  // Bring the playing episode into view inside the list (not the page)
  useEffect(() => {
    const list = listRef.current;
    const item = activeRef.current;
    if (list && item) list.scrollTop = item.offsetTop - list.offsetTop - list.clientHeight / 2 + item.clientHeight / 2;
  }, [anime, episodeSlug]);

  if (loading) return <WatchSkeleton />;
  if (error) return <ErrorBox message="Gagal memuat episode" error={error} onRetry={retry} />;

  // Episodes are newest-first, so "next" is the entry before this one
  const episodes = anime?.episodes || [];
  const idx = episodes.findIndex(ep => ep.slug === episodeSlug);
  const current = episodes[idx];
  const prev = idx >= 0 ? episodes[idx + 1] : null;
  const next = idx > 0 ? episodes[idx - 1] : null;
  const cover = anime ? proxyImage(anime.cover) : null;
  const f = epFilter.trim().toLowerCase();
  // Oldest first reads naturally in a playlist
  const playlist = [...episodes].reverse().filter(ep => !f || ep.number.toLowerCase().includes(f));
  const meta = [current?.date, formatViews(current?.views)].filter(Boolean);

  return (
    <article className={`watch ${anime ? '' : 'solo'}`}>
      {cover && <div className="watch-ambient" style={{ '--cover': `url('${cover}')` }} aria-hidden="true" />}
      <div className="watch-frame">
        {active ? (
          <VideoPlayer
            key={episodeSlug}
            sources={sources}
            activeId={active.id}
            onSelectSource={pick}
            poster={cover || undefined}
            onNext={next ? () => router.push(watchHref(next.slug, anime.slug)) : null}
            nextLabel={next ? episodeLabel(next.number) : null}
          />
        ) : (
          <div className="player-container">
            <div className="player-loading"><span>Belum ada link video untuk episode ini.</span></div>
          </div>
        )}
      </div>

      <div className="watch-main">
        <div className="watch-bar">
          <div className="watch-heading">
            {anime && <Link className="watch-kicker" href={animeHref(anime.slug)}>{anime.title}</Link>}
            <h1 className="watch-title">{anime ? episodeLabel(current?.number) : episodeSlug}</h1>
            {meta.length > 0 && <div className="watch-meta">{meta.map(m => <span key={m}>{m}</span>)}</div>}
          </div>
          <div className="watch-actions">
            {prev && (
              <Link className="pill-btn" href={watchHref(prev.slug, anime.slug)} title={episodeLabel(prev.number)}>
                <ChevronLeft /> Ep {prev.number}
              </Link>
            )}
            {next && (
              <Link className="btn-primary btn-pill" href={watchHref(next.slug, anime.slug)} title={episodeLabel(next.number)}>
                Ep {next.number} <ChevronRight />
              </Link>
            )}
            {active && (
              <a href={active.url} target="_blank" rel="noopener noreferrer" className="icon-pill" title="Buka video di tab baru" aria-label="Buka video di tab baru">
                <ExternalIcon size={16} />
              </a>
            )}
          </div>
        </div>

        {anime && (
          <section className="watch-about">
            <Link href={animeHref(anime.slug)} className="watch-about-cover">
              <img src={cover} alt={anime.title} loading="lazy" />
            </Link>
            <div className="watch-about-body">
              <Link href={animeHref(anime.slug)} className="watch-about-title">{anime.title}</Link>
              <div className="detail-meta">
                {anime.rating && <span className="detail-score">★ {anime.rating}</span>}
                {anime.type && <span>{anime.type}</span>}
                {anime.status && <span>{anime.status}</span>}
                <span>{episodes.length} Episode</span>
              </div>
              {anime.genres.length > 0 && (
                <div className="detail-genres">
                  {anime.genres.map(g => (
                    <Link key={g} href={`/explore?genre=${encodeURIComponent(g)}`} className="detail-genre">{g}</Link>
                  ))}
                </div>
              )}
              <p className={`detail-synopsis ${synopsisOpen ? '' : 'clamped short'}`}>{anime.synopsis || 'Sinopsis tidak tersedia.'}</p>
              {anime.synopsis?.length > 180 && (
                <button className="text-toggle" onClick={() => setSynopsisOpen(o => !o)}>{synopsisOpen ? 'Tutup' : 'Selengkapnya'}</button>
              )}
            </div>
          </section>
        )}

        {sources.length > 0 && (
          <section className="watch-section">
            <h2 className="watch-section-title"><DownloadIcon /> Unduh Episode</h2>
            <div className="dl-grid">
              {downloadGroups.map(g => (
                <div key={g.quality} className="dl-card">
                  <div className="dl-card-top">
                    <span className="dl-card-res">{g.quality}</span>
                    <span className="dl-card-size">{g.size || 'MP4'}</span>
                  </div>
                  {g.tier && <span className="dl-card-tier">{g.tier}</span>}
                  <div className="dl-card-links">
                    {g.mirrors.map((m, i) => (
                      <a
                        key={m.id}
                        href={m.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        download
                        className={`dl-btn ${i === 0 ? 'primary' : ''}`}
                      >
                        <DownloadIcon size={15} />
                        {g.mirrors.length > 1 ? `Server ${i + 1}` : 'Unduh'}
                      </a>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {active && (
          <p className="watch-shortcuts">
            Shortcut: <kbd>Spasi</kbd> putar/jeda · <kbd>J</kbd>/<kbd>L</kbd> ±10 dtk · <kbd>←</kbd>/<kbd>→</kbd> ±5 dtk · <kbd>M</kbd> bisu · <kbd>F</kbd> layar penuh
          </p>
        )}
      </div>

      {anime && episodes.length > 0 && (
        <aside className="watch-side">
          <div className="side-head">
            <h2>Daftar Episode <span>{episodes.length}</span></h2>
            {episodes.length > 12 && (
              <label className="pill-input">
                <SearchIcon />
                <input type="text" inputMode="numeric" placeholder="Cari" value={epFilter} onChange={e => setEpFilter(e.target.value)} />
              </label>
            )}
          </div>
          <div className="side-list" ref={listRef}>
            {playlist.map(ep => {
              const isActive = ep.slug === episodeSlug;
              return (
                <Link
                  key={ep.slug}
                  ref={isActive ? activeRef : null}
                  href={watchHref(ep.slug, anime.slug)}
                  className={`side-ep ${isActive ? 'active' : ''}`}
                  aria-current={isActive ? 'true' : undefined}
                >
                  <span className="side-ep-num">{ep.number}</span>
                  <span className="side-ep-text">
                    <strong>{episodeLabel(ep.number)}</strong>
                    <small>{isActive ? 'Sedang diputar' : [ep.date, formatViews(ep.views)].filter(Boolean).join(' · ')}</small>
                  </span>
                  {isActive && <span className="side-ep-eq" aria-hidden="true"><i /><i /><i /></span>}
                </Link>
              );
            })}
            {!playlist.length && <p className="dim-note">Episode tidak ditemukan.</p>}
          </div>
        </aside>
      )}
    </article>
  );
}
