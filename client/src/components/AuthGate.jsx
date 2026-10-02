import { useEffect, useState } from 'react'
import { getSession, login, logout } from '../api'
import wordmark from '../assets/sipori-wordmark.png'
import leftStar from '../assets/login 1.png'
import rightStar from '../assets/login 2.png'

export default function AuthGate({ children }) {
  const [state, setState] = useState('checking')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  useEffect(() => {
    let active = true
    const expire = () => { setState('logged-out'); setPassword(''); setError('Your session ended. Please log in again.') }
    window.addEventListener('sipori:unauthorized', expire)
    getSession().then(session => {
      if (active) setState(session.authenticated ? 'authenticated' : 'logged-out')
    }).catch(() => {
      if (active) { setState('logged-out'); setError('Could not reach the server. Check the connection and try logging in.') }
    })
    const recheck = () => {
      if (document.visibilityState === 'visible') getSession().then(session => {
        if (active && !session.authenticated) setState('logged-out')
      }).catch(() => { if (active) setState('logged-out') })
    }
    document.addEventListener('visibilitychange', recheck)
    const interval = setInterval(recheck, 60000)
    return () => { active = false; clearInterval(interval); window.removeEventListener('sipori:unauthorized', expire); document.removeEventListener('visibilitychange', recheck) }
  }, [])
  async function submit(event) {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      await login(username, password)
      if (!(await getSession()).authenticated) throw new Error('Your browser could not save the login session. Check the site’s cookie settings.')
      setPassword('')
      setState('authenticated')
    } catch (caught) { setError(caught.message) }
    finally { setBusy(false) }
  }
  async function leave() {
    setBusy(true)
    setError('')
    try { await logout(); setState('logged-out'); setPassword('') }
    catch { setError('Could not log out. Check your connection and try again.') }
    finally { setBusy(false) }
  }
  if (state === 'checking') return <main className="login-page"><p role="status">Opening Sipori…</p></main>
  if (state === 'authenticated') return <>
    <div className="owner-session"><button type="button" onClick={leave} disabled={busy}>{busy ? 'Logging out…' : 'Log out'}</button>{error && <p role="alert">{error}</p>}</div>
    {children}
  </>
  return <main className="login-page">
    <div className="login-scene">
    <img className="login-star login-star-left" src={leftStar} alt="" aria-hidden="true" />
    <img className="login-star login-star-right" src={rightStar} alt="" aria-hidden="true" />
    <form className="login-card" onSubmit={submit}>
      <img className="login-wordmark" src={wordmark} alt="Sipori" />
      <h1>A little space for your sips.</h1>
      <p>Log in to open your personal café journal.</p>
      <label htmlFor="owner-username">Username</label>
      <input id="owner-username" name="username" autoComplete="username" autoCapitalize="none" spellCheck={false} maxLength={128} value={username} onChange={event => setUsername(event.target.value)} required disabled={busy} />
      <label htmlFor="owner-password">Password</label>
      <input id="owner-password" name="password" type="password" autoComplete="current-password" maxLength={1024} value={password} onChange={event => setPassword(event.target.value)} required disabled={busy} />
      {error && <p className="login-error" role="alert">{error}</p>}
      <button type="submit" disabled={busy}>{busy ? 'Logging in…' : 'Log in'}</button>
    </form>
    </div>
  </main>
}
