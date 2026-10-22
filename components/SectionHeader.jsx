export default function SectionHeader({ title, count, countLabel, filterLabel, onClearFilter }) {
  const pill = countLabel ?? (count == null ? 'Memuat...' : `${count} Anime`);
  return (
    <div className="content-header">
      <div className="section-title-wrap">
        <h1 className="section-title">{title}</h1>
        <span className="count-pill">{pill}</span>
      </div>
      {filterLabel && (
        <div className="active-filter-tag">
          <span>{filterLabel}</span>
          <button onClick={onClearFilter} aria-label="Hapus filter">&times;</button>
        </div>
      )}
    </div>
  );
}
