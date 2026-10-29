import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { supabase, STATUS } from '../supabase.js'
import { useAuth } from '../App.jsx'
import { Skeleton, timeAgo } from '../ui.jsx'
import Icon from '../icons.jsx'

const ORDER = { revision: 0, sent: 1, accepted: 2 }

export default function Works() {
  const { profile } = useAuth()
  const [rows, setRows] = useState(null)
  const [err, setErr] = useState('')

  useEffect(() => {
    supabase.from('submissions')
      .select('*, lessons(id, title, modules(title))')
      .eq('student_id', profile.id)
      .order('updated_at', { ascending: false })
      .then(({ data, error }) => {
        setErr(error?.message || '')
        setRows((data || []).sort((a, b) => ORDER[a.status] - ORDER[b.status]))
      })
  }, [profile.id])

  if (profile.role === 'tutor') return <Navigate to="/tutor/submissions" replace />
  if (err) return <div className="error">{err}</div>
  if (!rows) return <div className="stack">{[0, 1, 2].map((i) => <Skeleton key={i} h={110} />)}</div>

  const total = rows.reduce((a, r) => a + (r.score || 0), 0)

  return (
    <div className="fade-up">
      <div className="page-head">
        <Link to="/" className="back" aria-label="На главную"><Icon name="arrowLeft" /></Link>
        <h1>Портфолио</h1>
      </div>
      <div className="tstats">
        <div className="tstat y"><b>{rows.length}</b><span>работ сдано</span></div>
        <div className="tstat"><b>{rows.filter((r) => r.status === 'accepted').length}</b><span>принято</span></div>
        <div className="tstat"><b>{rows.filter((r) => r.status === 'revision').length}</b><span>на доработку</span></div>
        <div className="tstat"><b>{total}</b><span>баллов</span></div>
      </div>

      {rows.length === 0 && (
        <div className="card empty">
          <span className="big-ico"><Icon name="star" size={34} /></span>
          <h2>Пока ничего не сдано</h2>
          <p>Открой урок с заданием и отправь ссылку на свой проект.</p>
          <Link to="/" className="btn btn-dark">К урокам</Link>
        </div>
      )}

      {rows.map((r) => (
        <Link key={r.id} to={`/lesson/${r.lesson_id}`} className={`card sub-row st-${r.status}`} style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
          <span className="st-bar" />
          <div className="sub-head">
            <div className="who">
              <b>{r.lessons?.title}</b>
              <span>{r.lessons?.modules?.title}</span>
            </div>
            <span className={`badge ${STATUS[r.status].cls}`}>{STATUS[r.status].label}</span>
            {r.score != null && <span className="score">{r.score}<small>баллов</small></span>}
            <span className="when">{timeAgo(r.updated_at)}</span>
          </div>
          {r.tutor_comment && <div className="tutor-comment"><b>Комментарий тьютора</b>{r.tutor_comment}</div>}
        </Link>
      ))}
    </div>
  )
}
