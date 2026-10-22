import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <Link href="/" className="brand" aria-label="Kuronime">
          <span className="brand-text">KURO<span>NIME</span></span>
        </Link>
        <p className="footer-note">
          Kuronime tidak menyimpan file media apa pun. Semua konten diambil otomatis dari AnimeLovers dan
          diputar langsung sebagai MP4 tanpa iklan.
        </p>
        <Link href="/az" className="footer-link">Daftar A-Z</Link>
      </div>
    </footer>
  );
}
