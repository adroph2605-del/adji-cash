import { useMemo } from 'react'
import { ArrowDownRight, ArrowUpRight, CreditCard, Landmark, PiggyBank, Wallet } from 'lucide-react'
import { useStore } from '../store.jsx'
import { Badge, Card, PageHeader, cx, usd } from '../components/ui.jsx'

const ICON_FOR = {
  Checking: Wallet,
  Savings: PiggyBank,
  'Credit Card': CreditCard,
}

export default function Accounts() {
  const { txs } = useStore()

  // Build accounts from real transactions (balance per account name)
  const accounts = useMemo(() => {
    const map = {}
    txs.forEach((tx) => {
      const name = tx.account || 'Other'
      if (!map[name]) map[name] = { name, balance: 0, count: 0 }
      map[name].balance += tx.amount
      map[name].count += 1
    })
    return Object.values(map).sort((a, b) => b.balance - a.balance)
  }, [txs])

  const assets = accounts.filter((a) => a.balance >= 0)
  const liabilities = accounts.filter((a) => a.balance < 0)
  const ta = assets.reduce((s, a) => s + a.balance, 0)
  const tl = liabilities.reduce((s, a) => s + Math.abs(a.balance), 0)
  const net = ta - tl
  const pct = ta + tl > 0 ? (ta / (ta + tl)) * 100 : 100

  return (
    <>
      <PageHeader title="Accounts & Net Worth" sub="Everything you own and owe, in one place." />

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-5">
          <p className="text-sm font-semibold text-mute">Total assets</p>
          <p className="num mt-2 text-2xl font-bold text-emerald">{usd(ta)}</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm font-semibold text-mute">Total liabilities</p>
          <p className="num mt-2 text-2xl font-bold text-crimson">{usd(tl)}</p>
        </Card>
        <Card className="border-spark/30 p-5">
          <p className="text-sm font-semibold text-mute">Net worth</p>
          <p className="num mt-2 text-2xl font-bold text-accent">{usd(net)}</p>
        </Card>
      </div>

      <Card className="mt-4 p-5">
        <div className="mb-2 flex justify-between text-xs font-semibold text-mute">
          <span>Assets {pct.toFixed(0)}%</span>
          <span>Liabilities {(100 - pct).toFixed(0)}%</span>
        </div>
        <div className="flex h-3 overflow-hidden rounded-full bg-crimson/80">
          <div className="bg-spark transition-all" style={{ width: pct + '%' }} />
        </div>
      </Card>

      <h2 className="mb-3 mt-8 font-bold">Accounts</h2>
      {accounts.length === 0 ? (
        <Card className="p-8 text-center text-sm text-mute">
          No accounts yet. When you add transactions with an account name (Checking, Savings…), they appear here.
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {accounts.map((a) => {
            const Icon = ICON_FOR[a.name] || Landmark
            const up = a.balance >= 0
            return (
              <Card key={a.name} hover className="p-5">
                <div className="flex items-start justify-between">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-spark/12 text-accent">
                    <Icon size={20} />
                  </span>
                  <Badge tone={up ? 'green' : 'red'}>
                    {up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                    {a.count} tx
                  </Badge>
                </div>
                <p className="mt-4 text-sm font-semibold text-mute">{a.name}</p>
                <p className={cx('num mt-1 text-xl font-bold', up ? 'text-ink' : 'text-crimson')}>{usd(a.balance)}</p>
              </Card>
            )
          })}
        </div>
      )}
    </>
  )
}