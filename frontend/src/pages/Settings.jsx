import { useEffect, useState } from 'react'
import { Link2, Lock, Monitor, Smartphone } from 'lucide-react'
import { useStore } from '../store.jsx'
import { useT } from '../i18n/index.js'
import { Badge, Card, Field, PageHeader, Tabs, Toggle, btnGhost, btnPrimary, cx, inp } from '../components/ui.jsx'

const TABS = [
  ['profile', 'Profile'],
  ['security', 'Security'],
  ['notifications', 'Notifications'],
  ['regional', 'Currency & region'],
  ['banks', 'Bank connections'],
]

const Row = ({ title, desc, children }) => (
  <div className="flex items-center justify-between gap-4 border-b border-line py-4 last:border-0">
    <div>
      <p className="text-sm font-semibold">{title}</p>
      {desc && <p className="text-xs text-mute">{desc}</p>}
    </div>
    {children}
  </div>
)

export default function Settings() {
  const { user, notify, theme, toggleTheme, lang, setLang } = useStore()
  const t = useT()
  const [tab, setTab] = useState('profile')

  const [p, setP] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    bio: '',
  })

  // Keep form in sync when session user loads / changes
  useEffect(() => {
    if (user) {
      setP((prev) => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
      }))
    }
  }, [user])

  const [tfa, setTfa] = useState(true)
  const [sessions, setSessions] = useState([
    { id: 1, d: 'MacBook Pro · Chrome', loc: 'Dar es Salaam · This device', I: Monitor, cur: true },
    { id: 2, d: 'iPhone 15 · Adji Cash app', loc: 'Dar es Salaam · 2 hours ago', I: Smartphone },
    { id: 3, d: 'Windows PC · Edge', loc: 'Nairobi · 5 days ago', I: Monitor },
  ])
  const [n, setN] = useState({ bills: true, budget: true, weekly: false, large: true, product: false })
  const [reg, setReg] = useState({ currency: 'USD', date: 'MM/DD/YYYY', first: 'Monday' })
  const [plaid, setPlaid] = useState([
    { id: 1, bank: 'Chase', status: 'Active', sync: '3 min ago' },
    { id: 2, bank: 'Marcus', status: 'Active', sync: '3 min ago' },
    { id: 3, bank: 'Coinbase', status: 'Reauth', sync: '6 days ago' },
  ])

  const initials = (user?.name || p.name || 'U')
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const planLabel = user
    ? `${user.type === 'business' ? 'Business' : 'Personal'}${user.role === 'admin' ? ' · Admin' : ''}`
    : 'Guest'

  const save = (e) => {
    e?.preventDefault()
    notify('Changes saved')
  }

  const nrows = [
    ['bills', 'Bill reminders', 'Get a nudge 3 days before a bill is due.'],
    ['budget', 'Budget alerts', 'When a category reaches 85% or goes over.'],
    ['large', 'Large transactions', 'Anything above $500.'],
    ['weekly', 'Weekly summary', 'Sent every Monday morning.'],
    ['product', 'Product updates', 'New features and tips.'],
  ]

  return (
    <>
      <PageHeader title="Settings" sub="Manage your account, security and connected banks." />
      <Tabs tabs={TABS} value={tab} onChange={setTab} className="mb-5" />

      <Card className="max-w-3xl p-6">
        {tab === 'profile' && (
          <form onSubmit={save} className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2 flex items-center gap-4">
              <span className="grid h-16 w-16 place-items-center rounded-full bg-spark text-xl font-extrabold text-black">
                {initials}
              </span>
              <div>
                <p className="font-bold">{p.name || '—'}</p>
                <p className="text-xs text-mute">{planLabel}</p>
              </div>
            </div>

            <Field label="Full name">
              <input
                className={inp}
                value={p.name}
                onChange={(e) => setP({ ...p, name: e.target.value })}
              />
            </Field>

            <Field label="Email">
              <input
                type="email"
                className={inp}
                value={p.email}
                onChange={(e) => setP({ ...p, email: e.target.value })}
              />
            </Field>

            <Field label="Phone">
              <input
                className={inp}
                value={p.phone}
                onChange={(e) => setP({ ...p, phone: e.target.value })}
                placeholder="+255 …"
              />
            </Field>

            <Field label="Appearance">
              <button type="button" onClick={toggleTheme} className={cx(btnGhost, 'w-full')}>
                {theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
              </button>
            </Field>

            <div className="sm:col-span-2">
              <Field label="About">
                <textarea
                  rows={3}
                  className={inp}
                  value={p.bio}
                  onChange={(e) => setP({ ...p, bio: e.target.value })}
                  placeholder="A short bio…"
                />
              </Field>
            </div>

            <div className="sm:col-span-2 flex justify-end">
              <button className={btnPrimary}>Save changes</button>
            </div>
          </form>
        )}

        {tab === 'security' && (
          <>
            <Row
              title="Two-factor authentication"
              desc={tfa ? 'Enabled with an authenticator app.' : 'Add a second step when you sign in.'}
            >
              <Toggle
                on={tfa}
                onChange={(v) => {
                  setTfa(v)
                  notify(v ? '2FA enabled' : '2FA disabled')
                }}
                label="Two-factor authentication"
              />
            </Row>

            <Row title="Password" desc="Last changed 41 days ago.">
              <button className={btnGhost} onClick={() => notify('Password reset email sent')}>
                <Lock size={15} />
                Change password
              </button>
            </Row>

            <h3 className="mb-1 mt-6 text-sm font-bold">Active sessions</h3>
            {sessions.map(({ id, d, loc, cur }) => (
              <Row key={id} title={d} desc={loc}>
                {cur ? (
                  <Badge tone="green">This device</Badge>
                ) : (
                  <button
                    className="text-sm font-semibold text-crimson"
                    onClick={() => {
                      setSessions((s) => s.filter((x) => x.id !== id))
                      notify('Session signed out')
                    }}
                  >
                    Sign out
                  </button>
                )}
              </Row>
            ))}
          </>
        )}

        {tab === 'notifications' &&
          nrows.map(([k, title, desc]) => (
            <Row key={k} title={title} desc={desc}>
              <Toggle on={n[k]} onChange={(v) => setN({ ...n, [k]: v })} label={title} />
            </Row>
          ))}

        {tab === 'regional' && (
          <form onSubmit={save} className="grid gap-4 sm:grid-cols-2">
            <Field label="Currency">
              <select
                className={inp}
                value={reg.currency}
                onChange={(e) => setReg({ ...reg, currency: e.target.value })}
              >
                {['USD', 'EUR', 'GBP', 'TZS', 'KES'].map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </Field>

            <Field label="Date format">
              <select
                className={inp}
                value={reg.date}
                onChange={(e) => setReg({ ...reg, date: e.target.value })}
              >
                {['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'].map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </Field>

            <Field label="First day of week">
              <select
                className={inp}
                value={reg.first}
                onChange={(e) => setReg({ ...reg, first: e.target.value })}
              >
                {['Monday', 'Sunday'].map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </Field>

            <Field label="Language">
              <select
                className={inp}
                value={lang === 'SW' ? 'Kiswahili' : 'English'}
                onChange={(e) => setLang(e.target.value === 'Kiswahili' ? 'SW' : 'ENG')}
              >
                {['English', 'Kiswahili'].map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </Field>

            <div className="sm:col-span-2 flex justify-end">
              <button className={btnPrimary}>Save changes</button>
            </div>
          </form>
        )}

        {tab === 'banks' && (
          <>
            <div className="mb-2 flex items-center gap-2 text-sm text-mute">
              <Link2 size={15} />
              Bank data is synced securely through Plaid.
            </div>
            {plaid.map((b) => (
              <Row key={b.id} title={b.bank} desc={`Last sync ${b.sync}`}>
                <div className="flex items-center gap-3">
                  <Badge tone={b.status === 'Active' ? 'green' : 'amber'}>
                    {b.status === 'Active' ? 'Connected' : 'Needs re-login'}
                  </Badge>
                  {b.status !== 'Active' && (
                    <button
                      className="text-sm font-semibold text-accent"
                      onClick={() => {
                        setPlaid((s) =>
                          s.map((x) => (x.id === b.id ? { ...x, status: 'Active', sync: 'just now' } : x)),
                        )
                        notify(`${b.bank} reconnected`)
                      }}
                    >
                      Reconnect
                    </button>
                  )}
                  <button
                    className="text-sm font-semibold text-crimson"
                    onClick={() => {
                      setPlaid((s) => s.filter((x) => x.id !== b.id))
                      notify(`${b.bank} disconnected`)
                    }}
                  >
                    Remove
                  </button>
                </div>
              </Row>
            ))}
            <button
              className={cx(btnPrimary, 'mt-4')}
              onClick={() => {
                setPlaid((s) => [
                  ...s,
                  { id: Date.now(), bank: 'Wells Fargo', status: 'Active', sync: 'just now' },
                ])
                notify('Wells Fargo connected')
              }}
            >
              Connect a bank
            </button>
          </>
        )}
      </Card>
    </>
  )
}