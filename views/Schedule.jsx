'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ScheduleSkeleton } from '@/components/Skeletons';
import ErrorBox from '@/components/ErrorBox';
import { ClockIcon } from '@/components/Icons';
import SectionHeader from '@/components/SectionHeader';
import { useFetch } from '@/hooks/useFetch';
import { api } from '@/lib/api';
import { animeHref, formatTime, proxyImage } from '@/lib/utils';

const isToday = unixSeconds =>
  !!unixSeconds && new Date(unixSeconds * 1000).toDateString() === new Date().toDateString();

export default function Schedule() {
  const { data, loading, error, retry } = useFetch(signal => api.schedule(signal), []);
  const [dayIdx, setDayIdx] = useState(0);

  if (loading) return <ScheduleSkeleton />;
  if (error) return <ErrorBox message="Gagal memuat jadwal" error={error} onRetry={retry} />;

  const days = data?.data || [];
  const day = days[dayIdx] || days[0];

  return (
    <>
      <SectionHeader title="Jadwal Rilis" countLabel={day ? `${day.anime.length} Anime` : '-'} />
      <div className="day-tabs schedule-days">
        {days.map((d, i) => (
          <button key={`${d.day}-${d.date}`} className={`day-tab ${d === day ? 'active' : ''}`} onClick={() => setDayIdx(i)}>
            <span>{d.day}</span>
            <small>{d.date}</small>
            {/* Extra detail only the wide desktop tabs have room for */}
            <em className="day-tab-meta">
              {isToday(d.timestamp) && <b>Hari ini</b>}
              {d.anime.length} anime
            </em>
          </button>
        ))}
      </div>
      {day?.anime.length ? (
        <div className="schedule-list">
          {day.anime.map(a => (
            <Link key={a.slug} href={animeHref(a.slug)} className="schedule-item" title={a.title}>
              <span className="schedule-cover"><img src={proxyImage(a.cover)} alt="" loading="lazy" /></span>
              <div className="schedule-title">{a.title}</div>
              {a.uploadedAt && (
                <span className="schedule-time"><ClockIcon size={12} />Update {formatTime(a.uploadedAt)}</span>
              )}
            </Link>
          ))}
        </div>
      ) : <p className="dim-note">Tidak ada jadwal untuk hari ini.</p>}
    </>
  );
}
