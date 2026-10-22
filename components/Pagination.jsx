import Link from 'next/link';

// Page numbers to show: first, last (when known) and a window around the
// current page, with null marking a gap ("…").
function pageItems(page, lastPage, hasMore) {
  const window = new Set([1, page - 2, page - 1, page, page + 1, page + 2, lastPage]);
  const nums = [...window].filter(n => n >= 1 && n <= lastPage).sort((a, b) => a - b);
  const items = [];
  nums.forEach((n, i) => {
    const prev = nums[i - 1];
    // A gap hiding a single page just shows that page instead of "…"
    if (i > 0 && n - prev === 2) items.push(prev + 1);
    else if (i > 0 && n - prev > 2) items.push(null);
    items.push(n);
  });
  if (hasMore) items.push(null);
  return items;
}

// lastPage is the highest page known to exist; hasMore means pages beyond it
// may exist but the total isn't known yet.
export default function Pagination({ page, lastPage, hasMore = false, hrefFor }) {
  if (!lastPage || (lastPage <= 1 && !hasMore)) return null;
  const canNext = page < lastPage || hasMore;

  const step = (target, enabled, label, text) => enabled
    ? <Link className="page-btn" href={hrefFor(target)} aria-label={label}>{text}</Link>
    : <span className="page-btn disabled" aria-hidden="true">{text}</span>;

  return (
    <nav className="pagination" aria-label="Navigasi halaman">
      {step(page - 1, page > 1, 'Halaman sebelumnya', '‹')}
      {pageItems(page, lastPage, hasMore).map((n, i) => n === null
        ? <span key={`gap-${i}`} className="page-gap">…</span>
        : n === page
          ? <span key={n} className="page-btn active" aria-current="page">{n}</span>
          : <Link key={n} className="page-btn" href={hrefFor(n)}>{n}</Link>
      )}
      {step(page + 1, canNext, 'Halaman berikutnya', '›')}
    </nav>
  );
}
