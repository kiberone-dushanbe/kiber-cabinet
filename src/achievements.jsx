import { useEffect, useRef, useState } from 'react'
import Icon from './icons.jsx'
import { STATS, PARENTS, AWARDS, REASONS, mapImg, practiceImg } from './kiberone.js'

/** «KIBERone в цифрах» — тёмная карточка с картой и жёлтыми цифрами */
export function Stats({ compact }) {
  return (
    <section className={`stats-card ${compact ? 'compact' : ''}`}>
      <img src={mapImg} alt="" className="stats-map" loading="lazy" />
      {!compact && (
        <div className="stats-head">
          <span className="pill">KIBERone в цифрах</span>
          <h3>Ты учишься в&nbsp;международной кибершколе</h3>
        </div>
      )}
      <ul className="stats">
        {STATS.map((s) => (
          <li key={s.label}>
            <img src={s.img} alt="" />
            <b>{s.value}</b>
            <span>{s.label}</span>
          </li>
        ))}
      </ul>
      {!compact && <p className="stats-foot"><Icon name="heart" size={18} /> {PARENTS}</p>}
    </section>
  )
}

/** Награды: лента сертификатов, по нажатию — сертификат на весь экран */
export function Awards() {
  const [open, setOpen] = useState(null)
  const dlg = useRef(null)
  useEffect(() => {
    if (open) dlg.current?.showModal()
    else dlg.current?.close()
  }, [open])

  return (
    <>
      <div className="awards" role="list">
        {AWARDS.map((a) => (
          <button key={a.note} type="button" role="listitem" className="award" onClick={() => setOpen(a)}>
            <span className="award-img"><img src={a.img} alt={`Сертификат: ${a.note}`} loading="lazy" /></span>
            <span className="award-note">{a.note}</span>
            <span className="award-t">{a.title}</span>
          </button>
        ))}
      </div>
      <dialog ref={dlg} className="lightbox" onClose={() => setOpen(null)} onClick={(e) => e.target === e.currentTarget && setOpen(null)}>
        {open && (
          <figure>
            <img src={open.img} alt={`Сертификат: ${open.note}`} />
            <figcaption>{open.title}</figcaption>
            <button type="button" className="round-btn close" onClick={() => setOpen(null)} aria-label="Закрыть"><Icon name="x" /></button>
          </figure>
        )}
      </dialog>
    </>
  )
}

/** 5 причин изучать цифровые технологии */
export function Reasons() {
  return (
    <ul className="reasons">
      {REASONS.map((r, i) => (
        <li key={r.title}>
          <img src={r.img} alt="" loading="lazy" />
          <span className="n">0{i + 1}</span>
          <span className="t">{r.title}</span>
        </li>
      ))}
    </ul>
  )
}

/** «80% практики, 20% теории» */
export function Practice() {
  return (
    <section className="card practice-card">
      <div>
        <span className="pill">Как устроены занятия</span>
        <h3>Учимся на практике</h3>
        <p>На каждом уроке ты сам создаёшь проект: игру, сайт, мультфильм или чат-бота. Теории — ровно столько, чтобы всё получилось.</p>
      </div>
      <img src={practiceImg} alt="80% практики, 20% теории" loading="lazy" />
    </section>
  )
}
