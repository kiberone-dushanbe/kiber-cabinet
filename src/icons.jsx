/* Линейные иконки в стиле приложения KIBERone (stroke = currentColor) */
const P = {
  home: <><path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-4.5v-6h-5v6H5a1 1 0 0 1-1-1z" /></>,
  kiberon: <><path d="M6 4v16M6 12l9-8M6 12l9 8M10 4v4.5M10 15.5V20M13.5 4 18 4M13.5 20H18" /></>,
  basket: <><path d="M3 9h18l-2 10a2 2 0 0 1-2 1.6H7A2 2 0 0 1 5 19z" /><path d="M8 9l2-5M16 9l-2-5M9 13v4M12 13v4M15 13v4" /></>,
  megaphone: <><path d="M4 10v4a1 1 0 0 0 1 1h2l8 4V5L7 9H5a1 1 0 0 0-1 1z" /><path d="M7 15l1.5 5h2L9.5 15.5M18 9.5a3 3 0 0 1 0 5M19.5 4.5l1-1M21 8h1.5M19.5 12h0" /></>,
  wallet: <><rect x="3" y="5" width="18" height="15" rx="3" /><path d="M3 9.5h13a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2H3" /><circle cx="15" cy="12" r=".6" /></>,
  phone: <><path d="M5 4h3l1.5 4.5-2 1.5a11 11 0 0 0 6.5 6.5l1.5-2L20 16v3a1.5 1.5 0 0 1-1.5 1.5A16.5 16.5 0 0 1 3.5 5.5 1.5 1.5 0 0 1 5 4z" /></>,
  bell: <><path d="M6 16V11a6 6 0 1 1 12 0v5l1.5 2h-15z" /><path d="M10 20.5a2 2 0 0 0 4 0" /></>,
  heart: <><path d="M12 20s-7.5-4.5-7.5-10A4.3 4.3 0 0 1 12 7.2 4.3 4.3 0 0 1 19.5 10c0 5.5-7.5 10-7.5 10z" /></>,
  userPlus: <><circle cx="10" cy="8" r="4" /><path d="M3 20a7 7 0 0 1 14 0M19 8v6M16 11h6" /></>,
  handHeart: <><path d="M3 15h3l4 3h5a1.5 1.5 0 0 0 0-3h-3.5M6 15l3.5-2.5a2 2 0 0 1 2-.2L14 13.5M15 18l5-3a1.5 1.5 0 0 0-1.5-2.5L15 14.5" /><path d="M15 9.5S11.5 7.5 11.5 5a1.8 1.8 0 0 1 3.5-.8 1.8 1.8 0 0 1 3.5.8c0 2.5-3.5 4.5-3.5 4.5z" /></>,
  doc: <><rect x="5" y="3" width="14" height="18" rx="2.5" /><path d="M9 8h6M9 12h6M9 16h4" /></>,
  whatsapp: <><path d="M4 20l1.3-4A8 8 0 1 1 8 19z" /><path d="M9 8.5c0 3.5 3 6.5 6.5 6.5l1-1.5-2-1-1 .8a4 4 0 0 1-2.3-2.3l.8-1-1-2z" /></>,
  mail: <><rect x="3" y="5" width="18" height="14" rx="3" /><path d="M4 7l8 6 8-6" /></>,
  telegram: <><path d="M21 4 3 11l6 2.5L19 7l-8 8 6.5 5z" /></>,
  globe: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" /></>,
  instagram: <><rect x="4" y="4" width="16" height="16" rx="5" /><circle cx="12" cy="12" r="3.5" /><circle cx="16.8" cy="7.2" r=".6" /></>,
  chevronRight: <><path d="M9 5l7 7-7 7" /></>,
  chevronDown: <><path d="M5 9l7 7 7-7" /></>,
  arrowLeft: <><path d="M15 5l-7 7 7 7" /></>,
  play: <><path d="M8 5v14l11-7z" fill="currentColor" /></>,
  check: <><path d="M5 12.5l4.5 4.5L19 7.5" /></>,
  x: <><path d="M6 6l12 12M18 6 6 18" /></>,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  logout: <><path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 8l-4 4 4 4M6 12h10" /></>,
  inbox: <><path d="M3 13l3-8h12l3 8v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><path d="M3 13h5l1.5 2.5h5L16 13h5" /></>,
  book: <><path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z" /><path d="M4 19V5M19 19v2H6" /></>,
  users: <><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M18 14a6 6 0 0 1 3.5 6" /></>,
  user: <><circle cx="12" cy="8" r="4" /><path d="M4.5 20a7.5 7.5 0 0 1 15 0" /></>,
  folder: <><path d="M3 7a2 2 0 0 1 2-2h4l2 2.5h8a2 2 0 0 1 2 2V18a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /></>,
  target: <><circle cx="12" cy="12" r="8.5" /><circle cx="12" cy="12" r="4.5" /><circle cx="12" cy="12" r=".8" fill="currentColor" /></>,
  link: <><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" /></>,
  star: <><path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8L3.5 9.7l5.9-.9z" /></>,
}

export default function Icon({ name, size = 24, stroke = 1.6, className, style }) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"
      className={className} style={style} aria-hidden="true"
    >
      {P[name]}
    </svg>
  )
}
