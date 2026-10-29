import { useEffect, useState } from 'react'
import { Link, NavLink, Routes, Route, Navigate } from 'react-router-dom'
import { supabase, STATUS, LOGIN_DOMAIN, youtubeId } from '../supabase.js'

export default function Tutor() {
  return (
    <>
      <nav className="tabs">
        <NavLink to="/tutor/submissions">📥 Работы</NavLink>
        <NavLink to="/tutor/lessons">📚 Уроки</NavLink>
        <NavLink to="/tutor/students">🧑‍🚀 Ученики</NavLink>
        <NavLink to="/tutor/groups">👥 Группы</NavLink>
      </nav>
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
      {rows?.length === 0 && <p className="muted">Пусто 🎉</p>}
      {rows?.map((r) => <SubmissionRow key={r.id} r={r} onDone={load} />)}
    </section>
  )
}

function SubmissionRow({ r, onDone }) {
  const [comment, setComment] = useState(r.tutor_comment || '')
  const [score, setScore] = useState(r.score ?? '')
  const [err, setErr] = useState('')
  const save = async (newStatus) => {
    const { error } = await supabase.from('submissions').update({
      status: newStatus, tutor_comment: comment || null, score: score === '' ? null : Number(score),
    }).eq('id', r.id)
    if (error) setErr(error.message); else onDone()
  }
  return (
    <div className="card sub-row">
      <div className="sub-head">
        <b>{r.profiles.full_name || r.profiles.login}</b>
        <span className="muted">{r.lessons?.modules?.title} → {r.lessons?.title}</span>
        <span className={`badge ${STATUS[r.status].cls}`}>{STATUS[r.status].label}</span>
      </div>
      <a href={r.project_url} target="_blank" rel="noreferrer" className="break">{r.project_url} ↗</a>
      {r.comment && <p className="pre">🗨 {r.comment}</p>}
      <div className="row">
        <input placeholder="Комментарий ученику" value={comment} onChange={(e) => setComment(e.target.value)} />
        <input className="w80" type="number" min="0" max="100" placeholder="Баллы" value={score} onChange={(e) => setScore(e.target.value)} />
        <button className="btn btn-primary" onClick={() => save('accepted')}>Принять</button>
        <button className="btn btn-ghost" onClick={() => save('revision')}>На доработку</button>
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
          <button className="btn btn-primary">+ Модуль</button>
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
        : <button className="btn btn-yellow" onClick={() => setAdding(true)}>+ Урок</button>}
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
        <span className="icons">{l.youtube_url && '🎬'}{l.materials_url && '📁'}{l.task && '🎯'}</span>
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
      <table className="table">
        <thead><tr><th>Логин</th><th>Имя</th><th>Группа</th><th>Роль</th><th>Работы</th></tr></thead>
        <tbody>
          {shown.map((r) => (
            <tr key={r.id}>
              <td><code>{r.login}</code></td>
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
              <td>{stats[r.id] ? `${stats[r.id].accepted} / ${stats[r.id].total}` : '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
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
        <button className="btn btn-primary">+ Группа</button>
      </form>
      <Err e={err} />
      {groups.map((g) => (
        <div key={g.id} className="card row">
          <input className="grow strong" defaultValue={g.name} onBlur={(e) => e.target.value !== g.name && save(g, { name: e.target.value })} />
          <input className="grow" defaultValue={g.schedule || ''} placeholder="Расписание" onBlur={(e) => e.target.value !== (g.schedule || '') && save(g, { schedule: e.target.value || null })} />
          <button className="btn btn-danger" onClick={() => del(g)}>Удалить</button>
        </div>
      ))}
    </section>
  )
}
