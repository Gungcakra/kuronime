'use client';

import { Suspense, useCallback, useState } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import BookmarksModal from './BookmarksModal';
import { BookmarksProvider } from '@/hooks/useBookmarks';

export default function Shell({ children }) {
  const [bookmarksOpen, setBookmarksOpen] = useState(false);
  const close = useCallback(() => setBookmarksOpen(false), []);

  return (
    <BookmarksProvider>
      <Suspense>
        <Navbar onOpenBookmarks={() => setBookmarksOpen(true)} />
      </Suspense>
      <main className="main-content">{children}</main>
      <Footer />
      {bookmarksOpen && <BookmarksModal onClose={close} />}
    </BookmarksProvider>
  );
}
