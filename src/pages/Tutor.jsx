import { useEffect, useState } from 'react'
import { Link, Routes, Route, Navigate } from 'react-router-dom'
import { supabase, STATUS, LOGIN_DOMAIN, youtubeId } from '../supabase.js'
import { useAuth, TopBar } from '../App.jsx'
import Icon from '../icons.jsx'
import { Avatar, Skeleton, timeAgo, useToast, plural } from '../ui.jsx'

function TutorHero() {
  const { profile, pending } = useAuth()
  const [s, setS] = useState({ students: 0, groups: 0, accepted: 0 })
  useEffect(() => {
    (async () => {
      const head = { count: 'exact', head: true }
      const [st, gr, ac] = await Promise.all([
        supabase.from('profiles').select('id', head).eq('role', 'student'),
        supabase.from('groups').select('id', head),
        supabase.from('submissions').select('id', head).eq('status', 'accepted'),
      ])
      setS({ students: st.count || 0, groups: gr.count || 0, accepted: ac.count || 0 })
    })()
  }, [])
  return (
    <div className="fade-up">
      <TopBar />
      <div className="tstats">
        <div className="tstat y"><b>{pending}</b><span>{plural(pending, 'работа ждёт', 'работы ждут', 'работ ждут')} проверки</span></div>
        <div className="tstat"><b>{s.students}</b><span>учеников</span></div>
        <div className="tstat"><b>{s.groups}</b><span>групп</span></div>
        <div className="tstat"><b>{s.accepted}</b><span>принято работ</span></div>
      </div>
    </div>
  )
}

export default function Tutor() {
  return (
    <>
      <TutorHero />
      <Routes>
        <Route path="submissions" element={<Submissions />} />
        <Route path="lessons" element={<Lessons />} />
        <Route path="students" element={<Students />} />
        <Route path="groups" element={<Groups />} />
        <Route path="*" element={<Navigate to="submissions" replace />} />
      </Routes>
    </>
  )
}

const useGroups = () => {
  const [groups, setGroups] = useState([])
  const reload = () => supabase.from('groups').select('*').order('id').then(({ data }) => setGroups(data || []))
  useEffect(() => { reload() }, [])
  return [groups, reload]
}

function Err({ e }) { return e ? <div className="error">{e}</div> : null }

