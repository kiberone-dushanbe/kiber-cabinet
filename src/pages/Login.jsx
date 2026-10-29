import { useState } from 'react'
import { supabase, loginToEmail } from '../supabase.js'
import logoMark from '../assets/kiber-logo-mark.svg'
import logoFull from '../assets/kiber-logo.svg'

export default function Login() {
  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
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
    <div className="login-page">
      <aside className="login-art">
        <div className="login-art-inner">
          <img src={logoMark} alt="KIBERone" className="login-logo" />
          <p className="tagline">Первая международная кибершкола<br />будущего для нового IT-поколения</p>
          <h2>Твои идеи<br />меняют мир!</h2>
          <p className="lead">Ты уже сделал первые шаги, и впереди — бесконечные возможности. Всё самое важное — в одном клике.</p>
          <ul className="features">
            <li>Видео и материалы каждого урока</li>
            <li>Сдавай задания и получай баллы</li>
            <li>Ответы тьютора и прогресс по модулю</li>
          </ul>
        </div>
      </aside>

      <div className="login-side">
        <form className="login" onSubmit={submit}>
          <img src={logoFull} alt="KIBERone" className="login-mobile-logo" />
          <h1>Вход в кабинет</h1>
          <p className="muted">Логин и пароль выдаёт тьютор</p>
          <label>Логин
            <input value={login} onChange={(e) => setLogin(e.target.value)} autoComplete="username" required autoFocus />
          </label>
          <label>Пароль
            <span className="field">
              <input
                type={show ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password" required
              />
              <button type="button" className="eye" onClick={() => setShow(!show)}>
                {show ? 'Скрыть' : 'Показать'}
              </button>
            </span>
          </label>
          {error && <div className="error">{error}</div>}
          <button className="btn btn-primary big" disabled={busy}>{busy ? 'Входим…' : 'Войти'}</button>
          <p className="muted small help">Забыл пароль? Напиши своему тьютору.</p>
        </form>
      </div>
    </div>
  )
}
