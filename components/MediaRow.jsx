'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { MediaCard } from './MediaGrid';
import { ChevronLeft, ChevronRight } from './Icons';

// One horizontally scrolling shelf of posters, with arrow buttons on desktop
export default function MediaRow({ title, href, items }) {
  const track = useRef(null);
  const [edges, setEdges] = useState({ start: true, end: false });

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const update = () => setEdges({
      start: el.scrollLeft <= 4,
      end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4
    });
    update();
    el.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      el.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [items]);

  if (!items?.length) return null;
  const scroll = dir => {
    const el = track.current;
    el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: 'smooth' });
  };

  return (
    <section className="media-row">
      <div className="row-header">
        <h2 className="row-title">{title}</h2>
        {href && <Link className="see-all-link" href={href}>Lihat Semua <ChevronRight /></Link>}
      </div>
      <div className="row-viewport">
        {!edges.start && (
          <button className="row-arrow prev" onClick={() => scroll(-1)} aria-label="Geser kiri"><ChevronLeft /></button>
        )}
        <div className="row-track" ref={track}>
          {items.map(item => <MediaCard key={item.slug} item={item} />)}
        </div>
        {!edges.end && (
          <button className="row-arrow next" onClick={() => scroll(1)} aria-label="Geser kanan"><ChevronRight /></button>
        )}
      </div>
    </section>
  );
}

export function RowSkeleton({ count = 10 }) {
  return (
    <section className="media-row">
      <div className="row-header"><span className="title-skeleton" /></div>
      <div className="row-track">
        {Array.from({ length: count }, (_, i) => <div key={i} className="card-skeleton" />)}
      </div>
    </section>
  );
}