/* ------------------------- Работы ------------------------- */
function Submissions() {
  const [groups] = useGroups()
  const [rows, setRows] = useState(null)
  const [status, setStatus] = useState('sent')
  const [groupId, setGroupId] = useState('')
  const [err, setErr] = useState('')

  const load = async () => {
    let q = supabase.from('submissions')
      .select('*, profiles!inner(login, full_name, group_id), lessons(title, modules(title))')
      .order('updated_at', { ascending: false })
    if (status) q = q.eq('status', status)
    if (groupId) q = q.eq('profiles.group_id', groupId)
    const { data, error } = await q
    setErr(error?.message || ''); setRows(data || [])
  }
  useEffect(() => { load() }, [status, groupId])

  return (
    <section>
      <div className="toolbar">
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="sent">На проверке</option>
          <option value="revision">На доработке</option>
          <option value="accepted">Принятые</option>
          <option value="">Все</option>
        </select>
        <select value={groupId} onChange={(e) => setGroupId(e.target.value)}>
          <option value="">Все группы</option>
          {groups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
        </select>
      </div>
      <Err e={err} />
      {!rows && <div className="stack">{[0, 1, 2].map((i) => <Skeleton key={i} h={150} />)}</div>}
      {rows?.length === 0 && <div className="card empty"><span className="big-ico"><Icon name="check" size={34} /></span><p>Здесь пусто — всё проверено!</p></div>}
      {rows?.map((r) => <SubmissionRow key={r.id} r={r} onDone={load} />)}
    </section>
  )
}

function SubmissionRow({ r, onDone }) {
  const { refreshPending } = useAuth()
  const toast = useToast()
  const [comment, setComment] = useState(r.tutor_comment || '')
  const [score, setScore] = useState(r.score ?? '')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const name = r.profiles.full_name || r.profiles.login
  const save = async (newStatus) => {
    setBusy(true)
    const { error } = await supabase.from('submissions').update({
      status: newStatus, tutor_comment: comment || null, score: score === '' ? null : Number(score),
    }).eq('id', r.id)
    setBusy(false)
    if (error) { setErr(error.message); return }
    toast(newStatus === 'accepted' ? `Работа ${name} принята ✅` : `${name}: отправлено на доработку`)
    refreshPending(); onDone()
  }
  return (
    <div className={`card sub-row st-${r.status} fade-up`}>
      <span className="st-bar" />
      <div className="sub-head">
        <Avatar name={name} />
        <div className="who">
          <b>{name}</b>
          <span>{r.lessons?.modules?.title} → <Link to={`/lesson/${r.lesson_id}`}>{r.lessons?.title}</Link></span>
        </div>
        <span className={`badge ${STATUS[r.status].cls}`}>{STATUS[r.status].label}</span>
        <span className="when">{timeAgo(r.updated_at)}</span>
      </div>
      <a href={r.project_url} target="_blank" rel="noreferrer" className="project"><Icon name="link" size={18} /> Открыть проект <span>{r.project_url}</span></a>
      {r.comment && <p className="pre stu-comment">{r.comment}</p>}
      <div className="row">
        <input placeholder="Комментарий ученику" value={comment} onChange={(e) => setComment(e.target.value)} />
        <input className="w80" type="number" min="0" max="100" placeholder="Баллы" value={score} onChange={(e) => setScore(e.target.value)} />
        <button className="btn btn-primary" disabled={busy} onClick={() => save('accepted')}>Принять</button>
        <button className="btn btn-ghost" disabled={busy} onClick={() => save('revision')}>На доработку</button>
      </div>
      <Err e={err} />
    </div>
  )
}

/* ------------------------- Уроки ------------------------- */
function Lessons() {
  const [groups] = useGroups()
  const [groupId, setGroupId] = useState('')
  const [modules, setModules] = useState([])
  const [err, setErr] = useState('')
  const [newModule, setNewModule] = useState('')

  useEffect(() => { if (!groupId && groups[0]) setGroupId(String(groups[0].id)) }, [groups])

  const load = async () => {
    if (!groupId) return
    const { data, error } = await supabase.from('modules')
      .select('*, lessons(*)').eq('group_id', groupId).order('position').order('id')
    data?.forEach((m) => m.lessons.sort((a, b) => a.position - b.position || a.id - b.id))
    setErr(error?.message || ''); setModules(data || [])
  }
  useEffect(() => { load() }, [groupId])

  const addModule = async (e) => {
    e.preventDefault()
    const { error } = await supabase.from('modules')
      .insert({ group_id: Number(groupId), title: newModule, position: modules.length + 1 })
    if (error) setErr(error.message); else { setNewModule(''); load() }
  }

  if (groups.length === 0) return <p className="muted">Сначала создайте группу во вкладке «Группы».</p>

  return (
    <section>
      <div className="toolbar">
        <select value={groupId} onChange={(e) => setGroupId(e.target.value)}>
          {groups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
        </select>
        <form onSubmit={addModule} className="row">
          <input placeholder="Новый модуль, напр. «Roblox Studio»" value={newModule} onChange={(e) => setNewModule(e.target.value)} required />
          <button className="btn btn-dark">+ Модуль</button>
        </form>
      </div>
      <Err e={err} />
      {modules.map((m) => <ModuleEditor key={m.id} m={m} onChange={load} />)}
    </section>
  )
}

function ModuleEditor({ m, onChange }) {
  const [title, setTitle] = useState(m.title)
  const [position, setPosition] = useState(m.position)
  const [adding, setAdding] = useState(false)
  const [err, setErr] = useState('')
  const save = async () => {
    const { error } = await supabase.from('modules').update({ title, position: Number(position) }).eq('id', m.id)
    if (error) setErr(error.message); else onChange()
  }
  const del = async () => {
    if (!confirm(`Удалить модуль «${m.title}» вместе со всеми уроками и сданными работами?`)) return
    const { error } = await supabase.from('modules').delete().eq('id', m.id)
    if (error) setErr(error.message); else onChange()
  }
  return (
    <div className="card module-edit">
      <div className="row">
        <input className="w60" type="number" value={position} onChange={(e) => setPosition(e.target.value)} title="Порядок" />
        <input className="grow strong" value={title} onChange={(e) => setTitle(e.target.value)} />
        <button className="btn btn-ghost" onClick={save}>Сохранить</button>
        <button className="btn btn-danger" onClick={del}>Удалить</button>
      </div>
      <Err e={err} />
      {m.lessons.map((l) => <LessonEditor key={l.id} l={l} moduleId={m.id} onChange={onChange} />)}
      {adding
        ? <LessonEditor moduleId={m.id} position={m.lessons.length + 1} onChange={() => { setAdding(false); onChange() }} onCancel={() => setAdding(false)} />
        : <button className="btn btn-dark" style={{ marginTop: '.6rem' }} onClick={() => setAdding(true)}>+ Урок</button>}
    </div>
  )
}

const EMPTY = { title: '', description: '', youtube_url: '', materials_url: '', task: '', published: true }

function LessonEditor({ l, moduleId, position, onChange, onCancel }) {
  const isNew = !l
  const [open, setOpen] = useState(isNew)
  const [f, setF] = useState(l ? { ...EMPTY, ...l } : { ...EMPTY, position })
  const [err, setErr] = useState('')
  const set = (k) => (e) => setF({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value })

  const save = async (e) => {
    e.preventDefault()
    if (f.youtube_url && !youtubeId(f.youtube_url)) { setErr('Не похоже на ссылку YouTube'); return }
    const row = {
      module_id: moduleId, title: f.title, description: f.description || null,
      youtube_url: f.youtube_url || null, materials_url: f.materials_url || null,
      task: f.task || null, position: Number(f.position) || 0, published: f.published,
    }
    const { error } = isNew
      ? await supabase.from('lessons').insert(row)
      : await supabase.from('lessons').update(row).eq('id', l.id)
    if (error) setErr(error.message); else { setErr(''); if (!isNew) setOpen(false); onChange() }
  }
  const del = async () => {
    if (!confirm(`Удалить урок «${l.title}»?`)) return
    const { error } = await supabase.from('lessons').delete().eq('id', l.id)
    if (error) setErr(error.message); else onChange()
  }

  if (!open) {
    return (
      <div className="lesson-line">
        <span className="num">{l.position}</span>
        <span className="grow">{l.title} {!l.published && <em className="muted">(черновик)</em>}</span>
        <span className="icons">{l.youtube_url && <Icon name="play" size={16} />}{l.materials_url && <Icon name="folder" size={18} />}{l.task && <Icon name="target" size={18} />}</span>
        <Link to={`/lesson/${l.id}`} className="btn btn-ghost sm">Просмотр</Link>
        <button className="btn btn-ghost sm" onClick={() => setOpen(true)}>Изменить</button>
      </div>
    )
  }
  return (
    <form className="lesson-form" onSubmit={save}>
      <div className="row">
        <input className="w60" type="number" value={f.position} onChange={set('position')} title="Порядок" />
        <input className="grow" placeholder="Название урока" value={f.title} onChange={set('title')} required />
        <label className="check"><input type="checkbox" checked={f.published} onChange={set('published')} /> Опубликован</label>
      </div>
      <textarea rows={2} placeholder="Описание (необязательно)" value={f.description || ''} onChange={set('description')} />
      <input placeholder="Ссылка на YouTube" value={f.youtube_url || ''} onChange={set('youtube_url')} />
      <input placeholder="Ссылка на материалы в Google Диске" value={f.materials_url || ''} onChange={set('materials_url')} />
      <textarea rows={3} placeholder="Задание (если пусто — урок без сдачи)" value={f.task || ''} onChange={set('task')} />
      <Err e={err} />
      <div className="row">
        <button className="btn btn-primary">{isNew ? 'Добавить урок' : 'Сохранить'}</button>
        <button type="button" className="btn btn-ghost" onClick={() => (isNew ? onCancel() : setOpen(false))}>Отмена</button>
        {!isNew && <button type="button" className="btn btn-danger" onClick={del}>Удалить</button>}
      </div>
    </form>
  )
}

/* ------------------------- Ученики ------------------------- */
function Students() {
  const [groups] = useGroups()
  const [rows, setRows] = useState(null)
  const [stats, setStats] = useState({})
  const [filter, setFilter] = useState('')
  const [err, setErr] = useState('')

  const load = async () => {
    const [p, s] = await Promise.all([
      supabase.from('profiles').select('*').order('role', { ascending: false }).order('login'),
      supabase.from('submissions').select('student_id, status'),
    ])
    setErr(p.error?.message || s.error?.message || '')
    setRows(p.data || [])
    const st = {}
    for (const x of s.data || []) {
      st[x.student_id] ??= { accepted: 0, total: 0 }
      st[x.student_id].total++
      if (x.status === 'accepted') st[x.student_id].accepted++
    }
    setStats(st)
  }
  useEffect(() => { load() }, [])

  const update = async (id, patch) => {
    const { error } = await supabase.from('profiles').update(patch).eq('id', id)
    if (error) setErr(error.message); else load()
  }

  const shown = (rows || []).filter((r) => !filter || String(r.group_id) === filter || (filter === 'none' && !r.group_id))

  return (
    <section>
      <div className="card hint">
        <b>Как добавить ученика:</b> Supabase → Authentication → Users → <i>Add user → Create new user</i>.
        Email: <code>логин@{LOGIN_DOMAIN}</code>, пароль, галочка <i>Auto Confirm User</i>.
        Ученик появится здесь — назначьте ему группу и имя.
      </div>
      <div className="toolbar">
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="">Все</option>
          <option value="none">Без группы</option>
          {groups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
        </select>
      </div>
      <Err e={err} />
      <div className="table-wrap">
      <table className="table">
        <thead><tr><th>Логин</th><th>Имя</th><th>Группа</th><th>Роль</th><th>Принято / сдано</th></tr></thead>
        <tbody>
          {shown.map((r) => (
            <tr key={r.id}>
              <td><span className="person"><Avatar name={r.full_name || r.login} /><code>{r.login}</code></span></td>
              <td><NameCell r={r} onSave={(full_name) => update(r.id, { full_name })} /></td>
              <td>
                <select value={r.group_id || ''} onChange={(e) => update(r.id, { group_id: e.target.value ? Number(e.target.value) : null })}>
                  <option value="">—</option>
                  {groups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
                </select>
              </td>
              <td>
                <select value={r.role} onChange={(e) => update(r.id, { role: e.target.value })}>
                  <option value="student">ученик</option>
                  <option value="tutor">тьютор</option>
                </select>
              </td>
              <td>
                {stats[r.id]
                  ? <span className="mini-prog"><span className="progress"><div style={{ width: `${(stats[r.id].accepted / stats[r.id].total) * 100}%` }} /></span>{stats[r.id].accepted}/{stats[r.id].total}</span>
                  : <span className="muted">—</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </section>
  )
}

function NameCell({ r, onSave }) {
  const [v, setV] = useState(r.full_name || '')
  return <input value={v} onChange={(e) => setV(e.target.value)} onBlur={() => v !== (r.full_name || '') && onSave(v)} />
}

/* ------------------------- Группы ------------------------- */
function Groups() {
  const [groups, reload] = useGroups()
  const [counts, setCounts] = useState({})
  useEffect(() => {
    supabase.from('profiles').select('group_id').eq('role', 'student').then(({ data }) => {
      const c = {}
      for (const p of data || []) if (p.group_id) c[p.group_id] = (c[p.group_id] || 0) + 1
      setCounts(c)
    })
  }, [groups])
  const [name, setName] = useState('')
  const [schedule, setSchedule] = useState('')
  const [err, setErr] = useState('')

  const add = async (e) => {
    e.preventDefault()
    const { error } = await supabase.from('groups').insert({ name, schedule: schedule || null })
    if (error) setErr(error.message); else { setName(''); setSchedule(''); reload() }
  }
  const save = async (g, patch) => {
    const { error } = await supabase.from('groups').update(patch).eq('id', g.id)
    if (error) setErr(error.message); else reload()
  }
  const del = async (g) => {
    if (!confirm(`Удалить группу «${g.name}»? Модули и уроки группы тоже удалятся.`)) return
    const { error } = await supabase.from('groups').delete().eq('id', g.id)
    if (error) setErr(error.message); else reload()
  }

  return (
    <section>
      <form className="card row" onSubmit={add}>
        <input className="grow" placeholder="Название, напр. «Средняя · сб 12–14»" value={name} onChange={(e) => setName(e.target.value)} required />
        <input className="grow" placeholder="Расписание (необязательно)" value={schedule} onChange={(e) => setSchedule(e.target.value)} />
        <button className="btn btn-dark">+ Группа</button>
      </form>
      <Err e={err} />
      {groups.map((g) => (
        <div key={g.id} className="card group-card">
          <span className="gico"><Icon name="users" size={22} /></span>
          <input className="grow strong" defaultValue={g.name} onBlur={(e) => e.target.value !== g.name && save(g, { name: e.target.value })} />
          <input className="grow" defaultValue={g.schedule || ''} placeholder="Расписание" onBlur={(e) => e.target.value !== (g.schedule || '') && save(g, { schedule: e.target.value || null })} />
          <span className="cnt">{counts[g.id] || 0} {plural(counts[g.id] || 0, 'ученик', 'ученика', 'учеников')}</span>
          <button className="btn btn-danger" onClick={() => del(g)}>Удалить</button>
        </div>
      ))}
    </section>
  )
}
