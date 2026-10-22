'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';

const STORAGE_KEY = 'kuronime_bookmarks';
const BookmarksContext = createContext(null);

function readStorage() {
  try {
    const list = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export function BookmarksProvider({ children }) {
  // Start empty so the server render and the first client render match
  // (localStorage only exists in the browser), then load the saved list.
  const [bookmarks, setBookmarks] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setBookmarks(readStorage());
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
    } catch {
      // storage unavailable (private mode) - keep in memory only
    }
  }, [bookmarks, loaded]);

  const isBookmarked = useCallback((kind, id) => bookmarks.some(b => b.kind === kind && b.id === id), [bookmarks]);

  const toggle = useCallback(entry => {
    setBookmarks(list => list.some(b => b.kind === entry.kind && b.id === entry.id)
      ? list.filter(b => !(b.kind === entry.kind && b.id === entry.id))
      : [entry, ...list]);
  }, []);

  const remove = useCallback((kind, id) => {
    setBookmarks(list => list.filter(b => !(b.kind === kind && b.id === id)));
  }, []);

  return (
    <BookmarksContext.Provider value={{ bookmarks, isBookmarked, toggle, remove }}>
      {children}
    </BookmarksContext.Provider>
  );
}

export function useBookmarks() {
  return useContext(BookmarksContext);
}
