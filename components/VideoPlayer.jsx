'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

const SKIP_SECONDS = 10;
const OPENING_SECONDS = 85;
const HIDE_DELAY = 2600;
const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];
const VOLUME_KEY = 'kuronime_volume';

const svg = { viewBox: '0 0 24 24', width: 22, height: 22, fill: 'currentColor', 'aria-hidden': true };
const Icon = {
  play: <svg {...svg}><path d="M8 5.14v13.72a1 1 0 0 0 1.5.86l11-6.86a1 1 0 0 0 0-1.72l-11-6.86A1 1 0 0 0 8 5.14z" /></svg>,
  pause: <svg {...svg}><rect x="6" y="4.5" width="4" height="15" rx="1" /><rect x="14" y="4.5" width="4" height="15" rx="1" /></svg>,
  back: (
    <svg {...svg} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5" />
      <text x="12.5" y="15.6" fill="currentColor" stroke="none" fontSize="7.5" fontWeight="800" textAnchor="middle">10</text>
    </svg>
  ),
  forward: (
    <svg {...svg} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12a9 9 0 1 1-3-6.7L21 8" /><path d="M21 3v5h-5" />
      <text x="11.5" y="15.6" fill="currentColor" stroke="none" fontSize="7.5" fontWeight="800" textAnchor="middle">10</text>
    </svg>
  ),
  next: <svg {...svg}><path d="M6 6.5v11a1 1 0 0 0 1.55.83L15 13.2V17a1 1 0 0 0 2 0V7a1 1 0 0 0-2 0v3.8L7.55 5.67A1 1 0 0 0 6 6.5z" /></svg>,
  volume: <svg {...svg}><path d="M4 9v6h4l5 4V5L8 9H4zm12.5 3a4.5 4.5 0 0 0-2.5-4v8a4.5 4.5 0 0 0 2.5-4zM14 3.2v2.1a7 7 0 0 1 0 13.4v2.1a9 9 0 0 0 0-17.6z" /></svg>,
  muted: <svg {...svg}><path d="M4 9v6h4l5 4V5L8 9H4zm12.6 3 2.7-2.7-1.4-1.4-2.7 2.7-2.7-2.7-1.4 1.4 2.7 2.7-2.7 2.7 1.4 1.4 2.7-2.7 2.7 2.7 1.4-1.4z" /></svg>,
  settings: <svg {...svg}><path d="M19.4 13a7.5 7.5 0 0 0 0-2l2.1-1.6-2-3.4-2.5 1a7.4 7.4 0 0 0-1.7-1L15 3.3h-4l-.4 2.7a7.4 7.4 0 0 0-1.7 1l-2.5-1-2 3.4L6.6 11a7.5 7.5 0 0 0 0 2l-2.1 1.6 2 3.4 2.5-1a7.4 7.4 0 0 0 1.7 1l.4 2.7h4l.4-2.7a7.4 7.4 0 0 0 1.7-1l2.5 1 2-3.4L19.4 13zM13 15.5a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7z" transform="translate(-1 0)" /></svg>,
  pip: <svg {...svg}><path d="M19 7h-8v6h8V7zm2-4H3a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zm0 16H3V5h18v14z" /></svg>,
  fullscreen: <svg {...svg}><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" /></svg>,
  exitFullscreen: <svg {...svg}><path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z" /></svg>,
  replay: <svg {...svg}><path d="M12 5V1L7 6l5 5V7a6 6 0 1 1-6 6H4a8 8 0 1 0 8-8z" /></svg>
};

function formatClock(sec) {
  if (!Number.isFinite(sec) || sec < 0) sec = 0;
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.floor(sec % 60).toString().padStart(2, '0');
  return h ? `${h}:${m.toString().padStart(2, '0')}:${s}` : `${m}:${s}`;
}

function readVolume() {
  try {
    const saved = JSON.parse(localStorage.getItem(VOLUME_KEY));
    if (saved && typeof saved.volume === 'number') return saved;
  } catch {
    // ignore - fall back to defaults
  }
  return { volume: 1, muted: false };
}

function isTyping(el) {
  return el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable);
}

