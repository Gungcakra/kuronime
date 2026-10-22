'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { NAV_ITEMS } from '@/lib/utils';
import { BookmarkIcon, CalendarIcon, CloseIcon, CompassIcon, FilmIcon, FlameIcon, HomeIcon, ListIcon, MenuIcon, SearchIcon, UploadIcon } from './Icons';
import { useBookmarks } from '@/hooks/useBookmarks';

export const NAV_ICONS = {
  '/': HomeIcon,
  '/explore': CompassIcon,
  '/ongoing': FlameIcon,
  '/latest': UploadIcon,
  '/movie': FilmIcon,
  '/schedule': CalendarIcon,
  '/az': ListIcon
};

export default function Navbar({ onOpenBookmarks }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const { bookmarks } = useBookmarks();

  const activeHref = NAV_ITEMS.find(n => n.href === pathname)?.href;
  const urlQuery = pathname === '/search' ? params.get('q') || '' : '';

  const [query, setQuery] = useState(urlQuery);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const timer = useRef(null);
  const inputRef = useRef(null);

  // Keep the input in sync when navigating via history
  useEffect(() => setQuery(urlQuery), [urlQuery]);
  useEffect(() => () => clearTimeout(timer.current), []);
  useEffect(() => setMenuOpen(false), [pathname]);

  // Transparent over the hero, a floating pill once the page scrolls
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (searchOpen) inputRef.current?.focus();
  }, [searchOpen]);

  function submit(value) {
    clearTimeout(timer.current);
    const q = value.trim();
    if (q && q !== urlQuery) {
      const url = `/search?q=${encodeURIComponent(q)}`;
      pathname === '/search' ? router.replace(url) : router.push(url);
    }
  }

  function handleChange(e) {
    const value = e.target.value;
    setQuery(value);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => submit(value), 450);
  }

  function clear() {
    clearTimeout(timer.current);
    setQuery('');
    if (pathname === '/search') router.push('/');
  }

  const solid = scrolled || menuOpen || searchOpen;

  return (
    <header className={`navbar ${solid ? 'navbar--scrolled' : ''}`}>
      <div className="nav-outer">
        <div className="nav-container">
          <Link href="/" className="brand" aria-label="Kuronime">
            <span className="brand-text">KURO<span>NIME</span></span>
          </Link>

          <nav className="nav-links">
            {NAV_ITEMS.map(c => {
              const Icon = NAV_ICONS[c.href];
              return (
                <Link key={c.href} href={c.href} className={`nav-link ${activeHref === c.href ? 'active' : ''}`}>
                  {Icon && <Icon />}
                  {c.label}
                </Link>
              );
            })}
          </nav>

          <div className="nav-right">
            <div className={`search-box ${searchOpen ? 'open' : ''}`}>
              <SearchIcon />
              <input
                ref={inputRef}
                type="text"
                placeholder="Cari judul anime..."
                autoComplete="off"
                value={query}
                onChange={handleChange}
                onKeyDown={e => e.key === 'Enter' && submit(query)}
                onBlur={() => !query && setSearchOpen(false)}
              />
              {query && <button className="clear-btn" onClick={clear} aria-label="Hapus pencarian">&times;</button>}
            </div>

            <button className="nav-icon-btn search-toggle" onClick={() => setSearchOpen(o => !o)} aria-label="Cari">
              {searchOpen ? <CloseIcon size={18} /> : <SearchIcon />}
            </button>

            <button className="nav-icon-btn" title="Tersimpan" onClick={onOpenBookmarks} aria-label="Tersimpan">
              <BookmarkIcon />
              {bookmarks.length > 0 && <span className="badge">{bookmarks.length}</span>}
            </button>

            <button
              className="nav-icon-btn menu-toggle"
              onClick={() => setMenuOpen(o => !o)}
              aria-label="Menu"
              aria-expanded={menuOpen}
            >
              {menuOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <nav className="mobile-menu">
            {NAV_ITEMS.map(c => {
              const Icon = NAV_ICONS[c.href];
              return (
                <Link key={c.href} href={c.href} className={`m-nav-link ${activeHref === c.href ? 'active' : ''}`}>
                  {Icon && <Icon size={18} />}
                  {c.label}
                </Link>
              );
            })}
          </nav>
        )}
      </div>
    </header>
  );
}
