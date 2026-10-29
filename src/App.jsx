import { Component, createContext, useCallback, useContext, useEffect, useState } from 'react'
import { Routes, Route, Navigate, Link, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { supabase, configured } from './supabase.js'
import { Avatar, PageSkeleton, ToastProvider } from './ui.jsx'
import Icon from './icons.jsx'
import { CONTACTS } from './demo.js'
import logoMark from './assets/kiber-logo-mark.svg'
import Login from './pages/Login.jsx'
import { Balance, Shop, News, Payment } from './pages/Extra.jsx'
import Home from './pages/Home.jsx'
import Lesson from './pages/Lesson.jsx'
import Works from './pages/Works.jsx'
import Tutor from './pages/Tutor.jsx'
import Check from './pages/Check.jsx'

const AuthCtx = createContext(null)
export const useAuth = () => useContext(AuthCtx)

function useAuthState() {
  const [session, setSession] = useState(undefined) // undefined = загрузка
  const [profile, setProfile] = useState(null)
  const [pending, setPending] = useState(0) // работ на проверке — для тьютора

  useEffect(() => {
    if (!configured) { setSession(null); return }
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => sub.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!session) { setProfile(null); return }
    supabase
      .from('profiles')
      .select('*, groups(name, schedule)')
      .eq('id', session.user.id)
      .single()
      .then(({ data }) => setProfile(data))
  }, [session])

  const refreshPending = useCallback(async () => {
    const { count } = await supabase.from('submissions').select('id', { count: 'exact', head: true }).eq('status', 'sent')
    setPending(count || 0)
  }, [])
  useEffect(() => { if (profile?.role === 'tutor') refreshPending() }, [profile, refreshPending])

  return { session, profile, pending, refreshPending, loading: session === undefined || (session && !profile) }
}

export function Logo({ text = 'личный кабинет' }) {
  return (
    <Link to="/" className="logo" aria-label="KIBERone — на главную">
      <img src={logoMark} alt="KIBERone" className="logo-img" />
      {text && <span className="logo-text">{text}</span>}
    </Link>
  )
}

function navItems(profile, pending) {
  if (profile?.role === 'tutor') {
    return [
      { to: '/tutor/submissions', icon: 'inbox', label: 'Работы', count: pending },
      { to: '/tutor/lessons', icon: 'book', label: 'Уроки' },
      { to: '/tutor/students', icon: 'user', label: 'Ученики' },
      { to: '/tutor/groups', icon: 'users', label: 'Группы' },
    ]
  }
  return [
    { to: '/', icon: 'home', label: 'Главная', end: true },
    { to: '/balance', icon: 'kiberon', label: 'Баланс' },
    { to: '/shop', icon: 'basket', label: 'КИБЕРшоп' },
    { to: '/news', icon: 'megaphone', label: <>Новости<br />и акции</> },
    { to: '/payment', icon: 'wallet', label: 'Оплата' },
  ]
}

/** Чёрная нижняя панель, как в приложении */
function TabBar() {
  const { profile, pending } = useAuth()
  if (!profile) return null
  return (
    <nav className="tabbar" aria-label="Разделы">
      {navItems(profile, pending).map((i) => (
        <NavLink key={i.to} to={i.to} end={i.end}>
          <Icon name={i.icon} size={26} stroke={1.4} />
          <span>{i.label}</span>
          {i.count > 0 && <span className="count">{i.count}</span>}
        </NavLink>
      ))}
    </nav>
  )
}

/** Верх страницы: аватар, «Привет!», имя и круглые кнопки */
export function TopBar() {
  const { profile } = useAuth()
  const nav = useNavigate()
  const logout = async () => { await supabase.auth.signOut(); nav('/login') }
  const name = profile?.full_name || profile?.login || ''
  const isTutor = profile?.role === 'tutor'
  return (
    <div className="topbar">
      <div className="me">
        <Avatar name={name} size="xl" />
        <div className="hello">
          <b>Привет! 👋</b>
          <span>{name}{isTutor && ' · тьютор'}</span>
        </div>
      </div>
      <Logo text="" />
      <div className="actions">
        {!isTutor && <a className="round-btn phone" href={CONTACTS[0].href} title="Позвонить в KIBERone" aria-label="Позвонить"><Icon name="phone" /></a>}
        {!isTutor && <Link className="round-btn" to="/news" title="Новости и акции" aria-label="Уведомления"><Icon name="bell" /><span className="dot" /></Link>}
        <button className="round-btn" onClick={logout} title="Выйти" aria-label="Выйти"><Icon name="logout" /></button>
      </div>
    </div>
  )
}

function Protected({ children, tutorOnly }) {
  const { session, profile, loading } = useAuth()
  if (session === null) return <Navigate to="/login" replace />
  if (loading) return <PageSkeleton />
  if (tutorOnly && profile?.role !== 'tutor') return <Navigate to="/" replace />
  return children
}

function HomeSwitch() {
  const { profile } = useAuth()
  return profile?.role === 'tutor' ? <Navigate to="/tutor" replace /> : <Home />
}

/** Если страница упала — показываем ошибку вместо белого экрана */
class ErrorBoundary extends Component {
  state = { error: null }
  static getDerivedStateFromError(error) { return { error } }
  render() {
    if (!this.state.error) return this.props.children
    return (
      <div className="card">
        <h2>Что-то пошло не так</h2>
        <p className="muted">Обнови страницу. Если ошибка повторяется — передай этот текст тьютору:</p>
        <pre className="error pre">{String(this.state.error?.message || this.state.error)}</pre>
        <button className="btn btn-dark" onClick={() => location.reload()}>Обновить</button>
      </div>
    )
  }
}

function ScrollTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

export default function App() {
  const auth = useAuthState()
  const { pathname } = useLocation()

  useEffect(() => {
    document.body.classList.toggle('has-tabbar', Boolean(auth.profile))
  }, [auth.profile])

  if (!configured) {
    return (
      <div className="page">
        <div className="card">
          <h2>Не настроено подключение к Supabase</h2>
          <p>Создайте файл <code>.env</code> по образцу <code>.env.example</code> и перезапустите сборку.</p>
          <p><Link to="/check">Страница проверки связи</Link></p>
        </div>
        <Routes><Route path="/check" element={<Check />} /></Routes>
      </div>
    )
  }

  // Экран входа — на всю страницу, без шапки
  if (pathname === '/login') {
    return (
      <AuthCtx.Provider value={auth}>
        <ToastProvider>
          {auth.session ? <Navigate to="/" replace /> : <Login />}
        </ToastProvider>
      </AuthCtx.Provider>
    )
  }

  return (
    <AuthCtx.Provider value={auth}>
      <ToastProvider>
        <ScrollTop />
        <TabBar />
        <main className="page">
          <ErrorBoundary key={pathname}>
          <Routes>
            <Route path="/check" element={<Check />} />
            <Route path="/" element={<Protected><HomeSwitch /></Protected>} />
            <Route path="/lesson/:id" element={<Protected><Lesson /></Protected>} />
            <Route path="/works" element={<Protected><Works /></Protected>} />
            <Route path="/balance" element={<Protected><Balance /></Protected>} />
            <Route path="/shop" element={<Protected><Shop /></Protected>} />
            <Route path="/news" element={<Protected><News /></Protected>} />
            <Route path="/payment" element={<Protected><Payment /></Protected>} />
            <Route path="/tutor/*" element={<Protected tutorOnly><Tutor /></Protected>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          </ErrorBoundary>
        </main>
      </ToastProvider>
    </AuthCtx.Provider>
  )
}
