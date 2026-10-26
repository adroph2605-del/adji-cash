import { useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Briefcase, Check, Eye, EyeOff, Loader2, Mail, Phone, User, X, Zap } from 'lucide-react'
import { Field, Tabs, cx, inp } from '../components/ui.jsx'
import { CountUp, Slideshow, Typewriter } from '../components/motion.jsx'
import { useStore } from '../store.jsx'
import { useT } from '../i18n/index.js'
import { api } from '../services/api.js'
import { AUTH_SLIDES } from '../data/images.js'
import { EMAIL, PHONE_DISPLAY, PHONE_TEL } from '../data/contact.js'
import { BRAND } from '../data/brand.js'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const STAT_VALUES = [98, 3, 90]
const LEVEL_COLORS = ['', 'bg-crimson', 'bg-crimson', 'bg-amber', 'bg-emerald', 'bg-spark']

function strength(p) {
  const s = [p.length >= 8, /[A-Z]/.test(p), /[0-9]/.test(p), /[^A-Za-z0-9]/.test(p), p.length >= 12].filter(Boolean).length
  return p ? Math.max(1, s) : 0
}

const GoogleG = () => (
  <svg viewBox="0 0 48 48" width="18" height="18" aria-hidden="true">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
  </svg>
)

export default function Auth() {
  const nav = useNavigate()
  const t = useT()
  const { lang, setLang, loginSession } = useStore()
  const [params] = useSearchParams()
  const resetToken = params.get('reset')
  const [mode, setMode] = useState(resetToken ? 'newpw' : 'signin')
  const [role, setRole] = useState('personal')
  const [f, setF] = useState({ name: '', email: '', pw: '', pw2: '' })
  const [show, setShow] = useState(false)
  const [busy, setBusy] = useState(false)
  const [sent, setSent] = useState(false)
  const [touched, setTouched] = useState({})
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }))
  const blur = (k) => () => setTouched((p) => ({ ...p, [k]: true }))
  const emailOk = EMAIL_RE.test(f.email)
  const sc = strength(f.pw)
  const mismatch = f.pw2 && f.pw !== f.pw2
  const valid = useMemo(
    () =>
      mode === 'newpw'
        ? sc >= 3 && f.pw === f.pw2
        : mode === 'reset'
          ? emailOk
          : mode === 'signin'
            ? emailOk && f.pw.length > 0
            : emailOk && f.name.trim() && sc >= 3 && f.pw === f.pw2,
    [mode, emailOk, f, sc],
  )
  const showConfirm = mode === 'signup' || mode === 'newpw'

  const submit = async (e) => {
    e.preventDefault()
    setTouched({ email: 1, pw: 1, name: 1 })
    setError('')
    setNotice('')
    if (!valid) return
    setBusy(true)
    try {
      if (mode === 'reset') {
        await api('/auth/forgot', { method: 'POST', body: { email: f.email } })
        setSent(true)
      } else if (mode === 'newpw') {
        await api('/auth/reset', { method: 'POST', body: { token: resetToken, password: f.pw } })
        setF((p) => ({ ...p, pw: '', pw2: '' }))
        setMode('signin')
        setNotice(t('auth.pwUpdated'))
      } else {
        // Login or Register — backend returns { token, user }
        const data = await api(mode === 'signin' ? '/auth/login' : '/auth/register', {
          method: 'POST',
          body: { name: f.name, email: f.email, password: f.pw, type: role },
        })
        // Isolate session: clear previous user data, load this user's data
        await loginSession(data.token, data.user)
        nav('/overview')
      }
    } catch (ex) {
      setError(ex.message)
    } finally {
      setBusy(false)
    }
  }

  const google = () => {
    setNotice('')
    setError(t('auth.googleSoon'))
  }

  const switchMode = (m) => {
    setMode(m)
    setSent(false)
    setTouched({})
    setError('')
    setNotice('')
  }

  const levels = t('auth.levels')

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Mobile photo banner */}
      <Slideshow images={AUTH_SLIDES} dots={false} className="h-44 lg:hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-black/30" />
        <div className="relative z-10 flex h-full flex-col justify-end p-5 text-white">
          <p className="text-xl font-extrabold">
            <Typewriter key={lang} phrases={t('auth.headlines')} />
          </p>
        </div>
      </Slideshow>

      {/* Desktop photo panel */}
      <Slideshow images={AUTH_SLIDES} className="hidden lg:block">
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/35 to-black/85" />
        <div className="pointer-events-none absolute -left-24 top-20 h-96 w-96 animate-float rounded-full bg-spark/20 blur-[110px]" />
        <div className="relative z-10 flex h-full flex-col justify-between p-12 text-white">
          <Link to="/landing" className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-spark text-black">
              <Zap size={20} strokeWidth={2.8} />
            </span>
            <b className="text-lg">{BRAND}</b>
          </Link>
          <div>
            <h2 className="min-h-[7.5rem] max-w-md text-4xl font-extrabold leading-tight tracking-tight">
              <Typewriter key={lang} phrases={t('auth.headlines')} />
            </h2>
            <div className="mt-8 grid max-w-md grid-cols-3 divide-x divide-white/20">
              {STAT_VALUES.map((n, i) => (
                <div key={i} className="px-4 first:pl-0">
                  <p className="num text-3xl font-extrabold text-spark">
                    <CountUp to={n} suffix={t('stats.units')[i + 1]} />
                  </p>
                  <p className="mt-1 text-xs leading-snug text-white/70">{t('auth.stats')[i]}</p>
                </div>
              ))}
            </div>
            <div className="mt-8 flex max-w-md flex-wrap gap-2.5">
              {t('auth.chips').map((c, i) => (
                <span
                  key={c}
                  className={cx(
                    'inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3.5 py-2 text-xs font-semibold backdrop-blur',
                    ['bob', 'bob-2', 'bob-3'][i % 3],
                  )}
                >
                  <Check size={13} className="text-spark" />
                  {c}
                </span>
              ))}
            </div>
          </div>
          <p className="flex flex-wrap items-center gap-x-5 gap-y-1 pb-4 text-xs text-white/70">
            <a href={`mailto:${EMAIL}`} className="inline-flex items-center gap-1.5 hover:text-white">
              <Mail size={13} />
              {EMAIL}
            </a>
            <a href={`tel:${PHONE_TEL}`} className="num inline-flex items-center gap-1.5 hover:text-white">
              <Phone size={13} />
              {PHONE_DISPLAY}
            </a>
          </p>
        </div>
      </Slideshow>

      <div className="flex items-center justify-center bg-onyx p-6 lg:order-last">
        <div className="w-full max-w-md py-4">
          <div className="mb-6 flex items-center justify-between">
            <Link to="/landing" className="inline-flex items-center gap-1.5 text-sm font-semibold text-mute hover:text-ink">
              <ArrowLeft size={15} />
              {t('auth.back')}
            </Link>
            <div className="flex rounded-lg border border-line p-0.5 text-xs font-bold">
              {['SW', 'ENG'].map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  aria-pressed={lang === l}
                  className={cx('rounded-md px-2 py-1', lang === l ? 'bg-spark text-black' : 'text-mute')}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight">
            {t({ signin: 'auth.welcome', signup: 'auth.create', reset: 'auth.reset', newpw: 'auth.newpw' }[mode])}
          </h1>
          <p className="mt-1 text-sm text-mute">{t('auth.sub.' + mode)}</p>

          {(mode === 'signin' || mode === 'signup') && !sent && (
            <>
              <button
                type="button"
                onClick={google}
                disabled={busy}
                className="mt-7 flex w-full items-center justify-center gap-3 rounded-xl border border-black/10 bg-white py-3 text-sm font-bold text-neutral-800 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md disabled:opacity-70"
              >
                <GoogleG />
                {t(mode === 'signin' ? 'auth.google.in' : 'auth.google.up')}
              </button>
              <div className="my-5 flex items-center gap-3 text-xs text-mute">
                <span className="h-px flex-1 bg-ink/10" />
                {t('auth.or')}
                <span className="h-px flex-1 bg-ink/10" />
              </div>
            </>
          )}

          {sent ? (
            <div className="mt-8 rounded-2xl border border-spark/30 bg-spark/10 p-6 text-sm">
              <p className="font-bold">{t('auth.checkInbox')}</p>
              <p className="mt-1 text-mute">{t('auth.sentTo', { email: f.email })}</p>
              <button className="mt-4 font-semibold text-accent" onClick={() => switchMode('signin')}>
                {t('auth.backSignin')}
              </button>
            </div>
          ) : (
            <form onSubmit={submit} noValidate className={cx('space-y-4', (mode === 'reset' || mode === 'newpw') && 'mt-8')}>
              {mode === 'signup' && (
                <>
                  <Tabs
                    tabs={[
                      ['personal', t('auth.personal')],
                      ['business', t('auth.business')],
                    ]}
                    value={role}
                    onChange={setRole}
                    className="w-full [&>button]:flex-1"
                  />
                  <Field label={role === 'business' ? t('auth.nameBiz') : t('auth.nameFull')}>
                    <div className="relative">
                      {role === 'business' ? (
                        <Briefcase size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-mute" />
                      ) : (
                        <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-mute" />
                      )}
                      <input
                        className={cx(inp, 'pl-9')}
                        value={f.name}
                        onChange={set('name')}
                        onBlur={blur('name')}
                        autoComplete="name"
                      />
                    </div>
                    {touched.name && !f.name.trim() && (
                      <p className="mt-1 text-xs text-crimson">{t('auth.nameErr')}</p>
                    )}
                  </Field>
                </>
              )}

              {mode !== 'newpw' && (
                <Field label={t('auth.email')}>
                  <input
                    type="email"
                    className={cx(inp, touched.email && f.email && !emailOk && 'border-crimson/60')}
                    value={f.email}
                    onChange={set('email')}
                    onBlur={blur('email')}
                    autoComplete="email"
                    placeholder="you@example.com"
                  />
                  {f.email && (
                    <p className={cx('mt-1 flex items-center gap-1 text-xs', emailOk ? 'text-emerald' : 'text-crimson')}>
                      {emailOk ? (
                        <>
                          <Check size={12} />
                          {t('auth.emailOk')}
                        </>
                      ) : (
                        <>
                          <X size={12} />
                          {t('auth.emailBad')}
                        </>
                      )}
                    </p>
                  )}
                </Field>
              )}

              {mode !== 'reset' && (
                <Field label={t('auth.pw')}>
                  <div className="relative">
                    <input
                      type={show ? 'text' : 'password'}
                      className={cx(inp, 'pr-10')}
                      value={f.pw}
                      onChange={set('pw')}
                      autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                    />
                    <button
                      type="button"
                      aria-label={show ? t('auth.pwHide') : t('auth.pwShow')}
                      onClick={() => setShow((s) => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-mute hover:text-ink"
                    >
                      {show ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {showConfirm && f.pw && (
                    <div className="mt-2">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <span
                            key={i}
                            className={cx('h-1.5 flex-1 rounded-full', i <= sc ? LEVEL_COLORS[sc] : 'bg-ink/10')}
                          />
                        ))}
                      </div>
                      <p className="mt-1 text-xs text-mute">
                        {t('auth.strength')}: <b className="text-ink">{levels[sc]}</b> · {t('auth.pwHint')}
                      </p>
                    </div>
                  )}
                </Field>
              )}

              {showConfirm && (
                <Field label={t('auth.confirm')}>
                  <input
                    type={show ? 'text' : 'password'}
                    className={cx(inp, mismatch && 'border-crimson/60')}
                    value={f.pw2}
                    onChange={set('pw2')}
                    autoComplete="new-password"
                  />
                  {f.pw2 && (
                    <p className={cx('mt-1 flex items-center gap-1 text-xs', mismatch ? 'text-crimson' : 'text-emerald')}>
                      {mismatch ? (
                        <>
                          <X size={12} />
                          {t('auth.nomatch')}
                        </>
                      ) : (
                        <>
                          <Check size={12} />
                          {t('auth.match')}
                        </>
                      )}
                    </p>
                  )}
                </Field>
              )}

              {mode === 'signin' && (
                <button type="button" onClick={() => switchMode('reset')} className="text-sm font-semibold text-accent">
                  {t('auth.forgot')}
                </button>
              )}

              {error && (
                <p role="alert" className="rounded-xl bg-crimson/10 px-3 py-2 text-sm text-crimson">
                  {error}
                </p>
              )}
              {notice && (
                <p role="status" className="rounded-xl bg-spark/10 px-3 py-2 text-sm text-accent">
                  {notice}
                </p>
              )}

              <button
                disabled={busy}
                className={cx(
                  'flex w-full items-center justify-center gap-2 rounded-xl bg-[#B6FF2E] py-3 font-bold text-black transition-all hover:-translate-y-0.5',
                  !valid && 'opacity-60',
                )}
              >
                {busy && <Loader2 size={17} className="animate-spin" />}
                {t('auth.btn.' + mode)}
              </button>
            </form>
          )}

          {mode !== 'newpw' && (
            <p className="mt-6 text-center text-sm text-mute">
              {mode === 'signin' ? (
                <>
                  {t('auth.new')}{' '}
                  <button className="font-semibold text-accent" onClick={() => switchMode('signup')}>
                    {t('auth.createLink')}
                  </button>
                </>
              ) : (
                <>
                  {t('auth.have')}{' '}
                  <button className="font-semibold text-accent" onClick={() => switchMode('signin')}>
                    {t('auth.signinLink')}
                  </button>
                </>
              )}
            </p>
          )}

          <p className="mt-4 text-center text-xs text-mute">
            {t('auth.help')}{' '}
            <a className="font-semibold text-ink hover:text-accent" href={`mailto:${EMAIL}`}>
              {EMAIL}
            </a>{' '}
            ·{' '}
            <a className="num font-semibold text-ink hover:text-accent" href={`tel:${PHONE_TEL}`}>
              {PHONE_DISPLAY}
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}