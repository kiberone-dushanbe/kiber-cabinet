import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabase.js'
import { useAuth, TopBar } from '../App.jsx'
import { PageSkeleton } from '../ui.jsx'
import Icon from '../icons.jsx'
import { YouTube } from './Lesson.jsx'
import { BalanceCard, PayCard, Banners } from './Extra.jsx'
import { DEMO_GROUP_INFO, CONTACTS } from '../demo.js'
import { moduleImage } from '../kiberone.js'
import { Stats, Awards, Reasons, Practice } from '../achievements.jsx'
import { currentIndex, pickModule } from '../progress.js'

const QUICK = [
  { icon: 'heart', label: 'Оставить отзыв', to: '/news' },
  { icon: 'userPlus', label: 'Пригласить друга', to: '/balance#earn' },
  { icon: 'handHeart', label: 'Спасибо тьютору', to: '/works' },
  { icon: 'doc', label: 'Мои работы', to: '/works' },
]

export default function Home() {
  const { profile } = useAuth()
  const [modules, setModules] = useState(null)
  const [subs, setSubs] = useState({})
  const [error, setError] = useState('')
  const [moduleId, setModuleId] = useState(null)

  useEffect(() => {
    (async () => {
      const [m, s] = await Promise.all([
        supabase.from('modules')
          .select('id, title, description, position, lessons(id, title, position, task, youtube_url, materials_url)')
          .order('position').order('id'),
        supabase.from('submissions').select('lesson_id, status, score'),
      ])
      if (m.error || s.error) { setError((m.error || s.error).message); return }
      m.data.forEach((mod) => mod.lessons.sort((a, b) => a.position - b.position || a.id - b.id))
      setModules(m.data)
      setSubs(Object.fromEntries(s.data.map((x) => [x.lesson_id, x])))
    })()
  }, [])

  // Модуль по умолчанию — первый, где есть непринятые задания
  const active = useMemo(() => {
    if (!modules?.length) return null
    if (moduleId) return modules.find((m) => m.id === moduleId)
    return pickModule(modules, subs)
  }, [modules, subs, moduleId])

  if (error) return <div className="error">Ошибка загрузки: {error}</div>
  if (!modules) return <PageSkeleton />

  const lessons = active?.lessons || []
  const cur = currentIndex(lessons, subs)
  const curLesson = lessons[cur]
  const schedule = profile.groups?.schedule || ''

  const moduleBlock = active && (
    <section className="card yellow module-card">
      <span className="pill">Ты проходишь модуль</span>
      <h3>{active.title}{active.description && <>. {active.description}</>}</h3>
      {curLesson?.youtube_url
        ? <YouTube url={curLesson.youtube_url} />
        : (
          <Link to={curLesson ? `/lesson/${curLesson.id}` : '#'} className="no-video" style={{ textDecoration: 'none' }}>
            <div>
              <span className="play"><Icon name="play" size={26} /></span>
              <b>{curLesson ? curLesson.title : 'Уроки скоро появятся'}</b>
            </div>
          </Link>
        )}
      {lessons.length > 0 && (
        <details>
          <summary>Подробнее <Icon name="chevronDown" /></summary>
          <ol className="lesson-list">
            {lessons.map((l, i) => {
              const st = subs[l.id]?.status
              return (
                <li key={l.id}>
                  <Link to={`/lesson/${l.id}`} className={i === cur ? 'cur' : ''}>
                    <span className="num">{i + 1}</span>
                    <span>{l.title}</span>
                    {st === 'accepted' && <span className="st ok"><Icon name="check" size={20} /></span>}
                    {st === 'revision' && <span className="st fix"><Icon name="x" size={18} /></span>}
                    {st === 'sent' && <span className="st wait"><Icon name="clock" size={18} /></span>}
                  </Link>
                </li>
              )
            })}
          </ol>
        </details>
      )}
    </section>
  )

  return (
    <div className="fade-up home">
      <TopBar />

      {/* Телефон и планшет: одна колонка в порядке h-*; ноутбук: слева основное, справа колонка, ниже — достижения */}
      <div className="home-layout">
        <div className="home-main">
          {/* 1. Кибероны + следующая оплата (как на главном экране приложения) */}
          <div className="hero-row h-hero">
            <BalanceCard />
            <PayCard />
          </div>

          {/* 3. Быстрые действия */}
          <div className="quick h-quick">
            {QUICK.map((q) => (
              <Link key={q.label} to={q.to} title={q.label} aria-label={q.label}>
                <span className="circle"><Icon name={q.icon} size={36} stroke={1.4} /></span>
                <span className="lbl">{q.label}</span>
              </Link>
            ))}
          </div>

          {/* 4. IT-прогресс */}
          <section className="block progress-block h-progress">
            <h2 className="big-title">Смотри, это <br />твой IT-прогресс!</h2>

            {!profile.group_id && (
              <div className="card empty">
                <span className="big-ico"><Icon name="users" size={34} /></span>
                <h3>Ты пока не в группе</h3>
                <p>Попроси тьютора добавить тебя в группу — и здесь появятся уроки.</p>
              </div>
            )}
            {profile.group_id && !active && (
              <div className="card empty">
                <span className="big-ico"><Icon name="book" size={34} /></span>
                <h3>Уроков пока нет</h3>
                <p>Скоро тьютор добавит первый модуль.</p>
              </div>
            )}

            {active && modules.length > 1 && (
              <div className="module-switch">
                {modules.map((m) => (
                  <button key={m.id} className={`chip ${m.id === active.id ? 'active' : ''}`} onClick={() => setModuleId(m.id)}>{m.title}</button>
                ))}
              </div>
            )}

            <div className="two-cards">
              <Link to="/news" className="card topics">
                <span className="t">Темы текущего года в KIBERone</span>
                {active && <img src={moduleImage(active.title)} alt="" className="topics-img" />}
                <span className="more">Подробнее <Icon name="chevronRight" /></span>
              </Link>
              <Link to="/works" className="card center">
                <span className="ill"><Icon name="star" size={30} /></span>
                <span className="t">Портфолио</span>
              </Link>
            </div>

            <div className="progress-main">{moduleBlock}</div>

            {lessons.length > 0 && (
              <div className="timeline" aria-label="Уроки модуля">
                {lessons.map((l, i) => {
                  const st = subs[l.id]?.status
                  const kind = i < cur ? 'past' : i === cur ? 'current' : ''
                  return (
                    <Link key={l.id} to={`/lesson/${l.id}`} className={`tl-item ${kind} ${st === 'accepted' ? 'ok' : st === 'revision' ? 'fix' : ''}`} title={l.title}>
                      <span className="ttl">{l.title}</span>
                      <span className="mark">
                        {st === 'accepted' ? <Icon name="check" size={28} stroke={2} />
                          : st === 'revision' ? <Icon name="x" size={26} stroke={2} />
                          : st === 'sent' ? <Icon name="clock" size={26} stroke={2} />
                          : l.task ? <Icon name="target" size={26} stroke={1.8} /> : <Icon name="play" size={20} />}
                      </span>
                      <span><span className="n">{i + 1}</span><br /><span className="u">урок</span></span>
                    </Link>
                  )
                })}
              </div>
            )}
          </section>

        </div>

        <aside className="home-side">
          {/* 2. Не пропустите — отдельной строкой */}
          <section className="block h-banners">
            <div className="section-title">
              <h2>Не пропустите</h2>
              <Link to="/news">Все <Icon name="chevronRight" size={20} /></Link>
            </div>
            <Banners />
          </section>

          {/* 5. Место, время, тьютор */}
          <div className="info-stack h-info">
            <div className="info-card">
              <span className="pill">Место обучения</span>
              <span className="val">{DEMO_GROUP_INFO.location}</span>
            </div>
            <div className="info-card">
              <span className="pill">День и время обучения</span>
              <span className="val"><span>{profile.groups?.name || '—'}</span>{schedule && <span>{schedule}</span>}</span>
            </div>
            <div className="info-card">
              <span className="pill">Твой тьютор</span>
              <span className="val">{DEMO_GROUP_INFO.tutor}</span>
            </div>
          </div>

          {/* 7. Контакты */}
          <div className="contacts h-contacts">
            {CONTACTS.map((c) => (
              <a key={c.icon} href={c.href} target="_blank" rel="noreferrer" title={c.label} aria-label={c.label}>
                <Icon name={c.icon} size={30} stroke={1.6} />
              </a>
            ))}
          </div>
        </aside>

          {/* 6. Достижения KIBERone — с главной страницы kiber-one.tj */}
          <section className="block about h-about">
            <h2 className="big-title">Ты — часть <br />большой IT-семьи</h2>
            <Stats />
            <div className="section-title">
              <h2>Награды KIBERone</h2>
            </div>
            <Awards />
            <div className="section-title">
              <h2>Зачем изучать IT</h2>
            </div>
            <Reasons />
            <Practice />
          </section>

      </div>
    </div>
  )
}
