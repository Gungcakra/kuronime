'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import MediaGrid, { GridSkeleton } from '@/components/MediaGrid';
import Pagination from '@/components/Pagination';
import SectionHeader from '@/components/SectionHeader';
import { CloseIcon, FilterIcon, SearchIcon } from '@/components/Icons';
import { ExplorePanelSkeleton } from '@/components/Skeletons';
import { useFetch } from '@/hooks/useFetch';
import { api } from '@/lib/api';

const SORT_OPTIONS = [
  ['newest', 'Terbaru'],
  ['score', 'Skor tertinggi'],
  ['title', 'Judul A-Z'],
  ['episodes', 'Episode terbanyak'],
  ['oldest', 'Terlama']
];
const SCORE_OPTIONS = ['9', '8', '7', '6', '5'];
const GENRES_COLLAPSED = 18;
const POLL_MS = 1500;

// Facets don't change between queries; keep them across page/filter changes
let facetCache = null;

const sleep = (ms, signal) => new Promise((resolve, reject) => {
  const t = setTimeout(resolve, ms);
  signal.addEventListener('abort', () => {
    clearTimeout(t);
    reject(signal.reason);
  }, { once: true });
});

function Select({ label, value, onChange, children }) {
  return (
    <label className={`explore-select ${value ? 'set' : ''}`}>
      <span>{label}</span>
      <select value={value} onChange={e => onChange(e.target.value)}>{children}</select>
    </label>
  );
}

