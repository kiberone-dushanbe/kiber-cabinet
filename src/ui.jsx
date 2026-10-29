import { createContext, useCallback, useContext, useState } from 'react'

/** Инициалы из имени или логина: «Али Иванов» → «АИ», «ali» → «AL» */
export function initials(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length >= 2) return parts[0][0] + parts[1][0]
  return (parts[0] || '?').slice(0, 2)
}

/** Стабильный цвет аватара по строке */
const AVATAR_COLORS = [
  ['#05B9BE', '#1C556E'], ['#F7C90E', '#E08A00'], ['#7C5CFF', '#4B2FBF'],
  ['#2FB36A', '#16743F'], ['#FF6B6B', '#B8323A'], ['#3D8BFD', '#1C4FA8'],
]
export function Avatar({ name, size }) {
  let h = 0
  for (const c of name || '') h = (h * 31 + c.charCodeAt(0)) >>> 0
  const [a, b] = AVATAR_COLORS[h % AVATAR_COLORS.length]
  return (
    <span className={`avatar ${size || ''}`} style={{ background: `linear-gradient(135deg, ${a}, ${b})` }} aria-hidden>
      {initials(name)}
    </span>
  )
}

export function Skeleton({ h = 80, w = '100%', style }) {
  return <div className="skel" style={{ height: h, width: w, ...style }} />
}

export function PageSkeleton() {
  return (
    <div className="stack" aria-busy="true" aria-label="Загрузка">
      <Skeleton h={80} w="60%" />
      <div className="two-cards">{[0, 1].map((i) => <Skeleton key={i} h={200} />)}</div>
      <div className="lesson-grid">{[0, 1, 2, 3, 4, 5].map((i) => <Skeleton key={i} h={120} />)}</div>
    </div>
  )
}

export function ProgressRing({ value, size = 150, stroke = 12, label }) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const pct = Math.max(0, Math.min(1, value || 0))
  return (
    <div className="ring" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,.2)" strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#F7C90E" strokeWidth={stroke}
          strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - pct)}
        />
      </svg>
      <div className="val"><div><b>{Math.round(pct * 100)}%</b><span>{label}</span></div></div>
    </div>
  )
}

/** «5 мин назад», «вчера», «12 окт» */
export function timeAgo(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  const diff = (Date.now() - d.getTime()) / 1000
  if (diff < 60) return 'только что'
  if (diff < 3600) return `${Math.floor(diff / 60)} мин назад`
  if (diff < 86400) return `${Math.floor(diff / 3600)} ч назад`
  if (diff < 172800) return 'вчера'
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
}

/** Склонение: plural(5, 'урок', 'урока', 'уроков') */
export function plural(n, one, few, many) {
  const m10 = n % 10, m100 = n % 100
  if (m10 === 1 && m100 !== 11) return one
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few
  return many
}

/* ---------- Toast ---------- */
const ToastCtx = createContext(() => {})
export const useToast = () => useContext(ToastCtx)

export function ToastProvider({ children }) {
  const [items, setItems] = useState([])
  const push = useCallback((text, type = 'ok') => {
    const id = Math.random()
    setItems((xs) => [...xs, { id, text, type }])
    setTimeout(() => setItems((xs) => xs.filter((x) => x.id !== id)), 3500)
  }, [])
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="toasts" role="status" aria-live="polite">
        {items.map((t) => <div key={t.id} className={`toast ${t.type === 'err' ? 'err' : ''}`}>{t.text}</div>)}
      </div>
    </ToastCtx.Provider>
  )
}
