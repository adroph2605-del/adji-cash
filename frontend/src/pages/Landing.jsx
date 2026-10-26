import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { BarChart3, Check, Globe, Layers, Loader2, Mail, Menu, MessageCircle, Moon, Phone, Quote, Rocket, Send, ShieldCheck, Sparkles, Star, Sun, Tags, UserPlus, Wallet, X, Zap } from 'lucide-react'
import { useStore } from '../store.jsx'
import { useT } from '../i18n/index.js'
import { cx, inp, Field } from '../components/ui.jsx'
import { CountUp, Reveal, Slideshow, Typewriter } from '../components/motion.jsx'
import { FAQ, FloatingActions, MouseGlow, Newsletter, ScrollProgress } from '../components/extras.jsx'
import Assistant from '../components/Assistant.jsx'
import { api } from '../services/api.js'
import { HERO_SLIDES, IMG } from '../data/images.js'
import { EMAIL, PHONE_DISPLAY, PHONE_TEL, WHATSAPP } from '../data/contact.js'
import { BRAND, COMPANY } from '../data/brand.js'

const IDS = ['features', 'solutions', 'analytics', 'pricing', 'faq', 'contact']
const FEATURE_ICONS = [Layers, Tags, Globe, Sparkles]
const STEP_ICONS = [UserPlus, Wallet, BarChart3, Rocket]
const STAT_VALUES = [[12450, '$'], [98, ''], [3, ''], [90, '']]
const PLAN_PRICES = [{ m: 0, y: 0 }, { m: 9, y: 7, hot: true }, { m: 15, y: 12 }]
const TICKER = [['Whole Foods', '-$128.46'], ['Northwind Studio', '+$2,400.00'], ['Netflix', '-$22.99'], ['Uber', '-$42.80'], ['Dividend payout', '+$96.40'], ['Con Edison', '-$96.20'], ['Acme Payroll', '+$6,400.00'], ['Blue Bottle', '-$14.50'], ['AWS', '-$64.18'], ['Savings transfer', '+$800.00']]

const Logo = ({ size = 'md' }) => (
  <span className="flex items-center gap-2">
    <span className={cx('grid place-items-center bg-spark text-black', size === 'md' ? 'h-9 w-9 rounded-xl' : 'h-8 w-8 rounded-lg')}><Zap size={size === 'md' ? 20 : 17} strokeWidth={2.8} /></span>
    <span className={cx('font-extrabold', size === 'md' ? 'text-lg' : 'text-lg text-white')}>{BRAND}</span>
  </span>
)