export default function Explore() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const q = params.get('q') || '';
  const genres = (params.get('genre') || '').split(',').filter(Boolean);
  const status = params.get('status') || '';
  const year = params.get('year') || '';
  const score = params.get('score') || '';
  const sort = params.get('sort') || 'newest';
  const page = Math.max(1, parseInt(params.get('page'), 10) || 1);

  const [qInput, setQInput] = useState(q);
  const [showAllGenres, setShowAllGenres] = useState(false);
  const [progress, setProgress] = useState(null);
  const timer = useRef(null);

  // Keep the input in sync when navigating via history
  useEffect(() => setQInput(q), [q]);
  useEffect(() => () => clearTimeout(timer.current), []);

  // Every change but paging goes back to page 1; the URL is the source of truth
  function update(patch) {
    const next = new URLSearchParams(params.toString());
    for (const [key, value] of Object.entries({ page: '', ...patch })) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    if (next.get('sort') === 'newest') next.delete('sort');
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  function handleQuery(e) {
    const value = e.target.value;
    setQInput(value);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => update({ q: value.trim() }), 350);
  }

  const toggleGenre = g =>
    update({ genre: (genres.includes(g) ? genres.filter(x => x !== g) : [...genres, g]).join(',') });

  const queryString = params.toString();
  const { data, loading, error, retry } = useFetch(async signal => {
    // The first request after a deploy kicks off the catalogue crawl
    for (;;) {
      const res = await api.explore(queryString, signal);
      if (!res.building) {
        setProgress(null);
        facetCache = res.facets;
        return res;
      }
      setProgress(res.progress);
      await sleep(POLL_MS, signal);
    }
  }, [queryString]);

  const facets = data?.facets || facetCache;
  const allGenres = facets?.genres || [];
  // Selected genres stay visible even when the list is collapsed
  const shownGenres = showAllGenres
    ? allGenres
    : allGenres.filter((g, i) => i < GENRES_COLLAPSED || genres.includes(g.name));

  const active = [
    q && { key: 'q', label: `"${q}"`, clear: () => update({ q: '' }) },
    ...genres.map(g => ({ key: `g-${g}`, label: g, clear: () => toggleGenre(g) })),
    status && { key: 'status', label: status, clear: () => update({ status: '' }) },
    year && { key: 'year', label: `Tahun ${year}`, clear: () => update({ year: '' }) },
    score && { key: 'score', label: `Skor ≥ ${score}`, clear: () => update({ score: '' }) }
  ].filter(Boolean);

  const hrefFor = n => {
    const next = new URLSearchParams(queryString);
    if (n > 1) next.set('page', String(n));
    else next.delete('page');
    const qs = next.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  };

  const pct = progress?.total ? Math.round((progress.done / progress.total) * 100) : 0;

  return (
    <>
      <SectionHeader
        title="Explore Anime"
        count={loading ? null : data?.total}
        countLabel={!loading && data ? `${data.total.toLocaleString('id-ID')} Anime` : undefined}
      />

      {!facets ? <ExplorePanelSkeleton /> : (
      <div className="explore-panel">
        <div className="explore-bar">
          <div className="explore-search">
            <SearchIcon />
            <input
              type="text"
              placeholder="Cari judul di seluruh katalog..."
              value={qInput}
              onChange={handleQuery}
              autoComplete="off"
            />
            {qInput && (
              <button onClick={() => { setQInput(''); update({ q: '' }); }} aria-label="Hapus kata kunci">
                <CloseIcon size={16} />
              </button>
            )}
          </div>

          <Select label="Status" value={status} onChange={v => update({ status: v })}>
            <option value="">Semua</option>
            {facets?.statuses.map(s => <option key={s.name} value={s.name}>{s.name} ({s.count})</option>)}
          </Select>
          <Select label="Tahun" value={year} onChange={v => update({ year: v })}>
            <option value="">Semua</option>
            {facets?.years.map(y => <option key={y.name} value={y.name}>{y.name} ({y.count})</option>)}
          </Select>
          <Select label="Skor" value={score} onChange={v => update({ score: v })}>
            <option value="">Semua</option>
            {SCORE_OPTIONS.map(s => <option key={s} value={s}>≥ {s}</option>)}
          </Select>
          <Select label="Urutkan" value={sort === 'newest' ? '' : sort} onChange={v => update({ sort: v })}>
            {SORT_OPTIONS.map(([value, label]) => <option key={value} value={value === 'newest' ? '' : value}>{label}</option>)}
          </Select>
        </div>

        {allGenres.length > 0 && (
          <div className="explore-genres">
            <span className="explore-label"><FilterIcon size={14} /> Genre</span>
            {shownGenres.map(g => (
              <button
                key={g.name}
                className={`genre-chip ${genres.includes(g.name) ? 'active' : ''}`}
                onClick={() => toggleGenre(g.name)}
                aria-pressed={genres.includes(g.name)}
              >
                {g.name}<small>{g.count}</small>
              </button>
            ))}
            {allGenres.length > GENRES_COLLAPSED && (
              <button className="genre-more" onClick={() => setShowAllGenres(s => !s)}>
                {showAllGenres ? 'Sembunyikan' : `+${allGenres.length - GENRES_COLLAPSED} lainnya`}
              </button>
            )}
          </div>
        )}

        {active.length > 0 && (
          <div className="explore-active">
            {active.map(f => (
              <span key={f.key} className="active-chip">
                {f.label}
                <button onClick={f.clear} aria-label={`Hapus filter ${f.label}`}><CloseIcon size={13} /></button>
              </span>
            ))}
            <button className="reset-link" onClick={() => router.replace(pathname, { scroll: false })}>Reset semua</button>
          </div>
        )}
      </div>
      )}

      {progress ? (
        <>
          <div className="catalog-building" role="status">
            <div className="catalog-building-text">
              <strong>Menyiapkan katalog lengkap…</strong>
              <span>{progress.done}/{progress.total || '?'} halaman · hanya sesekali, sekitar 10–30 detik</span>
            </div>
            <div className="progress-track"><div className="progress-fill" style={{ width: `${pct}%` }} /></div>
          </div>
          <GridSkeleton count={18} />
        </>
      ) : (
        <>
          <MediaGrid
            items={data?.result}
            loading={loading}
            error={error}
            onRetry={retry}
          />
          {!loading && !error && data && (
            <Pagination page={data.page} lastPage={data.totalPages} hrefFor={hrefFor} />
          )}
        </>
      )}
    </>
  );
}
