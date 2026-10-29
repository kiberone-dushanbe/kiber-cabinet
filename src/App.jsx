import { createContext, useContext, useEffect, useState } from 'react'
import { Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom'
import { supabase, configured } from './supabase.js'
import Login from './pages/Login.jsx'
import Home from './pages/Home.jsx'
import Lesson from './pages/Lesson.jsx'
import Tutor from './pages/Tutor.jsx'
import Check from './pages/Check.jsx'

const AuthCtx = createContext(null)
export const useAuth = () => useContext(AuthCtx)

function useAuthState() {
  const [session, setSession] = useState(undefined) // undefined = загрузка
  const [profile, setProfile] = useState(null)

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
      .select('*, groups(name)')
      .eq('id', session.user.id)
      .single()
      .then(({ data }) => setProfile(data))
  }, [session])

  return { session, profile, loading: session === undefined || (session && !profile) }
}

function Header() {
  const { profile } = useAuth()
  const nav = useNavigate()
  const logout = async () => { await supabase.auth.signOut(); nav('/login') }
  return (
    <header className="header">
      <Link to="/" className="logo">
        <span className="k">K</span><span className="i">1</span><span className="b">B</span>
        <span className="e">E</span><span className="r">R</span><span className="one">one</span>
        <small>личный кабинет</small>
      </Link>
      {profile && (
        <div className="header-right">
          {profile.role === 'tutor' && <Link to="/tutor" className="btn btn-ghost">Панель тьютора</Link>}
          <span className="me">
            {profile.full_name || profile.login}
            {profile.groups?.name && <em> · {profile.groups.name}</em>}
          </span>
          <button className="btn btn-ghost" onClick={logout}>Выйти</button>
        </div>
      )}
    </header>
  )
}

function Protected({ children, tutorOnly }) {
  const { session, profile, loading } = useAuth()
  if (session === null) return <Navigate to="/login" replace />
  if (loading) return <div className="center muted">Загрузка…</div>
  if (tutorOnly && profile?.role !== 'tutor') return <Navigate to="/" replace />
  return children
}

function HomeSwitch() {
  const { profile } = useAuth()
  return profile?.role === 'tutor' ? <Navigate to="/tutor" replace /> : <Home />
}

export default function App() {
  const auth = useAuthState()

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

  return (
    <AuthCtx.Provider value={auth}>
      <Header />
      <main className="page">
        <Routes>
          <Route path="/check" element={<Check />} />
          <Route path="/login" element={auth.session ? <Navigate to="/" replace /> : <Login />} />
          <Route path="/" element={<Protected><HomeSwitch /></Protected>} />
          <Route path="/lesson/:id" element={<Protected><Lesson /></Protected>} />
          <Route path="/tutor/*" element={<Protected tutorOnly><Tutor /></Protected>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <footer className="footer">KIBERone · <Link to="/check">проверка связи</Link></footer>
    </AuthCtx.Provider>
  )
}