// Custom-controls player for direct MP4 links. `sources` are the quality
// variants of one episode; switching keeps the playback position.
export default function VideoPlayer({ sources, activeId, onSelectSource, poster, onNext, nextLabel }) {
  const wrapRef = useRef(null);
  const videoRef = useRef(null);
  const trackRef = useRef(null);
  const hideTimer = useRef(null);
  const resume = useRef(null);
  const lastTap = useRef({ at: 0, side: null });

  const active = sources.find(s => s.id === activeId) || sources[0];

  const [playing, setPlaying] = useState(false);
  const [started, setStarted] = useState(false);
  const [ended, setEnded] = useState(false);
  const [waiting, setWaiting] = useState(true);
  const [error, setError] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [rate, setRate] = useState(1);
  const [menu, setMenu] = useState(null); // null | 'main' | 'speed' | 'quality'
  const [controlsVisible, setControlsVisible] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  const [scrub, setScrub] = useState(null); // { ratio, dragging }
  const [flash, setFlash] = useState(null); // { text, key }

  const video = () => videoRef.current;

  const showFlash = useCallback(text => setFlash({ text, key: Date.now() }), []);

  // Controls stay up while paused or a menu is open; otherwise they fade out
  const poke = useCallback(() => {
    setControlsVisible(true);
    clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setControlsVisible(false), HIDE_DELAY);
  }, []);
  const controlsShown = controlsVisible || !playing || menu !== null || scrub?.dragging;

  useEffect(() => () => clearTimeout(hideTimer.current), []);

  useEffect(() => {
    const saved = readVolume();
    setVolume(saved.volume);
    setMuted(saved.muted);
    video().volume = saved.volume;
    video().muted = saved.muted;
  }, []);

  useEffect(() => {
    if (!flash) return;
    const t = setTimeout(() => setFlash(null), 650);
    return () => clearTimeout(t);
  }, [flash]);

  useEffect(() => {
    const onChange = () => setFullscreen(document.fullscreenElement === wrapRef.current);
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  const togglePlay = useCallback(() => {
    const v = video();
    if (v.paused || v.ended) v.play().catch(() => {});
    else v.pause();
  }, []);

  const seekBy = useCallback(delta => {
    const v = video();
    if (!Number.isFinite(v.duration)) return;
    v.currentTime = Math.min(Math.max(0, v.currentTime + delta), v.duration - 0.1);
    showFlash(`${delta > 0 ? '+' : '−'}${Math.abs(delta)}s`);
  }, [showFlash]);

  const applyVolume = useCallback((nextVolume, nextMuted) => {
    const v = video();
    v.volume = nextVolume;
    v.muted = nextMuted;
    setVolume(nextVolume);
    setMuted(nextMuted);
    try {
      localStorage.setItem(VOLUME_KEY, JSON.stringify({ volume: nextVolume, muted: nextMuted }));
    } catch {
      // storage unavailable - setting applies to this session only
    }
  }, []);

  const toggleMute = useCallback(() => {
    const v = video();
    // Unmuting at zero volume would stay silent, so bring it back up
    if (v.muted || v.volume === 0) applyVolume(v.volume || 0.5, false);
    else applyVolume(v.volume, true);
  }, [applyVolume]);

  const toggleFullscreen = useCallback(() => {
    const wrap = wrapRef.current;
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else if (wrap.requestFullscreen) {
      wrap.requestFullscreen().catch(() => {});
    } else if (video().webkitEnterFullscreen) {
      // iPhone Safari only supports native fullscreen on the <video> itself
      video().webkitEnterFullscreen();
    }
  }, []);

  async function togglePip() {
    try {
      if (document.pictureInPictureElement) await document.exitPictureInPicture();
      else await video().requestPictureInPicture();
    } catch {
      // PiP not allowed / supported
    }
  }

  function changeRate(r) {
    const v = video();
    v.playbackRate = r;
    v.defaultPlaybackRate = r;
    setRate(r);
    setMenu(null);
  }

  function changeQuality(source) {
    setMenu(null);
    if (source.id === active.id) return;
    const v = video();
    resume.current = { time: v.currentTime, play: !v.paused };
    onSelectSource(source);
  }

  // Keyboard shortcuts (YouTube-style), ignored while typing in an input
  useEffect(() => {
    function onKey(e) {
      if (isTyping(e.target) || e.ctrlKey || e.metaKey || e.altKey) return;
      const v = video();
      const actions = {
        ' ': togglePlay,
        k: togglePlay,
        ArrowLeft: () => seekBy(-5),
        ArrowRight: () => seekBy(5),
        j: () => seekBy(-SKIP_SECONDS),
        l: () => seekBy(SKIP_SECONDS),
        ArrowUp: () => applyVolume(Math.min(1, v.volume + 0.1), false),
        ArrowDown: () => applyVolume(Math.max(0, v.volume - 0.1), false),
        m: toggleMute,
        f: toggleFullscreen
      };
      const action = actions[e.key.length === 1 ? e.key.toLowerCase() : e.key];
      if (!action) return;
      e.preventDefault();
      // A focused button would also "click" on the space keyup
      if (e.key === ' ' && e.target.tagName === 'BUTTON') e.target.blur();
      action();
      poke();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [togglePlay, seekBy, applyVolume, toggleMute, toggleFullscreen, poke]);

  // --- media events ---------------------------------------------------------

  function handleLoadedMetadata() {
    const v = video();
    setDuration(v.duration);
    setError(false);
    v.playbackRate = rate;
    if (resume.current) {
      v.currentTime = resume.current.time;
      if (resume.current.play) v.play().catch(() => {});
      resume.current = null;
    }
  }

  function handleProgress() {
    const v = video();
    const { buffered: ranges, currentTime } = v;
    for (let i = 0; i < ranges.length; i++) {
      if (ranges.start(i) <= currentTime + 0.5 && ranges.end(i) >= currentTime) {
        setBuffered(ranges.end(i));
        return;
      }
    }
  }

  // --- seek bar -------------------------------------------------------------

  function ratioAt(clientX) {
    const rect = trackRef.current.getBoundingClientRect();
    return Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
  }

  function onTrackDown(e) {
    e.currentTarget.setPointerCapture(e.pointerId);
    setScrub({ ratio: ratioAt(e.clientX), dragging: true });
  }

  function onTrackMove(e) {
    const ratio = ratioAt(e.clientX);
    setScrub(s => ({ ratio, dragging: s?.dragging ?? false }));
  }

  function onTrackUp(e) {
    if (!scrub?.dragging) return;
    const ratio = ratioAt(e.clientX);
    if (Number.isFinite(duration) && duration > 0) {
      video().currentTime = ratio * duration;
      setTime(ratio * duration);
    }
    setScrub({ ratio, dragging: false });
  }

  // --- surface taps: click toggles play on desktop; on touch a tap toggles
  // the controls and a double-tap on either side skips 10s

  function onSurfacePointerUp(e) {
    if (e.target !== e.currentTarget) return;
    if (e.pointerType !== 'touch') {
      togglePlay();
      poke();
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const side = x < 0.35 ? 'left' : x > 0.65 ? 'right' : 'center';
    const now = Date.now();
    const isDouble = now - lastTap.current.at < 300 && lastTap.current.side === side;
    lastTap.current = { at: now, side };
    if (isDouble && side !== 'center') {
      seekBy(side === 'left' ? -SKIP_SECONDS : SKIP_SECONDS);
      poke();
    } else if (controlsShown && playing && menu === null) {
      setControlsVisible(false);
    } else {
      poke();
    }
  }

  const shownTime = scrub?.dragging ? scrub.ratio * duration : time;
  const progress = duration ? (shownTime / duration) * 100 : 0;
  const bufferedPct = duration ? (buffered / duration) * 100 : 0;
  const volumeLevel = muted ? 0 : volume;
  const canSkipOpening = started && time < OPENING_SECONDS + 60 && duration > OPENING_SECONDS * 3;

  return (
    <div
      ref={wrapRef}
      className={`kn-player ${controlsShown ? '' : 'idle'} ${fullscreen ? 'is-fullscreen' : ''}`}
      onPointerMove={e => e.pointerType !== 'touch' && poke()}
      onMouseLeave={() => playing && setControlsVisible(false)}
    >
      <video
        ref={videoRef}
        src={active?.url}
        poster={poster}
        playsInline
        preload="metadata"
        onLoadedMetadata={handleLoadedMetadata}
        onDurationChange={() => setDuration(video().duration)}
        onTimeUpdate={() => setTime(video().currentTime)}
        onProgress={handleProgress}
        onPlay={() => { setPlaying(true); setStarted(true); setEnded(false); poke(); }}
        onPause={() => setPlaying(false)}
        onWaiting={() => setWaiting(true)}
        onCanPlay={() => setWaiting(false)}
        onPlaying={() => setWaiting(false)}
        onEnded={() => { setPlaying(false); setEnded(true); }}
        onError={() => { setError(true); setWaiting(false); }}
        onVolumeChange={() => { setVolume(video().volume); setMuted(video().muted); }}
      />

      <div className="kn-surface" onPointerUp={onSurfacePointerUp} onDoubleClick={e => e.target === e.currentTarget && toggleFullscreen()}>
        {waiting && !error && <div className="spinner kn-spinner" />}
        {flash && <div key={flash.key} className="kn-flash">{flash.text}</div>}

        {!started && !error && !waiting && (
          <button className="kn-big-play" onClick={togglePlay} aria-label="Putar">{Icon.play}</button>
        )}

        {error && (
          <div className="kn-message">
            <p>Video gagal dimuat.</p>
            {sources.length > 1 && <p>Coba pilih kualitas lain dari menu ⚙.</p>}
          </div>
        )}

        {ended && (
          <div className="kn-message">
            <div className="kn-end-actions">
              <button className="btn-ghost" onClick={togglePlay}>{Icon.replay} Putar Ulang</button>
              {onNext && <button className="btn-primary" onClick={onNext}>{Icon.next} {nextLabel || 'Episode Berikutnya'}</button>}
            </div>
          </div>
        )}
      </div>

      {canSkipOpening && controlsShown && (
        <button className="kn-skip-op" onClick={() => seekBy(OPENING_SECONDS)}>Lewati Opening +{OPENING_SECONDS}s ›</button>
      )}

      <div className="kn-controls" onPointerUp={e => e.stopPropagation()}>
        <div
          ref={trackRef}
          className={`kn-track ${scrub?.dragging ? 'dragging' : ''}`}
          onPointerDown={onTrackDown}
          onPointerMove={onTrackMove}
          onPointerUp={onTrackUp}
          onPointerLeave={() => !scrub?.dragging && setScrub(null)}
          role="slider"
          aria-label="Posisi video"
          aria-valuemin={0}
          aria-valuemax={Math.round(duration) || 0}
          aria-valuenow={Math.round(shownTime)}
        >
          <div className="kn-track-bg" />
          <div className="kn-track-buffer" style={{ width: `${bufferedPct}%` }} />
          <div className="kn-track-fill" style={{ width: `${progress}%` }} />
          <div className="kn-track-thumb" style={{ left: `${progress}%` }} />
          {scrub && duration > 0 && (
            <div className="kn-track-tip" style={{ left: `${scrub.ratio * 100}%` }}>{formatClock(scrub.ratio * duration)}</div>
          )}
        </div>

        <div className="kn-bar">
          <div className="kn-group">
            <button className="kn-btn" onClick={togglePlay} aria-label={playing ? 'Jeda (k)' : 'Putar (k)'} title={playing ? 'Jeda (k)' : 'Putar (k)'}>
              {playing ? Icon.pause : Icon.play}
            </button>
            <button className="kn-btn" onClick={() => seekBy(-SKIP_SECONDS)} aria-label="Mundur 10 detik (j)" title="Mundur 10 detik (j)">{Icon.back}</button>
            <button className="kn-btn" onClick={() => seekBy(SKIP_SECONDS)} aria-label="Maju 10 detik (l)" title="Maju 10 detik (l)">{Icon.forward}</button>
            {onNext && (
              <button className="kn-btn" onClick={onNext} aria-label={nextLabel || 'Episode berikutnya'} title={nextLabel || 'Episode berikutnya'}>{Icon.next}</button>
            )}
            <div className="kn-volume">
              <button className="kn-btn" onClick={toggleMute} aria-label="Bisukan (m)" title="Bisukan (m)">
                {volumeLevel === 0 ? Icon.muted : Icon.volume}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volumeLevel}
                onChange={e => applyVolume(Number(e.target.value), Number(e.target.value) === 0)}
                aria-label="Volume"
                style={{ '--level': `${volumeLevel * 100}%` }}
              />
            </div>
            <span className="kn-time">{formatClock(shownTime)} / {formatClock(duration)}</span>
          </div>

          <div className="kn-group">
            <div className="kn-menu-wrap">
              <button
                className={`kn-btn kn-settings ${menu ? 'open' : ''}`}
                onClick={() => setMenu(m => (m ? null : 'main'))}
                aria-label="Pengaturan"
                title="Pengaturan"
              >
                {Icon.settings}
                {active && <span className="kn-quality-badge">{active.quality}</span>}
              </button>
              {menu && (
                <div className="kn-menu" role="menu">
                  {menu === 'main' && (
                    <>
                      <button onClick={() => setMenu('quality')}><span>Kualitas</span><b>{active?.label} ›</b></button>
                      <button onClick={() => setMenu('speed')}><span>Kecepatan</span><b>{rate === 1 ? 'Normal' : `${rate}x`} ›</b></button>
                    </>
                  )}
                  {menu === 'quality' && (
                    <>
                      <button className="kn-menu-back" onClick={() => setMenu('main')}>‹ Kualitas</button>
                      {sources.map(s => (
                        <button key={s.id} className={s.id === active?.id ? 'selected' : ''} onClick={() => changeQuality(s)}>{s.label}</button>
                      ))}
                    </>
                  )}
                  {menu === 'speed' && (
                    <>
                      <button className="kn-menu-back" onClick={() => setMenu('main')}>‹ Kecepatan</button>
                      {SPEEDS.map(r => (
                        <button key={r} className={r === rate ? 'selected' : ''} onClick={() => changeRate(r)}>{r === 1 ? 'Normal' : `${r}x`}</button>
                      ))}
                    </>
                  )}
                </div>
              )}
            </div>
            <button className="kn-btn kn-hide-mobile" onClick={togglePip} aria-label="Picture in picture" title="Picture in picture">{Icon.pip}</button>
            <button className="kn-btn" onClick={toggleFullscreen} aria-label="Layar penuh (f)" title="Layar penuh (f)">
              {fullscreen ? Icon.exitFullscreen : Icon.fullscreen}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
