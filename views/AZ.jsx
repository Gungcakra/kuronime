'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { AZSkeleton } from '@/components/Skeletons';
import ErrorBox from '@/components/ErrorBox';
import SectionHeader from '@/components/SectionHeader';
import { useFetch } from '@/hooks/useFetch';
import { api } from '@/lib/api';
import { animeHref } from '@/lib/utils';

export default function AZ() {
  const { data, loading, error, retry } = useFetch(signal => api.animeList(signal), []);
  const [letter, setLetter] = useState(null);
  const [filter, setFilter] = useState('');

  const groups = useMemo(() => data?.data || [], [data]);
  const total = useMemo(() => groups.reduce((n, g) => n + g.anime.length, 0), [groups]);

  const visible = useMemo(() => {
    const f = filter.trim().toLowerCase();
    if (f) {
      return groups
        .map(g => ({ ...g, anime: g.anime.filter(a => a.title.toLowerCase().includes(f)) }))
        .filter(g => g.anime.length);
    }
    return groups.filter(g => g.letter === (letter ?? groups[0]?.letter));
  }, [groups, letter, filter]);

  if (loading) return <AZSkeleton />;
  if (error) return <ErrorBox message="Gagal memuat daftar anime" error={error} onRetry={retry} />;

  const activeLetter = filter ? null : letter ?? groups[0]?.letter;

  return (
    <>
      <SectionHeader title="Daftar Anime A-Z" countLabel={`${total.toLocaleString('id-ID')} Anime`} />
      <div className="az-filter">
        <input type="text" placeholder="Filter judul di semua huruf..." value={filter} onChange={e => setFilter(e.target.value)} />
      </div>
      <div className="day-tabs az-letters">
        {groups.map(g => (
          <button
            key={g.letter}
            className={`day-tab ${g.letter === activeLetter ? 'active' : ''}`}
            onClick={() => { setFilter(''); setLetter(g.letter); }}
          >
            {g.letter}
          </button>
        ))}
      </div>
      {visible.map(g => (
        <section key={g.letter} className="az-group">
          <h2 className="az-letter">{g.letter} <small>({g.anime.length})</small></h2>
          <ul className="az-list">
            {g.anime.map(a => (
              <li key={a.slug}><Link href={animeHref(a.slug)}>{a.title}</Link></li>
            ))}
          </ul>
        </section>
      ))}
      {!visible.length && <p className="dim-note">Tidak ada judul yang cocok.</p>}
    </>
  );
}
