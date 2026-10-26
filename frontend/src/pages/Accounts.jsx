import { ArrowDownRight, ArrowUpRight, Bitcoin, Building2, CreditCard, Landmark, PiggyBank, TrendingUp, Wallet } from 'lucide-react'

const ICONS = { Landmark, PiggyBank, TrendingUp, Bitcoin, Building2, Wallet }
import { assets, liabilities } from '../data/mock.js'
import { Badge, Card, PageHeader, cx, usd } from '../components/ui.jsx'

export default function Accounts() {
  const ta = assets.reduce((s, a) => s + a.value, 0), tl = liabilities.reduce((s, l) => s + l.value, 0), net = ta - tl
  const pct = (ta / (ta + tl)) * 100
  return (
    <>
      <PageHeader title="Accounts & Net Worth" sub="Everything you own and owe, in one place." />
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-5"><p className="text-sm font-semibold text-mute">Total assets</p><p className="num mt-2 text-2xl font-bold text-emerald">{usd(ta)}</p></Card>
        <Card className="p-5"><p className="text-sm font-semibold text-mute">Total liabilities</p><p className="num mt-2 text-2xl font-bold text-crimson">{usd(tl)}</p></Card>
        <Card className="border-spark/30 p-5"><p className="text-sm font-semibold text-mute">Net worth</p><p className="num mt-2 text-2xl font-bold text-accent">{usd(net)}</p></Card>
      </div>
      <Card className="mt-4 p-5">
        <div className="mb-2 flex justify-between text-xs font-semibold text-mute"><span>Assets {pct.toFixed(0)}%</span><span>Liabilities {(100 - pct).toFixed(0)}%</span></div>
        <div className="flex h-3 overflow-hidden rounded-full bg-crimson/80"><div className="bg-spark transition-all" style={{ width: pct + '%' }} /></div>
      </Card>

      <h2 className="mb-3 mt-8 font-bold">Assets</h2>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {assets.map((a) => { const Icon = ICONS[a.icon] || Wallet; const up = a.change >= 0
          return (
            <Card key={a.id} hover className="p-5">
              <div className="flex items-start justify-between"><span className="grid h-11 w-11 place-items-center rounded-xl bg-spark/12 text-accent"><Icon size={20} /></span>
                <Badge tone={up ? 'green' : 'red'}>{up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}{Math.abs(a.change)}%</Badge></div>
              <p className="mt-4 font-bold">{a.name}</p><p className="text-xs text-mute">{a.inst}</p>
              <p className="num mt-3 text-2xl font-bold">{usd(a.value)}</p>
              <p className="mt-1 text-xs text-mute">{((a.value / ta) * 100).toFixed(1)}% of total assets</p>
            </Card>)
        })}
      </div>
      <h2 className="mb-3 mt-8 font-bold">Liabilities</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {liabilities.map((l) => (
          <Card key={l.id} hover className="flex items-center gap-4 p-5"><span className="grid h-11 w-11 place-items-center rounded-xl bg-crimson/15 text-crimson"><CreditCard size={20} /></span>
            <div className="flex-1"><p className="font-bold">{l.name}</p><p className="text-xs text-mute">{l.inst} · {l.rate}</p></div>
            <p className="num text-lg font-bold text-crimson">-{usd(l.value)}</p></Card>))}
      </div>
    </>
  )
}
