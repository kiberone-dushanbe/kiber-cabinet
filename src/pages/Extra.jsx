import { Link } from 'react-router-dom'
import Icon from '../icons.jsx'
import { TopBar } from '../App.jsx'
import { DEMO_BALANCE, DEMO_PAYMENT, DEMO_BANNERS, DEMO_NEWS, DEMO_SHOP } from '../demo.js'
import logoMark from '../assets/kiber-logo-mark.svg'

const fmtDate = (d) => new Date(d).toLocaleDateString('ru-RU')
const fmtNum = (n) => n.toLocaleString('ru-RU')
const PAY_STATUS = { paid: 'Оплачено', soon: 'Скоро оплата', overdue: 'Просрочено' }

/* ---------- блоки, которые используются и на главной ---------- */

export function BalanceCard() {
  return (
    <section className="card yellow balance-card">
      <div className="head">
        <span>На твоем счете<br />киберонов</span>
        <img src={logoMark} alt="" className="logo-img" />
      </div>
      <div className="amount"><span className="k-sign">K</span>{DEMO_BALANCE.amount}</div>
      <div className="btns">
        <Link to="/balance#earn" className="btn btn-white">Как заработать</Link>
        <Link to="/shop" className="btn btn-dark">КИБЕРшоп</Link>
      </div>
    </section>
  )
}

export function PayCard() {
  const p = DEMO_PAYMENT
  return (
    <section className="card outline-y pay-card">
      <span className="lbl">Следующая<br />оплата</span>
      <span className={`status ${p.status === 'paid' ? 'paid' : ''}`}>{PAY_STATUS[p.status]}</span>
      <span className="date">{fmtDate(p.date)}</span>
      <Link to="/payment" className="btn btn-yellow">Оплатить</Link>
    </section>
  )
}

export function Banners() {
  return (
    <>
      <div className="banners">
        {DEMO_BANNERS.map((b) => (
          <Link key={b.id} to="/news" className={`banner tone-${b.tone}`}>
            <span className="blob" />
            {b.img && <img src={b.img} alt="" className="banner-img" loading="lazy" />}
            <img src={logoMark} alt="" className="logo-img" />
            <span className="t">{b.title.split(' ').map((w) => <span key={w}>{w}</span>)}</span>
            <span className="s">{b.sub}</span>
          </Link>
        ))}
      </div>
      <div className="dots">{DEMO_BANNERS.map((b, i) => <span key={b.id} className={i === 0 ? 'on' : ''} />)}</div>
    </>
  )
}

function PageHead({ title }) {
  return (
    <div className="page-head">
      <Link to="/" className="back" aria-label="На главную"><Icon name="arrowLeft" /></Link>
      <h1>{title}</h1>
    </div>
  )
}

/* ---------- Баланс ---------- */
export function Balance() {
  return (
    <div className="fade-up">
      <PageHead title="Баланс" />
      <div className="home-grid balance-only">
        <BalanceCard />
        <section className="card" id="earn" style={{ margin: 0 }}>
          <h3>Как заработать</h3>
          <div className="list">
            {DEMO_BALANCE.howToEarn.map((e) => (
              <div key={e.title} className="list-row" style={{ background: '#fff' }}>
                <span className="ttl">{e.title}</span>
                <span className="amt plus">+{e.amount} K</span>
              </div>
            ))}
          </div>
        </section>
      </div>
      <div className="section-title"><h2>История</h2></div>
      <div className="list">
        {DEMO_BALANCE.history.map((h) => (
          <div key={h.id} className="list-row">
            <span className="ic"><Icon name="kiberon" size={22} /></span>
            <span className="ttl">{h.title}<small>{fmtDate(h.date)}</small></span>
            <span className={`amt ${h.amount > 0 ? 'plus' : 'minus'}`}>{h.amount > 0 ? '+' : ''}{fmtNum(h.amount)} K</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ---------- КИБЕРшоп ---------- */
export function Shop() {
  return (
    <div className="fade-up">
      <TopBar />
      <section className="shop-hero">
        <img src={logoMark} alt="" className="logo-img" />
        <b>НОВИНКИ 3.0</b>
        <span>Обменивай кибероны на фирменный мерч</span>
      </section>
      <div className="section-title">
        <h2>Новинки</h2>
        <span className="muted">У тебя <b>{fmtNum(DEMO_BALANCE.amount)} K</b></span>
      </div>
      <div className="products">
        {DEMO_SHOP.map((p) => (
          <div key={p.id} className="product">
            <div className={`img tone-${p.tone}`}>
              <div className="tags">
                {p.tags.includes('new') && <span className="tag new">Новинка</span>}
                {p.tags.includes('sale') && <span className="tag sale">Акция</span>}
              </div>
              <img src={logoMark} alt="" className="logo-img" />
            </div>
            <span className="name">{p.title}</span>
            <div className="price">
              <b>{fmtNum(p.price)} K</b>
              <button className="btn btn-yellow sm" disabled={p.price > DEMO_BALANCE.amount}>
                {p.price > DEMO_BALANCE.amount ? 'Не хватает' : 'Хочу'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ---------- Новости и акции ---------- */
export function News() {
  return (
    <div className="fade-up">
      <TopBar />
      <Banners />
      <div className="news">
        {DEMO_NEWS.map((n) => (
          <article key={n.id} className="news-card">
            <span className="pill grey">{fmtDate(n.date)}</span>
            <div className="body">
              <b>{n.title}</b>
              <div className={`thumb tone-${n.tone}`}>
                {n.img ? <img src={n.img} alt="" className="thumb-img" loading="lazy" /> : <img src={logoMark} alt="" className="logo-img" />}
              </div>
            </div>
            <details>
              <summary>Узнать подробности <Icon name="chevronDown" /></summary>
              <p>{n.text}</p>
            </details>
          </article>
        ))}
      </div>
    </div>
  )
}

/* ---------- Оплата ---------- */
export function Payment() {
  const p = DEMO_PAYMENT
  return (
    <div className="fade-up">
      <PageHead title="Оплата" />
      <div className="home-grid">
        <section className="card yellow balance-card">
          <div className="head"><span>Абонемент<br />на следующий месяц</span><img src={logoMark} alt="" className="logo-img" /></div>
          <div className="amount">{fmtNum(p.amount)}<span className="k-sign">₽</span></div>
          <div className="btns">
            <button className="btn btn-dark" style={{ gridColumn: '1 / -1' }}>Оплатить</button>
          </div>
        </section>
        <PayCard />
      </div>
      <div className="section-title"><h2>История платежей</h2></div>
      <div className="list">
        {p.history.map((h) => (
          <div key={h.id} className="list-row">
            <span className="ic"><Icon name="check" size={22} /></span>
            <span className="ttl">{h.title}<small>{fmtDate(h.date)}</small></span>
            <span className="amt">{fmtNum(h.amount)} ₽</span>
          </div>
        ))}
      </div>
    </div>
  )
}
