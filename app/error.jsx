'use client';

import { useEffect } from 'react';

// A failed chunk load means a new deployment replaced the files this tab was
// using; only a full reload fixes that. Anything else can be retried in place.
function isChunkError(error) {
  return /ChunkLoadError|Loading chunk|Failed to fetch dynamically imported module/i.test(`${error?.name} ${error?.message}`);
}

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error(error);
    if (!isChunkError(error)) return;
    // Reload at most once per minute so a persistent failure can't loop
    try {
      const last = Number(sessionStorage.getItem('kuronime_chunk_reload')) || 0;
      if (Date.now() - last < 60_000) return;
      sessionStorage.setItem('kuronime_chunk_reload', String(Date.now()));
    } catch {
      return;
    }
    window.location.reload();
  }, [error]);

  return (
    <div className="empty-state">
      <div className="empty-icon">⚠️</div>
      <h3>Terjadi kesalahan saat memuat halaman</h3>
      <p>Silakan coba lagi.</p>
      <button className="btn-primary" onClick={() => reset()}>Coba Lagi</button>
    </div>
  );
}