export default function Landing() {
  const { lang, setLang, theme, toggleTheme } = useStore()
  const t = useT()
  const [yearly, setYearly] = useState(false)
  const [msg, setMsg] = useState({ name: '', email: '', text: '', website: '' })
  const [menu, setMenu] = useState(false), [sending, setSending] = useState(false), [sentOk, setSentOk] = useState(false), [err, setErr] = useState('')
  const nav = t('nav'), plans = t('plans')
  const contactLines = useMemo(() => [EMAIL, PHONE_DISPLAY, t('contact.wa')], [lang]) // eslint-disable-line react-hooks/exhaustive-deps
  const go = (id) => { setMenu(false); document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }) }

  const send = async (e) => {
    e.preventDefault(); setSending(true); setErr(''); setSentOk(false)
    try { await api('/contact', { method: 'POST', body: msg }); setSentOk(true); setMsg({ name: '', email: '', text: '', website: '' }) }
    catch (ex) { setErr(ex.message) } finally { setSending(false) }
  }
  const sendByEmail = () => {
    const body = `${msg.text}\n\n— ${msg.name} (${msg.email})`
    window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(BRAND + ' – ' + msg.name)}&body=${encodeURIComponent(body)}`
  }

  return (
    <div className="relative isolate min-h-screen overflow-x-hidden bg-onyx">
      {/* Fixed full-page background picture */}
      <div className="fixed inset-0 -z-20" aria-hidden="true">
        <img src={IMG.plantBlue} alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-onyx/75" />
        <div className="absolute inset-0 bg-gradient-to-b from-onyx/20 via-onyx/50 to-onyx" />
      </div>
      <MouseGlow />

      <header className="sticky top-0 z-40 border-b border-line bg-onyx/60 backdrop-blur-xl">
        <ScrollProgress />
        <div className="mx-auto flex max-w-7xl items-center gap-6 px-4 py-3 sm:px-6">
          <Link to="/landing"><Logo /></Link>
          <nav className="ml-4 hidden gap-1 md:flex" aria-label="Primary">{nav.map((n, i) => <button key={IDS[i]} onClick={() => go(IDS[i])} className="rounded-lg px-3 py-2 text-sm font-semibold text-mute hover:text-ink">{n}</button>)}</nav>
          <div className="ml-auto flex items-center gap-2">
            <div className="flex rounded-lg border border-line p-0.5 text-xs font-bold">{['SW', 'ENG'].map((l) => <button key={l} onClick={() => setLang(l)} aria-pressed={lang === l} className={cx('rounded-md px-2 py-1', lang === l ? 'bg-spark text-black' : 'text-mute')}>{l}</button>)}</div>
            <button onClick={toggleTheme} aria-label="Toggle theme" className="rounded-lg border border-line p-2 text-mute hover:text-ink">{theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}</button>
            <Link to="/auth" className="hidden rounded-xl bg-[#B6FF2E] px-4 py-2 text-sm font-bold text-black transition-all hover:-translate-y-0.5 sm:block">{t('cta')}</Link>
            <button onClick={() => setMenu((m) => !m)} aria-label="Menu" aria-expanded={menu} className="rounded-lg border border-line p-2 text-mute hover:text-ink md:hidden">{menu ? <X size={16} /> : <Menu size={16} />}</button>
          </div>
        </div>
        {menu && (
          <nav className="animate-pop border-t border-line bg-onyx/95 px-4 pb-4 pt-2 backdrop-blur-xl md:hidden" aria-label="Mobile">
            {nav.map((n, i) => <button key={IDS[i]} onClick={() => go(IDS[i])} className="block w-full rounded-lg px-3 py-3 text-left font-semibold text-mute hover:bg-ink/5 hover:text-ink">{n}</button>)}
            <Link to="/auth" className="mt-2 block rounded-xl bg-[#B6FF2E] py-3 text-center font-bold text-black">{t('cta')}</Link>
          </nav>)}
      </header>

      {/* Hero */}
      <section className="relative">
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:py-24">
          <div>
            <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-line bg-onyx/50 px-3.5 py-1.5 text-xs font-bold uppercase tracking-widest text-accent backdrop-blur"><Zap size={13} strokeWidth={3} />{BRAND}</span>
            <h1 className="text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">{t('hero.h1')}</h1>
            <p className="mt-5 min-h-[3.5rem] max-w-lg text-lg text-mute sm:min-h-[1.75rem]">{t('hero.lead')} <Typewriter key={lang} phrases={t('hero.phrases')} className="font-semibold text-accent" /></p>
            <div className="mt-8"><Link to="/auth" className="inline-block rounded-xl bg-[#B6FF2E] px-7 py-4 font-bold text-black transition-all hover:-translate-y-0.5">{t('cta')}</Link></div>
            <p className="mt-5 flex items-center gap-2 text-sm text-mute"><ShieldCheck size={16} className="text-accent" />{t('hero.trust')}</p>
          </div>
          <div className="relative h-[360px] sm:h-[440px]">
            <Slideshow images={HERO_SLIDES} className="absolute inset-0 rounded-3xl border border-line shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10" />
            </Slideshow>
          </div>
        </div>
      </section>

      <div className="overflow-hidden border-y border-line bg-graphite2/70 py-3 backdrop-blur" aria-hidden="true">
        <div className="marquee">{[...TICKER, ...TICKER].map(([m, a], i) => (
          <span key={i} className="mx-6 flex items-center gap-3 whitespace-nowrap text-sm"><span className="text-mute">{m}</span><span className={cx('num font-semibold', a.startsWith('+') ? 'text-emerald' : 'text-crimson')}>{a}</span></span>))}</div>
      </div>

      <section id="features" className="mx-auto max-w-7xl scroll-mt-20 px-4 py-20 sm:px-6">
        <Reveal as="h2" className="max-w-xl text-3xl font-extrabold tracking-tight">{t('features.title')}</Reveal>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {t('features.items').map(([h, d], i) => { const I = FEATURE_ICONS[i]; return (
            <Reveal key={i} delay={i * 110} className="glass rounded-2xl p-6 transition-[transform,background] duration-200 hover:-translate-y-1.5 hover:bg-hover"><span className="grid h-11 w-11 place-items-center rounded-xl bg-spark/15 text-accent"><I size={20} /></span>
              <h3 className="mt-4 font-bold">{h}</h3><p className="mt-2 text-sm text-mute">{d}</p></Reveal>) })}
        </div>
      </section>

      <section id="solutions" className="mx-auto max-w-7xl scroll-mt-20 px-4 pb-20 sm:px-6">
        <div className="grid gap-5 md:grid-cols-3">
          {[IMG.blocks, IMG.receipt, IMG.analytics].map((src, i) => { const [h, d] = t('gallery.items')[i]; return (
            <Reveal key={i} delay={i * 130} className="group overflow-hidden rounded-3xl border border-line bg-graphite/80 backdrop-blur">
              <div className="h-52 overflow-hidden"><img src={src} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-[900ms] group-hover:scale-110" /></div>
              <div className="p-6"><h3 className="font-bold">{h}</h3><p className="mt-2 text-sm text-mute">{d}</p></div>
            </Reveal>) })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
        <Reveal as="h2" className="max-w-xl text-3xl font-extrabold tracking-tight">{t('steps.title')}</Reveal>
        <div className="relative mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="pointer-events-none absolute left-[12%] right-[12%] top-12 hidden h-px bg-gradient-to-r from-transparent via-spark/50 to-transparent lg:block" />
          {t('steps.items').map(([h, d], i) => { const I = STEP_ICONS[i]; return (
            <Reveal key={i} delay={i * 110} className="glass relative rounded-2xl p-6">
              <span className="num absolute right-5 top-4 text-4xl font-extrabold text-ink/10">0{i + 1}</span>
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-spark text-black"><I size={20} /></span>
              <h3 className="mt-4 font-bold">{h}</h3><p className="mt-2 text-sm text-mute">{d}</p></Reveal>) })}
        </div>
      </section>

      <section id="analytics" className="scroll-mt-20 border-y border-line bg-graphite2/70 backdrop-blur">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-14 text-center sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
          {STAT_VALUES.map(([n, p], i) => (
            <Reveal key={i}><p className="text-4xl font-extrabold text-accent"><CountUp to={n} prefix={p} suffix={t('stats.units')[i]} /></p><p className="mx-auto mt-2 max-w-[14rem] text-sm text-mute">{t('stats.labels')[i]}</p></Reveal>))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pt-20 sm:px-6">
        <Reveal as="h2" className="max-w-xl text-3xl font-extrabold tracking-tight">{t('testimonials.title')}</Reveal>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {t('testimonials.items').map(([q, n, r], i) => (
            <Reveal key={i} delay={i * 120} className="glass flex flex-col rounded-2xl p-6 transition-transform duration-200 hover:-translate-y-1.5">
              <Quote size={22} className="text-accent" />
              <p className="mt-3 flex-1 leading-relaxed">{q}</p>
              <div className="mt-4 flex gap-0.5 text-spark">{[0, 1, 2, 3, 4].map((k) => <Star key={k} size={14} fill="currentColor" />)}</div>
              <div className="mt-3 flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-full bg-spark text-sm font-extrabold text-black">{n.split(' ').map((w) => w[0]).join('')}</span><div><p className="text-sm font-bold">{n}</p><p className="text-xs text-mute">{r}</p></div></div>
            </Reveal>))}
        </div>
      </section>

      <section id="pricing" className="mx-auto max-w-7xl scroll-mt-20 px-4 py-20 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4"><Reveal as="h2" className="text-3xl font-extrabold tracking-tight">{t('pricing.title')}</Reveal>
          <div className="flex items-center gap-1 rounded-xl border border-line bg-onyx/40 p-1 text-sm font-semibold backdrop-blur">
            {[[t('pricing.monthly'), false], [t('pricing.annual'), true]].map(([l, v]) => <button key={String(v)} onClick={() => setYearly(v)} className={cx('rounded-lg px-3.5 py-1.5', yearly === v ? 'bg-spark text-black' : 'text-mute')}>{l}</button>)}</div></div>
        <div className="mt-10 grid gap-4 lg:grid-cols-3">
          {plans.map(([name, desc, pts], i) => { const p = PLAN_PRICES[i]; return (
            <Reveal key={name} delay={i * 120} className={cx('rounded-2xl border bg-graphite/85 p-6 backdrop-blur transition-[transform,box-shadow] duration-200 hover:-translate-y-1.5', p.hot ? 'border-spark/60 shadow-[0_0_40px_-12px_#B6FF2E]' : 'border-line')}>
              <div className="flex items-center justify-between"><h3 className="font-bold">{name}</h3>{p.hot && <span className="rounded-full bg-spark px-2.5 py-0.5 text-xs font-bold text-black">{t('pricing.popular')}</span>}</div>
              <p className="mt-1 text-sm text-mute">{desc}</p>
              <p className="mt-5"><span className="num text-4xl font-bold">${yearly ? p.y : p.m}</span><span className="text-sm text-mute"> {t('pricing.per')}{yearly && p.m ? t('pricing.billed') : ''}</span></p>
              <ul className="mt-5 space-y-2.5 text-sm">{pts.map((x) => <li key={x} className="flex items-center gap-2"><Check size={15} className="text-accent" />{x}</li>)}</ul>
              <Link to="/auth" className={cx('mt-6 block rounded-xl py-3 text-center text-sm font-bold transition-all', p.hot ? 'bg-[#B6FF2E] text-black hover:brightness-95' : 'border border-line hover:bg-hover')}>{p.m ? t('pricing.trial') : t('pricing.free')}</Link>
            </Reveal>) })}
        </div>
      </section>

      <section id="faq" className="mx-auto max-w-7xl scroll-mt-20 px-4 pb-20 sm:px-6">
        <Reveal as="h2" className="text-center text-3xl font-extrabold tracking-tight">{t('faq.title')}</Reveal>
        <FAQ key={lang} items={t('faq.items')} />
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
        <Reveal>
          <Slideshow images={[IMG.plantBlue, IMG.plantWindow]} interval={6500} dots={false} className="rounded-3xl border border-line">
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/10" />
            <div className="relative z-10 max-w-xl p-8 text-white sm:p-14">
              <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{t('cta2.title')}</h2>
              <p className="mt-3 text-white/80">{t('cta2.sub')}</p>
              <Link to="/auth" className="mt-6 inline-block rounded-xl bg-[#B6FF2E] px-6 py-3.5 font-bold text-black transition-all hover:-translate-y-0.5">{t('cta')}</Link>
            </div>
          </Slideshow>
        </Reveal>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
        <Reveal className="glass flex flex-col items-start justify-between gap-6 rounded-3xl p-8 md:flex-row md:items-center">
          <div><h2 className="text-2xl font-extrabold tracking-tight">{t('news.title')}</h2><p className="mt-1 text-sm text-mute">{t('news.sub')}</p></div>
          <Newsletter key={lang} />
        </Reveal>
      </section>

      <section id="contact" className="mx-auto max-w-7xl scroll-mt-20 px-4 pb-24 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-2">
          <Reveal>
            <h2 className="text-3xl font-extrabold tracking-tight">{t('contact.title')}</h2>
            <p className="mt-3 text-lg text-mute">{t('contact.reach')} <Typewriter key={lang} phrases={contactLines} className="num font-semibold text-accent" /></p>
            <div className="mt-8 grid gap-3">
              {[[Mail, t('contact.email'), EMAIL, `mailto:${EMAIL}`, false], [Phone, t('contact.call'), PHONE_DISPLAY, `tel:${PHONE_TEL}`, false], [MessageCircle, t('contact.whatsapp'), t('contact.chat'), WHATSAPP, true]].map(([I, l, v, href, ext]) => (
                <a key={href} href={href} target={ext ? '_blank' : undefined} rel="noreferrer" className="flex items-center gap-4 rounded-2xl border border-line bg-graphite/80 p-4 backdrop-blur transition-all duration-200 hover:-translate-y-0.5 hover:bg-hover">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-spark/15 text-accent"><I size={20} /></span><div><p className="text-xs text-mute">{l}</p><p className="num font-semibold">{v}</p></div></a>))}
            </div>
          </Reveal>
          <Reveal delay={150}>
            <form onSubmit={send} className="glass grid gap-4 rounded-3xl p-6 sm:grid-cols-2">
              <input tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" value={msg.website} onChange={(e) => setMsg({ ...msg, website: e.target.value })} />
              <Field label={t('form.name')}><input required className={inp} value={msg.name} onChange={(e) => setMsg({ ...msg, name: e.target.value })} /></Field>
              <Field label={t('form.email')}><input required type="email" className={inp} value={msg.email} onChange={(e) => setMsg({ ...msg, email: e.target.value })} /></Field>
              <div className="sm:col-span-2"><Field label={t('form.how')}><textarea required rows={4} className={inp} value={msg.text} onChange={(e) => setMsg({ ...msg, text: e.target.value })} /></Field></div>
              <button disabled={sending} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#B6FF2E] py-3 font-bold text-black transition-all hover:-translate-y-0.5 disabled:opacity-70 sm:col-span-2">{sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}{t('form.send')}</button>
              {sentOk && <p className="flex items-center gap-2 rounded-xl bg-spark/10 p-3 text-sm font-semibold text-accent sm:col-span-2" role="status"><Check size={16} />{t('form.sent')}</p>}
              {err && <p className="text-sm text-crimson sm:col-span-2" role="alert">{err} <button type="button" onClick={sendByEmail} className="font-semibold underline">{t('form.fallback')}</button></p>}
            </form>
          </Reveal>
        </div>
      </section>

      <footer className="bg-[#23262F]/90 text-[#9CA3AF] backdrop-blur">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 text-sm sm:px-6 md:grid-cols-5">
          <div className="md:col-span-2"><Logo size="sm" />
            <p className="mt-4 max-w-xs">{t('footer.tagline')}</p>
            <div className="mt-5 flex flex-wrap gap-2">{['SOC 2 Type II', 'AES-256', 'GDPR'].map((b) => <span key={b} className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 px-2.5 py-1 text-xs font-semibold text-white"><ShieldCheck size={13} className="text-spark" />{b}</span>)}</div></div>
          {[[t('footer.product'), t('footer.products')], [t('footer.company'), t('footer.companies')]].map(([h, ls]) => (
            <div key={h}><p className="mb-3 font-bold text-white">{h}</p><ul className="space-y-2">{ls.map((l) => <li key={l}><a href="#/landing" className="hover:text-white">{l}</a></li>)}</ul></div>))}
          <div><p className="mb-3 font-bold text-white">{t('footer.contact')}</p><ul className="space-y-2"><li><a href={`mailto:${EMAIL}`} className="break-all hover:text-white">{EMAIL}</a></li><li><a href={`tel:${PHONE_TEL}`} className="num hover:text-white">{PHONE_DISPLAY}</a></li></ul></div>
        </div>
        <div className="border-t border-white/10 px-4 py-5 sm:px-6"><div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 text-xs">
          <span>© 2026 {BRAND} · {COMPANY}</span><span className="flex items-center gap-2"><span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald opacity-70" /><span className="relative h-2 w-2 rounded-full bg-emerald" /></span>{t('footer.status')}</span></div></div>
      </footer>

      <FloatingActions />
      <Assistant />
    </div>
  )
}
