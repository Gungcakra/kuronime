'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NAV_ITEMS } from '@/lib/utils';
import { NAV_ICONS } from './Navbar';
import { ArrowUpIcon, GithubIcon } from './Icons';

export default function Footer() {
  const pathname = usePathname();
  const toTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-bar">
          <Link href="/" className="brand" aria-label="Kuronime">
            <span className="brand-text">KURO<span>NIME</span></span>
          </Link>

          <nav className="footer-nav" aria-label="Footer">
            {NAV_ITEMS.map(n => {
              const Icon = NAV_ICONS[n.href];
              return (
                <Link key={n.href} href={n.href} className={`nav-link ${pathname === n.href ? 'active' : ''}`}>
                  {Icon && <Icon />}
                  {n.label}
                </Link>
              );
            })}
          </nav>

          <div className="footer-actions">
            <a href="https://github.com/gungcakra" target="_blank" rel="noopener noreferrer" className="nav-icon-btn" aria-label="GitHub">
              <GithubIcon size={18} />
            </a>
            <button type="button" className="nav-icon-btn" onClick={toTop} aria-label="Kembali ke atas">
              <ArrowUpIcon />
            </button>
          </div>
        </div>

        <div className="footer-wordmark" aria-hidden="true">KURONIME</div>

        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} <Link href="/">Kuronime™</Link>. All Rights Reserved.</span>
          <a href="https://github.com/gungcakra" target="_blank" rel="noopener noreferrer">@gungcakra</a>
        </div>
      </div>
    </footer>
  );
}
