import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="empty-state">
      <div className="empty-icon">🧭</div>
      <h3>Halaman tidak ditemukan</h3>
      <Link className="btn-primary" href="/">Kembali ke Beranda</Link>
    </div>
  );
}
