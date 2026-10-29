import { createClient } from '@supabase/supabase-js'

export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
export const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY
export const LOGIN_DOMAIN = import.meta.env.VITE_LOGIN_DOMAIN || 'kiber.one'

export const configured = Boolean(SUPABASE_URL && SUPABASE_KEY)

export const supabase = configured
  ? createClient(SUPABASE_URL, SUPABASE_KEY)
  : null

/** «ali» → «ali@kiber.one»; если ввели полный email — оставляем как есть */
export const loginToEmail = (login) => {
  const l = login.trim().toLowerCase()
  return l.includes('@') ? l : `${l}@${LOGIN_DOMAIN}`
}

/** Достаёт id видео из любых вариантов ссылки YouTube */
export function youtubeId(url) {
  if (!url) return null
  try {
    const u = new URL(url.trim())
    if (u.hostname.includes('youtu.be')) return u.pathname.slice(1).split('/')[0] || null
    if (u.searchParams.get('v')) return u.searchParams.get('v')
    const m = u.pathname.match(/\/(embed|shorts|live|v)\/([\w-]{6,})/)
    return m ? m[2] : null
  } catch {
    return /^[\w-]{11}$/.test(url.trim()) ? url.trim() : null
  }
}

export const STATUS = {
  sent: { label: 'На проверке', cls: 'badge-wait' },
  accepted: { label: 'Принято', cls: 'badge-ok' },
  revision: { label: 'На доработку', cls: 'badge-fix' },
}
