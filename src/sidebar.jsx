import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { supabase } from './supabase.js'
import Icon from './icons.jsx'
import { DEMO_GROUP_INFO } from './demo.js'
import { currentIndex, pickModule } from './progress.js'

/** true, если экран подходит под media-запрос (и следит за изменением размера окна) */
export function useMedia(query) {
  const [ok, setOk] = useState(() => window.matchMedia(query).matches)
  useEffect(() => {
    const m = window.matchMedia(query)
    const on = () => setOk(m.matches)
    m.addEventListener('change', on)
    return () => m.removeEventListener('change', on)
  }, [query])
  return ok
}

/** Прогресс ученика для бокового меню. Обновляется при переходе между страницами
    (например, после отправки задания). Загружается только когда enabled. */
export function useLearning(enabled) {
  const { pathname } = useLocation()
  const [data, setData] = useState(null)
  useEffect(() => {
    if (!enabled) return
    let alive = true
    Promise.all([
      supabase.from('modules').select('id, title, position, lessons(id, title, position, task)').order('position').order('id'),
      supabase.from('submissions').select('lesson_id, status'),
    ]).then(([m, s]) => {
      if (!alive || m.error || s.error) return
      m.data.forEach((mod) => mod.lessons.sort((a, b) => a.position - b.position || a.id - b.id))
      const subs = Object.fromEntries(s.data.map((x) => [x.lesson_id, x]))
      const active = pickModule(m.data, subs)
      const lessons = active?.lessons || []
      const tasks = lessons.filter((l) => l.task)
      const cur = currentIndex(lessons, subs)
      setData({
        module: active,
        lesson: lessons[cur],
        lessonNo: cur + 1,
        lessonsTotal: lessons.length,
        done: tasks.filter((l) => subs[l.id]?.status === 'accepted').length,
        tasksTotal: tasks.length,
        revision: s.data.filter((x) => x.status === 'revision').length,
      })
    })
    return () => { alive = false }
  }, [enabled, pathname])
  return data
}

/** Карточка «Моё обучение» в боковом меню */
export function SideLearning({ data, profile }) {
  if (!data?.module) return null
  const pct = data.tasksTotal ? Math.round((data.done / data.tasksTotal) * 100) : 0
  const schedule = profile.groups?.schedule
  return (
    <section className="side-only side-learn" aria-label="Моё обучение">
      <span className="side-learn-pill">Ты проходишь</span>
      <b className="side-learn-title" title={data.module.title}>{data.module.title}</b>
      <div className="side-learn-bar" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
        <div style={{ width: `${pct}%` }} />
      </div>
      <span className="side-learn-meta">
        Урок {data.lessonNo} из {data.lessonsTotal}
        {data.tasksTotal > 0 && <> · принято {data.done}/{data.tasksTotal}</>}
      </span>
      {schedule && (
        <span className="side-learn-when"><Icon name="clock" size={16} /> {schedule} · {DEMO_GROUP_INFO.location}</span>
      )}
      {data.lesson && (
        <Link to={`/lesson/${data.lesson.id}`} className="side-learn-go">
          Продолжить урок <Icon name="chevronRight" size={18} />
        </Link>
      )}
    </section>
  )
}
