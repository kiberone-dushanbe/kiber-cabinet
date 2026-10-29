import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { supabase, youtubeId, STATUS } from '../supabase.js'
import { useAuth } from '../App.jsx'

export function YouTube({ url }) {
  const id = youtubeId(url)
  if (!id) return null
  return (
    <div className="video">
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${id}?rel=0`}
        title="Видео урока"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  )
}

export default function Lesson() {
  const { id } = useParams()
  const { profile } = useAuth()
  const [lesson, setLesson] = useState(undefined)
  const [sub, setSub] = useState(null)
  const [url, setUrl] = useState('')
  const [comment, setComment] = useState('')
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)
  const isStudent = profile.role === 'student'

  const load = async () => {
    const { data } = await supabase.from('lessons')
      .select('*, modules(title)').eq('id', id).maybeSingle()
    setLesson(data)
    if (isStudent) {
      const { data: s } = await supabase.from('submissions')
        .select('*').eq('lesson_id', id).eq('student_id', profile.id).maybeSingle()
      setSub(s)
      if (s) { setUrl(s.project_url); setComment(s.comment || '') }
    }
  }
  useEffect(() => { load() }, [id])

  const send = async (e) => {
    e.preventDefault()
    if (!/^https?:\/\//i.test(url.trim())) { setMsg('Вставь ссылку, начинающуюся с https://'); return }
    setBusy(true); setMsg('')
    const row = { lesson_id: Number(id), project_url: url.trim(), comment: comment.trim() || null }
    const { error } = sub
      ? await supabase.from('submissions').update(row).eq('id', sub.id)
      : await supabase.from('submissions').insert(row)
    setBusy(false)
    if (error) setMsg('Ошибка: ' + error.message)
    else { setMsg('Готово! Работа отправлена тьютору ✅'); load() }
  }

  if (lesson === undefined) return <div className="center muted">Загрузка…</div>
  if (lesson === null) return <div className="card">Урок не найден. <Link to="/">На главную</Link></div>

  return (
    <article className="lesson">
      <Link to="/" className="back">← Все уроки</Link>
      <p className="muted">{lesson.modules?.title}</p>
      <h1>{lesson.title}</h1>
      {lesson.description && <p className="pre">{lesson.description}</p>}

      <YouTube url={lesson.youtube_url} />
      {lesson.youtube_url && (
        <p className="small"><a href={lesson.youtube_url} target="_blank" rel="noreferrer">Видео не грузится? Открыть на YouTube ↗</a></p>
      )}

      {lesson.materials_url && (
        <a className="btn btn-yellow big" href={lesson.materials_url} target="_blank" rel="noreferrer">
          📁 Материалы урока (Google Диск)
        </a>
      )}

      {lesson.task && (
        <section className="card task">
          <div className="corner" />
          <h2>🎯 Задание</h2>
          <p className="pre">{lesson.task}</p>

          {isStudent && (
            <>
              {sub && (
                <div className="sub-status">
                  Статус: <span className={`badge ${STATUS[sub.status].cls}`}>{STATUS[sub.status].label}</span>
                  {sub.score != null && <> · Баллы: <b>{sub.score}</b></>}
                  {sub.tutor_comment && <div className="tutor-comment">💬 Тьютор: {sub.tutor_comment}</div>}
                </div>
              )}
              {sub?.status !== 'accepted' && (
                <form onSubmit={send} className="stack">
                  <label>Ссылка на проект (Google Диск, Scratch, Roblox, GitHub…)
                    <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://drive.google.com/..." required />
                  </label>
                  <p className="muted small">В Google Диске: «Поделиться» → «Все, у кого есть ссылка» → скопировать ссылку.</p>
                  <label>Комментарий (необязательно)
                    <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={2} />
                  </label>
                  <button className="btn btn-primary" disabled={busy}>
                    {busy ? 'Отправляем…' : sub ? 'Отправить заново' : 'Сдать работу'}
                  </button>
                </form>
              )}
              {msg && <div className="note">{msg}</div>}
            </>
          )}
        </section>
      )}
    </article>
  )
}
