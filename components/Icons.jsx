const base = { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2 };

export const SearchIcon = () => (
  <svg className="search-icon" {...base}><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
);
export const BookmarkIcon = ({ size = 18 }) => (
  <svg {...base} width={size} height={size}><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" /></svg>
);
export const PlayIcon = ({ size = 18 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor"><polygon points="5 3 19 12 5 21 5 3" /></svg>
);
export const ChevronLeft = () => (
  <svg {...base} strokeWidth="2.5" width="24" height="24"><polyline points="15 18 9 12 15 6" /></svg>
);
export const ChevronRight = () => (
  <svg {...base} strokeWidth="2.5" width="24" height="24"><polyline points="9 18 15 12 9 6" /></svg>
);
export const ExternalIcon = ({ size = 14 }) => (
  <svg {...base} width={size} height={size}>
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
  </svg>
);
export const DownloadIcon = () => (
  <svg {...base} width="18" height="18">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);
export const TrashIcon = () => (
  <svg {...base} width="16" height="16">
    <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);
export const HomeIcon = ({ size = 16 }) => (
  <svg {...base} width={size} height={size}><path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z" /></svg>
);
export const FlameIcon = ({ size = 16 }) => (
  <svg {...base} width={size} height={size}><path d="M12 22c4 0 7-2.7 7-6.8 0-4.2-3.4-6.3-4.2-10.2-2 1.2-3.3 3.3-3.3 5.5-1.2-.8-2-2.2-2.2-3.6C7 8.6 5 11.4 5 15.2 5 19.3 8 22 12 22z" /></svg>
);
export const UploadIcon = ({ size = 16 }) => (
  <svg {...base} width={size} height={size}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
);
export const CalendarIcon = ({ size = 16 }) => (
  <svg {...base} width={size} height={size}><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
);
export const ListIcon = ({ size = 16 }) => (
  <svg {...base} width={size} height={size}><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg>
);
export const MenuIcon = ({ size = 20 }) => (
  <svg {...base} width={size} height={size}><line x1="4" y1="7" x2="20" y2="7" /><line x1="4" y1="12" x2="20" y2="12" /><line x1="4" y1="17" x2="20" y2="17" /></svg>
);
export const CloseIcon = ({ size = 20 }) => (
  <svg {...base} width={size} height={size}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
);
export const InfoIcon = ({ size = 18 }) => (
  <svg {...base} width={size} height={size}><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>
);
export const CompassIcon = ({ size = 16 }) => (
  <svg {...base} width={size} height={size}><circle cx="12" cy="12" r="10" /><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" /></svg>
);
export const FilmIcon = ({ size = 16 }) => (
  <svg {...base} width={size} height={size}><rect x="2" y="3" width="20" height="18" rx="2" /><line x1="7" y1="3" x2="7" y2="21" /><line x1="17" y1="3" x2="17" y2="21" /><line x1="2" y1="12" x2="22" y2="12" /><line x1="2" y1="7.5" x2="7" y2="7.5" /><line x1="2" y1="16.5" x2="7" y2="16.5" /><line x1="17" y1="7.5" x2="22" y2="7.5" /><line x1="17" y1="16.5" x2="22" y2="16.5" /></svg>
);
export const FilterIcon = ({ size = 16 }) => (
  <svg {...base} width={size} height={size}><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" /></svg>
);
export const GithubIcon = ({ size = 20 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor"><path fillRule="evenodd" clipRule="evenodd" d="M12.006 2a9.847 9.847 0 0 0-6.484 2.44 10.32 10.32 0 0 0-3.393 6.17 10.48 10.48 0 0 0 1.317 6.955 10.045 10.045 0 0 0 5.4 4.418c.504.095.683-.223.683-.494 0-.245-.01-1.052-.014-1.908-2.78.62-3.366-1.21-3.366-1.21a2.711 2.711 0 0 0-1.11-1.5c-.907-.637.07-.621.07-.621.317.044.62.163.885.346.266.183.487.426.647.71.135.253.318.476.538.655a2.079 2.079 0 0 0 2.37.196c.045-.52.27-1.006.635-1.37-2.219-.259-4.554-1.138-4.554-5.07a4.022 4.022 0 0 1 1.031-2.75 3.77 3.77 0 0 1 .096-2.713s.839-.275 2.749 1.05a9.26 9.26 0 0 1 5.004 0c1.906-1.325 2.74-1.05 2.74-1.05.37.858.406 1.828.101 2.713a4.017 4.017 0 0 1 1.029 2.75c0 3.939-2.339 4.805-4.564 5.058a2.471 2.471 0 0 1 .679 1.897c0 1.372-.012 2.477-.012 2.814 0 .272.18.592.687.492a10.05 10.05 0 0 0 5.388-4.421 10.473 10.473 0 0 0 1.313-6.948 10.32 10.32 0 0 0-3.39-6.165A9.847 9.847 0 0 0 12.007 2Z" /></svg>
);
export const ArrowUpIcon = ({ size = 18 }) => (
  <svg {...base} width={size} height={size} strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="19" x2="12" y2="5" /><polyline points="5 12 12 5 19 12" /></svg>
);
export const ClockIcon = ({ size = 14 }) => (
  <svg {...base} width={size} height={size}><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
);
