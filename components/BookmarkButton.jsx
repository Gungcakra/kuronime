'use client';

import { BookmarkIcon } from './Icons';
import { useBookmarks } from '@/hooks/useBookmarks';

export default function BookmarkButton({ entry }) {
  const { isBookmarked, toggle } = useBookmarks();
  const saved = isBookmarked(entry.kind, entry.id);
  return (
    <button className={`btn-icon-bookmark ${saved ? 'saved' : ''}`} onClick={() => toggle(entry)}>
      <BookmarkIcon size={16} />
      <span>{saved ? 'Tersimpan' : 'Simpan'}</span>
    </button>
  );
}
