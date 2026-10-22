// Placeholder layouts shown while a page loads. Each one reuses the real
// page's layout classes so nothing jumps when the content arrives.

import { GridSkeleton } from './MediaGrid';
import { RowSkeleton } from './MediaRow';

export function Bone({ w = '100%', h = 14, r, className = '', style }) {
  return <span className={`skel ${className}`} style={{ width: w, height: h, borderRadius: r, ...style }} aria-hidden="true" />;
}

function HeaderSkeleton({ titleWidth = 220 }) {
  return (
    <div className="content-header">
      <div className="section-title-wrap">
        <Bone w={titleWidth} h={30} r={8} />
        <Bone w={78} h={24} r={999} />
      </div>
    </div>
  );
}

const range = n => Array.from({ length: n }, (_, i) => i);

export function HomeSkeleton() {
  return (
    <>
      <section className="hero-carousel" aria-busy="true" aria-label="Memuat">
        <div className="slide-placeholder" />
        <div className="slide-content skel-hero-content">
          <Bone w={130} h={24} r={6} />
          <Bone w="80%" h={52} r={10} />
          <Bone w="45%" h={18} />
          <Bone w="95%" h={14} />
          <Bone w="70%" h={14} />
          <div className="skel-row">
            <Bone w={132} h={48} r={10} />
            <Bone w={120} h={48} r={10} />
          </div>
        </div>
      </section>
      <div className="home-rows">
        <RowSkeleton />
        <RowSkeleton />
      </div>
    </>
  );
}

// Ongoing, Baru Upload, Movie, Search
export function ListingSkeleton({ count = 18 }) {
  return (
    <div aria-busy="true" aria-label="Memuat">
      <HeaderSkeleton />
      <GridSkeleton count={count} />
    </div>
  );
}

export function ExplorePanelSkeleton() {
  return (
    <div className="explore-panel">
      <div className="explore-bar">
        <Bone h={44} r={10} className="explore-search-skel" />
        {range(4).map(i => <Bone key={i} h={44} r={10} />)}
      </div>
      <div className="explore-genres">
        <Bone w={64} h={16} />
        {[70, 80, 84, 96, 88, 72, 64, 110, 104, 74, 82].map((w, i) => <Bone key={i} w={w} h={31} r={999} />)}
      </div>
    </div>
  );
}

export function ExploreSkeleton() {
  return (
    <div aria-busy="true" aria-label="Memuat">
      <HeaderSkeleton titleWidth={240} />
      <ExplorePanelSkeleton />
      <GridSkeleton count={18} />
    </div>
  );
}

export function AnimeSkeleton() {
  return (
    <article className="detail-page" aria-busy="true" aria-label="Memuat">
      <div className="detail-hero skel-backdrop" aria-hidden="true" />
      <div className="detail-content">
        <header className="detail-head">
          <Bone className="detail-poster" w={null} h={null} r={16} />
          <div className="detail-info">
            <Bone w={90} h={22} r={6} />
            <Bone w="80%" h={52} r={10} />
            <Bone w="45%" h={18} />
            <div className="skel-row">
              <Bone w={190} h={44} r={999} />
              <Bone w={150} h={44} r={999} />
              <Bone w={110} h={44} r={999} />
            </div>
            <div className="skel-row">
              {[64, 82, 70, 76].map((w, i) => <Bone key={i} w={w} h={28} r={999} />)}
            </div>
            <div className="skel-stack" style={{ width: '100%', maxWidth: 760 }}>
              <Bone h={14} />
              <Bone h={14} />
              <Bone w="70%" h={14} />
            </div>
          </div>
        </header>
        <div className="detail-facts">
          {range(5).map(i => (
            <div key={i} className="skel-stack" style={{ gap: 6 }}>
              <Bone w={46} h={10} />
              <Bone w={90} h={16} />
            </div>
          ))}
        </div>
        <div className="section-bar">
          <Bone w={150} h={28} r={8} />
          <div className="section-tools">
            <Bone w={170} h={40} r={999} />
            <Bone w={110} h={40} r={999} />
          </div>
        </div>
        <div className="ep-grid">
          {range(18).map(i => <Bone key={i} h={104} r={14} />)}
        </div>
      </div>
    </article>
  );
}

export function WatchSkeleton() {
  return (
    <article className="watch" aria-busy="true" aria-label="Memuat">
      <div className="watch-frame"><div className="skel skel-player" /></div>
      <div className="watch-main">
        <div className="watch-bar">
          <div className="watch-heading">
            <Bone w={220} h={16} />
            <Bone w={240} h={34} r={8} />
            <Bone w={200} h={14} />
          </div>
          <div className="watch-actions">
            <Bone w={96} h={40} r={999} />
            <Bone w={96} h={40} r={999} />
            <Bone w={40} h={40} r={999} />
          </div>
        </div>
        <div className="watch-about">
          <Bone w={108} h={162} r={12} />
          <div className="skel-stack" style={{ flex: 1 }}>
            <Bone w="50%" h={20} />
            <Bone w="40%" h={14} />
            <Bone h={13} />
            <Bone h={13} />
            <Bone w="65%" h={13} />
          </div>
        </div>
        <div className="watch-section">
          <Bone w={170} h={22} style={{ marginBottom: 12 }} />
          <div className="dl-grid">
            {range(4).map(i => <Bone key={i} h={128} r={16} />)}
          </div>
        </div>
      </div>
      <aside className="watch-side">
        <div className="side-head"><Bone w={150} h={20} /></div>
        <div className="side-list">
          {range(10).map(i => (
            <div key={i} className="side-ep">
              <Bone w={42} h={42} r={10} />
              <div className="skel-stack" style={{ flex: 1, gap: 6 }}>
                <Bone w="60%" h={13} />
                <Bone w="40%" h={11} />
              </div>
            </div>
          ))}
        </div>
      </aside>
    </article>
  );
}

export function ScheduleSkeleton() {
  return (
    <div aria-busy="true" aria-label="Memuat">
      <HeaderSkeleton titleWidth={200} />
      <div className="day-tabs">
        {range(7).map(i => <Bone key={i} w={78} h={52} r={14} style={{ flexShrink: 0 }} />)}
      </div>
      <div className="schedule-list">
        {range(9).map(i => (
          <div key={i} className="schedule-item">
            <Bone w={52} h={72} r={8} style={{ flexShrink: 0 }} />
            <div className="skel-stack" style={{ flex: 1 }}>
              <Bone w="85%" h={14} />
              <Bone w="55%" h={14} />
            </div>
            <Bone w={84} h={22} r={999} style={{ flexShrink: 0 }} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function AZSkeleton() {
  return (
    <div aria-busy="true" aria-label="Memuat">
      <HeaderSkeleton titleWidth={240} />
      <div className="az-filter"><Bone w="100%" h={38} r={999} style={{ maxWidth: 420 }} /></div>
      <div className="day-tabs az-letters">
        {range(27).map(i => <Bone key={i} w={42} h={38} r={14} style={{ flexShrink: 0 }} />)}
      </div>
      <section className="az-group">
        <Bone w={90} h={28} r={8} style={{ marginBottom: 14 }} />
        <ul className="az-list">
          {range(30).map(i => <li key={i}><Bone w={`${55 + ((i * 37) % 40)}%`} h={15} /></li>)}
        </ul>
      </section>
    </div>
  );
}
