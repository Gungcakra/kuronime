'use client';

import { useRouter } from 'next/navigation';
import Modal from './Modal';
import { TrashIcon } from './Icons';
import { useBookmarks } from '@/hooks/useBookmarks';
import { animeHref, proxyImage } from '@/lib/utils';

export default function BookmarksModal({ onClose }) {
  const router = useRouter();
  const { bookmarks, remove } = useBookmarks();

  function open(b) {
    onClose();
    router.push(animeHref(b.id));
  }

  return (
    <Modal title={`Anime Tersimpan (${bookmarks.length})`} onClose={onClose}>
      <div className="bookmarks-list">
        {!bookmarks.length && <p className="dim-note">Belum ada anime tersimpan.</p>}
        {bookmarks.map(b => (
          <div className="bookmark-item" key={`${b.kind}-${b.id}`}>
            <img className="bookmark-thumb" src={proxyImage(b.image)} alt="" loading="lazy" />
            <div className="bookmark-info">
              <div className="bookmark-title" onClick={() => open(b)}>{b.title}</div>
              <div className="bookmark-date">{b.meta || 'Anime'}</div>
            </div>
            <button className="bookmark-del-btn" onClick={() => remove(b.kind, b.id)} title="Hapus"><TrashIcon /></button>
          </div>
        ))}
      </div>
    </Modal>
  );
}
