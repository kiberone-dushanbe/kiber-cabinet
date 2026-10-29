import { useEffect, useState } from 'react'
import { SUPABASE_URL, SUPABASE_KEY, configured } from '../supabase.js'

// Тестовое видео для проверки встраивания (можно поменять на своё)
const TEST_VIDEO = 'jNQXAC9IVRw'
const TIMEOUT = 10000

const withTimeout = (p) =>
  Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error('таймаут 10 с')), TIMEOUT))])

// Картинка грузится без CORS — простой способ проверить, доступен ли домен
const imageProbe = (src) => withTimeout(new Promise((res, rej) => {
  const img = new Image()
  img.onload = res
  img.onerror = () => rej(new Error('не загрузилось'))
  img.src = `${src}${src.includes('?') ? '&' : '?'}t=${Date.now()}`
}))

const CHECKS = [
  {
    name: 'База данных (Supabase)',
    critical: true,
    run: async () => {
      if (!configured) throw new Error('не настроен .env')
      const r = await withTimeout(fetch(`${SUPABASE_URL}/rest/v1/rpc/ping`, {
        method: 'POST',
        headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json' },
        body: '{}',
      }))
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      const t = await r.json()
      if (t !== 'ok') throw new Error('неожиданный ответ')
    },
  },
  {
    name: 'Вход (Supabase Auth)',
    critical: true,
    run: async () => {
      if (!configured) throw new Error('не настроен .env')
      const r = await withTimeout(fetch(`${SUPABASE_URL}/auth/v1/health`, { headers: { apikey: SUPABASE_KEY } }))
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
    },
  },
  { name: 'YouTube (превью видео)', run: () => imageProbe(`https://i.ytimg.com/vi/${TEST_VIDEO}/mqdefault.jpg`) },
  { name: 'YouTube (плеер)', run: () => imageProbe('https://www.youtube-nocookie.com/favicon.ico') },
  { name: 'Google Диск', run: () => imageProbe('https://drive.google.com/favicon.ico') },
]

export default function Check() {
  const [res, setRes] = useState({})

  const runAll = () => {
    setRes({})
    CHECKS.forEach(async (c) => {
      const t0 = performance.now()
      try {
        await c.run()
        setRes((r) => ({ ...r, [c.name]: { ok: true, ms: Math.round(performance.now() - t0) } }))
      } catch (e) {
        setRes((r) => ({ ...r, [c.name]: { ok: false, err: e.message } }))
      }
    })
  }
  useEffect(runAll, [])

  const done = Object.keys(res).length === CHECKS.length
  const allOk = done && Object.values(res).every((r) => r.ok)

  return (
    <section className="card check">
      <div className="corner" />
      <h1>Проверка связи</h1>
      <p className="muted">Откройте эту страницу с телефона и с домашнего Wi-Fi — так сразу видно, работает ли кабинет у ученика.</p>
      <table className="table">
        <tbody>
          {CHECKS.map((c) => {
            const r = res[c.name]
            return (
              <tr key={c.name}>
                <td>{c.name}{c.critical && <em className="muted"> · обязательно</em>}</td>
                <td>{!r ? '⏳ проверяем…' : r.ok ? `✅ ${r.ms} мс` : `❌ ${r.err}`}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
      {done && <div className={allOk ? 'note' : 'error'}>{allOk ? 'Всё работает 🎉' : 'Есть проблемы — сделайте скриншот и отправьте тьютору'}</div>}
      <button className="btn btn-primary" onClick={runAll}>Проверить ещё раз</button>
      <h2>Тест плеера</h2>
      <p className="muted small">Если видео ниже запускается — уроки с YouTube будут работать.</p>
      <div className="video">
        <iframe src={`https://www.youtube-nocookie.com/embed/${TEST_VIDEO}`} title="Тест" allowFullScreen />
      </div>
      <p className="muted small">{navigator.userAgent}</p>
    </section>
  )
}
