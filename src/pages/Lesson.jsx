import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { supabase, youtubeId, STATUS } from '../supabase.js'
import { useAuth } from '../App.jsx'
import { Skeleton, timeAgo, useToast } from '../ui.jsx'
import Icon from '../icons.jsx'

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

const STATUS_ICON = {
  accepted: <span className="st ok"><Icon name="check" size={20} /></span>,
  sent: <span className="st wait"><Icon name="clock" size={18} /></span>,
  revision: <span className="st fix"><Icon name="x" size={18} /></span>,
}

export default function Lesson() {
  const { id } = useParams()
  const { profile } = useAuth()
  const toast = useToast()
  const [lesson, setLesson] = useState(undefined)
  const [siblings, setSiblings] = useState([])
  const [mySubs, setMySubs] = useState({})
  const [sub, setSub] = useState(null)
  const [url, setUrl] = useState('')
  const [comment, setComment] = useState('')
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)
  const [editing, setEditing] = useState(false)
  const isStudent = profile.role === 'student'

  const load = async () => {
    const { data } = await supabase.from('lessons')
      .select('*, modules(id, title, lessons(id, title, position, task, published))').eq('id', id).maybeSingle()
    setLesson(data)
    const sib = (data?.modules?.lessons || [])
      .filter((l) => l.published || !isStudent)
      .sort((a, b) => a.position - b.position || a.id - b.id)
    setSiblings(sib)
    if (isStudent) {
      const { data: s } = await supabase.from('submissions')
        .select('*').eq('student_id', profile.id).in('lesson_id', sib.map((l) => l.id))
      const map = Object.fromEntries((s || []).map((x) => [x.lesson_id, x]))
      setMySubs(map)
      const cur = map[id] || null
      setSub(cur)
      setUrl(cur?.project_url || ''); setComment(cur?.comment || '')
      setEditing(!cur)
    }
  }
  useEffect(() => { setLesson(undefined); setMsg(''); load() }, [id])

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
    else { toast('Работа отправлена тьютору'); load() }
  }

  if (lesson === undefined) {
    return (
      <div className="lesson-layout">
        <div className="stack"><Skeleton h={140} /><Skeleton h={380} /></div>
        <div className="stack"><Skeleton h={260} /><Skeleton h={200} /></div>
      </div>
    )
  }
  if (lesson === null) {
    return <div className="card empty"><span className="big-ico"><Icon name="book" size={34} /></span><h2>Урок не найден</h2><Link to="/" className="btn btn-dark">На главную</Link></div>
  }

  const idx = siblings.findIndex((l) => String(l.id) === String(id))
  const prev = siblings[idx - 1]
  const next = siblings[idx + 1]
  const st = sub && STATUS[sub.status]

  return (
    <article className="fade-up">
      <div className="page-head">
        <Link to={isStudent ? '/' : '/tutor/lessons'} className="back" aria-label="Назад"><Icon name="arrowLeft" /></Link>
        <span className="muted">{lesson.modules?.title}</span>
      </div>

      <div className="lesson-layout">
        <div className="lesson-main">
          <header className="card yellow lesson-hero">
            <span className="pill">Урок {idx + 1} из {siblings.length}</span>
            <h1>{lesson.title}</h1>
            {lesson.description && <p className="pre">{lesson.description}</p>}
          </header>

          <YouTube url={lesson.youtube_url} />
          {lesson.youtube_url && (
            <p className="yt-link"><a href={lesson.youtube_url} target="_blank" rel="noreferrer">Видео не грузится? Открыть на YouTube ↗</a></p>
          )}

          {lesson.materials_url && (
            <a className="materials" href={lesson.materials_url} target="_blank" rel="noreferrer">
              <span className="ic"><Icon name="folder" /></span>
              <span><b>Материалы урока</b><span className="muted small">Презентация и файлы в Google Диске</span></span>
              <span className="go"><Icon name="chevronRight" /></span>
            </a>
          )}

          {!lesson.youtube_url && !lesson.materials_url && !lesson.description && (
            <div className="card empty"><span className="big-ico"><Icon name="folder" size={34} /></span><p>К этому уроку пока нет материалов</p></div>
          )}

          <div className="pager">
            {prev && <Link to={`/lesson/${prev.id}`}><small>← Предыдущий</small><b>{prev.title}</b></Link>}
            {next && <Link to={`/lesson/${next.id}`} className="next"><small>Следующий →</small><b>{next.title}</b></Link>}
          </div>
        </div>

        <aside className="lesson-aside">
          {lesson.task && (
            <section className="card task">
              <span className="pill">Задание</span>
              <h2 style={{ marginTop: '.8rem' }}>Что нужно сделать</h2>
              <p className="pre">{lesson.task}</p>

              {isStudent && (
                <>
                  {sub && (
                    <div className="sub-status">
                      <div className="line">
                        <span className={`badge ${st.cls}`}>{st.label}</span>
                        {sub.score != null && <span className="score">{sub.score}<small>баллов</small></span>}
                      </div>
                      {sub.tutor_comment && <div className="tutor-comment"><b>Комментарий тьютора</b>{sub.tutor_comment}</div>}
                      <div className="sent-link"><Icon name="link" size={18} /> <a href={sub.project_url} target="_blank" rel="noreferrer">{sub.project_url}</a></div>
                      <span className="muted small">Отправлено {timeAgo(sub.updated_at)}</span>
                    </div>
                  )}

                  {sub?.status === 'accepted' && (
                    <div className="success-box">Задание принято! Так держать</div>
                  )}

                  {sub && sub.status !== 'accepted' && !editing && (
                    <button className="btn btn-dark" style={{ width: '100%' }} onClick={() => setEditing(true)}>
                      {sub.status === 'revision' ? 'Исправить и отправить' : 'Изменить ссылку'}
                    </button>
                  )}

                  {sub?.status !== 'accepted' && editing && (
                    <form onSubmit={send} className="stack">
                      <label>Ссылка на проект
                        <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://drive.google.com/..." required />
                      </label>
                      <p className="muted small" style={{ marginTop: '.4rem' }}>Google Диск, Scratch, Roblox, GitHub… В Google Диске: «Поделиться» → «Все, у кого есть ссылка».</p>
                      <label>Комментарий <span className="muted">(необязательно)</span>
                        <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={2} placeholder="Что получилось, что было сложно?" />
                      </label>
                      <div className="row">
                        <button className="btn btn-primary grow" disabled={busy}>
                          {busy ? 'Отправляем…' : sub ? 'Отправить заново' : 'Сдать работу'}
                        </button>
                        {sub && <button type="button" className="btn btn-ghost" onClick={() => setEditing(false)}>Отмена</button>}
                      </div>
                    </form>
                  )}
                  {msg && <div className="error">{msg}</div>}
                </>
              )}
            </section>
          )}

          {siblings.length > 1 && (
            <section className="card">
              <h3>{lesson.modules?.title}</h3>
              <ol className="lesson-list">
                {siblings.map((l, i) => (
                  <li key={l.id}>
                    <Link to={`/lesson/${l.id}`} className={String(l.id) === String(id) ? 'cur' : ''}>
                      <span className="num">{i + 1}</span>
                      <span>{l.title}</span>
                      {STATUS_ICON[mySubs[l.id]?.status]}
                    </Link>
                  </li>
                ))}
              </ol>
            </section>
          )}
        </aside>
      </div>
    </article>
  )
}
