'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, InfoIcon, PlayIcon } from './Icons';
import { animeHref, proxyImage } from '@/lib/utils';

const INTERVAL = 6500;

export default function HeroCarousel({ items }) {
  const [index, setIndex] = useState(0);
  const total = items.length;

  // Restart the timer whenever the slide changes (manual or automatic)
  useEffect(() => {
    if (total < 2) return;
    const t = setTimeout(() => setIndex(i => (i + 1) % total), INTERVAL);
    return () => clearTimeout(t);
  }, [index, total]);

  if (!total) return null;
  const go = n => setIndex((n + total) % total);

  return (
    <section className="hero-carousel">
      <div className="carousel-container">
        {items.map((item, idx) => (
          <div key={item.slug} className={`carousel-slide ${idx === index ? 'active' : ''}`} aria-hidden={idx !== index}>
            <div className="slide-backdrop" style={{ backgroundImage: `url('${proxyImage(item.cover)}')` }} />
            <div className="slide-overlay" />
            <img className="slide-poster" src={proxyImage(item.cover)} alt="" loading={idx ? 'lazy' : 'eager'} />
            <div className="slide-content">
              <div className="slide-badge">Rekomendasi #{idx + 1}</div>
              <h2 className="slide-title">{item.title}</h2>
              <div className="slide-meta">
                {item.score && <span className="slide-score">★ {item.score}</span>}
                {item.genres.slice(0, 3).map(g => <span key={g}>{g}</span>)}
              </div>
              <p className="slide-desc">
                {item.synopsis || 'Tonton anime sub indo dengan streaming MP4 langsung tanpa iklan.'}
              </p>
              <div className="slide-actions">
                <Link className="btn-primary btn-lg" href={animeHref(item.slug)} tabIndex={idx === index ? 0 : -1}>
                  <PlayIcon /> Tonton
                </Link>
                <Link className="btn-glass btn-lg" href={animeHref(item.slug)} tabIndex={idx === index ? 0 : -1}>
                  <InfoIcon /> Detail
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button className="carousel-ctrl prev" onClick={() => go(index - 1)} aria-label="Slide sebelumnya"><ChevronLeft /></button>
      <button className="carousel-ctrl next" onClick={() => go(index + 1)} aria-label="Slide selanjutnya"><ChevronRight /></button>

      <div className="carousel-dots">
        {items.map((_, idx) => (
          <button key={idx} className={`carousel-dot ${idx === index ? 'active' : ''}`} onClick={() => go(idx)} aria-label={`Slide ${idx + 1}`} />
        ))}
      </div>
    </section>
  );
}
