import { useState } from 'react'
import { supabase, loginToEmail } from '../supabase.js'

export default function Login() {
  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true); setError('')
    const { error } = await supabase.auth.signInWithPassword({
      email: loginToEmail(login),
      password,
    })
    setBusy(false)
    if (error) {
      setError(error.message.includes('Invalid login')
        ? 'Неверный логин или пароль'
        : 'Не удалось войти: ' + error.message)
    }
  }

  return (
    <div className="login-wrap">
      <form className="card login" onSubmit={submit}>
        <div className="corner" />
        <h1>Привет, кибергерой! 🚀</h1>
        <p className="muted">Войди, чтобы увидеть свои уроки и задания</p>
        <label>Логин
          <input value={login} onChange={(e) => setLogin(e.target.value)} autoComplete="username" required autoFocus />
        </label>
        <label>Пароль
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required />
        </label>
        {error && <div className="error">{error}</div>}
        <button className="btn btn-primary" disabled={busy}>{busy ? 'Входим…' : 'Войти'}</button>
        <p className="muted small">Логин и пароль выдаёт тьютор</p>
      </form>
    </div>
  )
}
