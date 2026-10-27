import { useEffect, useState } from 'react'
import { Link2, Lock, Monitor, Smartphone } from 'lucide-react'
import { useStore } from '../store.jsx'
import { useT } from '../i18n/index.js'
import { Badge, Card, Field, Modal, PageHeader, Tabs, Toggle, btnGhost, btnPrimary, cx, inp } from '../components/ui.jsx'

const TABS = [
  ['profile', 'Profile'],
  ['security', 'Security'],
  ['notifications', 'Notifications'],
  ['regional', 'Currency & region'],
  ['banks', 'Bank & Mobile Money'],
]

// Tanzania banks + mobile money (demo connect UI — not live Open Banking yet)
const PROVIDERS = [
  { id: 'crdb', name: 'CRDB Bank', type: 'Bank' },
  { id: 'nmb', name: 'NMB Bank', type: 'Bank' },
  { id: 'nbc', name: 'NBC Bank', type: 'Bank' },
  { id: 'equity', name: 'Equity Bank', type: 'Bank' },
  { id: 'stanbic', name: 'Stanbic Bank', type: 'Bank' },
  { id: 'absa', name: 'Absa Bank', type: 'Bank' },
  { id: 'exim', name: 'Exim Bank', type: 'Bank' },
  { id: 'tigopesa', name: 'Tigo Pesa', type: 'Mobile Money' },
  { id: 'mpesa', name: 'M-Pesa (Vodacom)', type: 'Mobile Money' },
  { id: 'airtel', name: 'Airtel Money', type: 'Mobile Money' },
  { id: 'halopesa', name: 'HaloPesa', type: 'Mobile Money' },
  { id: 'ttcl', name: 'TTCL Pesa', type: 'Mobile Money' },
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

  useEffect(() => {
    if (user) {
      setP((prev) => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
      }))
    }
  }, [user])

  const [tfa, setTfa] = useState(false)
  const [sessions, setSessions] = useState([
    { id: 1, d: 'This browser', loc: 'Current session', cur: true },
  ])
  const [n, setN] = useState({ bills: true, budget: true, weekly: false, large: true, product: false })
  const [reg, setReg] = useState({ currency: 'TZS', date: 'DD/MM/YYYY', first: 'Monday' })

  // Start EMPTY — user connects their own banks / wallets
  const [connections, setConnections] = useState([])
  const [pickerOpen, setPickerOpen] = useState(false)

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

  const connectedIds = new Set(connections.map((c) => c.providerId))
  const available = PROVIDERS.filter((p) => !connectedIds.has(p.id))

  const connectProvider = (provider) => {
    setConnections((s) => [
      ...s,
      {
        id: Date.now(),
        providerId: provider.id,
        bank: provider.name,
        type: provider.type,
        status: 'Active',
        sync: 'just now',
      },
    ])
    notify(`${provider.name} connected`)
    setPickerOpen(false)
  }

  const nrows = [
    ['bills', 'Bill reminders', 'Get a nudge 3 days before a bill is due.'],
    ['budget', 'Budget alerts', 'When a category reaches 85% or goes over.'],
    ['large', 'Large transactions', 'Anything above TZS 100,000.'],
    ['weekly', 'Weekly summary', 'Sent every Monday morning.'],
    ['product', 'Product updates', 'New features and tips.'],
  ]

  return (
    <>
      <PageHeader title="Settings" sub="Manage your account, security and connected accounts." />
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
              <input className={inp} value={p.name} onChange={(e) => setP({ ...p, name: e.target.value })} />
            </Field>

            <Field label="Email">
              <input type="email" className={inp} value={p.email} onChange={(e) => setP({ ...p, email: e.target.value })} />
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

            <Row title="Password" desc="Change your sign-in password.">
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
                {['TZS', 'USD', 'EUR', 'KES', 'GBP'].map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </Field>

            <Field label="Date format">
              <select className={inp} value={reg.date} onChange={(e) => setReg({ ...reg, date: e.target.value })}>
                {['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'].map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </Field>

            <Field label="First day of week">
              <select className={inp} value={reg.first} onChange={(e) => setReg({ ...reg, first: e.target.value })}>
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
            <div className="mb-4 flex items-start gap-2 rounded-xl border border-line bg-onyx/40 p-3 text-sm text-mute">
              <Link2 size={16} className="mt-0.5 shrink-0 text-accent" />
              <p>
                Connect Tanzanian banks and mobile money. This is a product demo connection flow — live Open Banking /
                mobile-money APIs can be wired later (CRDB, NMB, Tigo, Airtel, M-Pesa).
              </p>
            </div>

            {connections.length === 0 ? (
              <p className="py-6 text-center text-sm text-mute">
                No accounts connected yet. Link CRDB, NMB, Tigo Pesa, Airtel Money, and more.
              </p>
            ) : (
              connections.map((b) => (
                <Row key={b.id} title={b.bank} desc={`${b.type} · Last sync ${b.sync}`}>
                  <div className="flex items-center gap-3">
                    <Badge tone={b.status === 'Active' ? 'green' : 'amber'}>
                      {b.status === 'Active' ? 'Connected' : 'Needs re-login'}
                    </Badge>
                    {b.status !== 'Active' && (
                      <button
                        className="text-sm font-semibold text-accent"
                        onClick={() => {
                          setConnections((s) =>
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
                        setConnections((s) => s.filter((x) => x.id !== b.id))
                        notify(`${b.bank} disconnected`)
                      }}
                    >
                      Remove
                    </button>
                  </div>
                </Row>
              ))
            )}

            <button className={cx(btnPrimary, 'mt-4')} onClick={() => setPickerOpen(true)} disabled={available.length === 0}>
              Connect bank or mobile money
            </button>
          </>
        )}
      </Card>

      <Modal open={pickerOpen} onClose={() => setPickerOpen(false)} title="Connect an account" width="max-w-md">
        <p className="mb-4 text-sm text-mute">Choose a bank or mobile wallet to link to Adji Cash.</p>
        <div className="max-h-80 space-y-2 overflow-y-auto">
          {available.map((provider) => (
            <button
              key={provider.id}
              type="button"
              onClick={() => connectProvider(provider)}
              className="flex w-full items-center justify-between rounded-xl border border-line px-4 py-3 text-left transition-colors hover:border-spark/40 hover:bg-spark/5"
            >
              <div>
                <p className="text-sm font-bold">{provider.name}</p>
                <p className="text-xs text-mute">{provider.type}</p>
              </div>
              <span className="text-xs font-semibold text-accent">Connect</span>
            </button>
          ))}
          {available.length === 0 && (
            <p className="py-6 text-center text-sm text-mute">All available providers are already connected.</p>
          )}
        </div>
        <div className="mt-4 flex justify-end">
          <button type="button" className={btnGhost} onClick={() => setPickerOpen(false)}>
            Close
          </button>
        </div>
      </Modal>
    </>
  )
}