import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase, STATUS } from '../supabase.js'
import { useAuth } from '../App.jsx'

export default function Home() {
  const { profile } = useAuth()
  const [modules, setModules] = useState(null)
  const [subs, setSubs] = useState({})
  const [error, setError] = useState('')

  useEffect(() => {
    (async () => {
      const [m, s] = await Promise.all([
        supabase.from('modules')
          .select('id, title, description, position, lessons(id, title, position, task)')
          .order('position').order('id'),
        supabase.from('submissions').select('lesson_id, status'),
      ])
      if (m.error || s.error) { setError((m.error || s.error).message); return }
      m.data.forEach((mod) => mod.lessons.sort((a, b) => a.position - b.position || a.id - b.id))
      setModules(m.data)
      setSubs(Object.fromEntries(s.data.map((x) => [x.lesson_id, x.status])))
    })()
  }, [])

  if (error) return <div className="error">Ошибка загрузки: {error}</div>
  if (!modules) return <div className="center muted">Загрузка…</div>

  if (!profile.group_id) {
    return <div className="card"><h2>Ты пока не в группе</h2><p>Попроси тьютора добавить тебя в группу — и здесь появятся уроки.</p></div>
  }

  const allLessons = modules.flatMap((m) => m.lessons)
  const withTask = allLessons.filter((l) => l.task)
  const accepted = withTask.filter((l) => subs[l.id] === 'accepted').length

  return (
    <>
      <section className="hero card">
        <div className="corner" />
        <h1>Привет, {profile.full_name || profile.login}!</h1>
        <div className="stats">
          <div><b>{allLessons.length}</b><span>уроков</span></div>
          <div><b>{accepted}/{withTask.length}</b><span>заданий принято</span></div>
          <div><b>{Object.values(subs).filter((s) => s === 'revision').length}</b><span>на доработку</span></div>
        </div>
        {withTask.length > 0 && (
          <div className="progress"><div style={{ width: `${(accepted / withTask.length) * 100}%` }} /></div>
        )}
      </section>

      {modules.length === 0 && <p className="muted">Уроков пока нет — скоро появятся!</p>}

      {modules.map((mod) => (
        <section key={mod.id} className="module">
          <h2 className="plate">{mod.title}</h2>
          {mod.description && <p className="muted">{mod.description}</p>}
          <div className="lesson-grid">
            {mod.lessons.map((l, i) => (
              <Link key={l.id} to={`/lesson/${l.id}`} className="lesson-card">
                <span className="num">{i + 1}</span>
                <span className="title">{l.title}</span>
                {l.task && (
                  subs[l.id]
                    ? <span className={`badge ${STATUS[subs[l.id]].cls}`}>{STATUS[subs[l.id]].label}</span>
                    : <span className="badge badge-todo">Есть задание</span>
                )}
              </Link>
            ))}
            {mod.lessons.length === 0 && <p className="muted">Уроки скоро появятся</p>}
          </div>
        </section>
      ))}
    </>
  )
}
