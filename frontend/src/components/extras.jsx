import { useEffect, useState } from 'react'
import { ArrowUp, Check, ChevronDown, Loader2, Send } from 'lucide-react'
import { cx, inp } from './ui.jsx'
import { api } from '../services/api.js'
import { useT } from '../i18n/index.js'

/** Thin lime bar along the bottom of the sticky header that fills as you scroll. */
export function ScrollProgress() {
  const [p, setP] = useState(0)
  useEffect(() => {
    const on = () => { const h = document.documentElement, max = h.scrollHeight - h.clientHeight; setP(max > 0 ? h.scrollTop / max : 0) }
    on()
    window.addEventListener('scroll', on, { passive: true }); window.addEventListener('resize', on)
    return () => { window.removeEventListener('scroll', on); window.removeEventListener('resize', on) }
  }, [])
  return <div className="pointer-events-none absolute inset-x-0 bottom-0 h-0.5" aria-hidden="true"><div className="h-full origin-left bg-spark" style={{ transform: `scaleX(${p})` }} /></div>
}

/** Soft lime light that follows the cursor (desktop only). */
export function MouseGlow() {
  const [pos, setPos] = useState({ x: -400, y: -400 })
  useEffect(() => {
    if (window.matchMedia('(hover: none)').matches) return
    const on = (e) => setPos({ x: e.clientX, y: e.clientY })
    window.addEventListener('mousemove', on, { passive: true })
    return () => window.removeEventListener('mousemove', on)
  }, [])
  return <div aria-hidden="true" className="pointer-events-none fixed left-0 top-0 z-0 hidden h-[420px] w-[420px] rounded-full bg-spark/10 blur-[110px] transition-transform duration-300 ease-out md:block" style={{ transform: `translate(${pos.x - 210}px, ${pos.y - 210}px)` }} />
}

/** Back-to-top button (sits just above the AI assistant bubble). */
export function FloatingActions() {
  const [show, setShow] = useState(false)
  useEffect(() => {
    const on = () => setShow(window.scrollY > 600)
    on(); window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])
  return (
    <button aria-label="Back to top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className={cx('glass fixed bottom-24 right-5 z-40 grid h-11 w-11 place-items-center rounded-full text-ink transition-all duration-300 hover:-translate-y-0.5', show ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0')}><ArrowUp size={18} /></button>
  )
}

export function FAQ({ items }) {
  const [open, setOpen] = useState(0)
  return (
    <div className="mx-auto mt-10 max-w-3xl space-y-3">
      {items.map(([q, a], i) => (
        <div key={q} className="glass rounded-2xl">
          <button onClick={() => setOpen(open === i ? -1 : i)} aria-expanded={open === i} className="flex w-full items-center justify-between gap-4 p-5 text-left font-bold">
            {q}<ChevronDown size={18} className={cx('shrink-0 text-accent transition-transform duration-300', open === i && 'rotate-180')} />
          </button>
          <div className={cx('grid transition-[grid-template-rows] duration-300', open === i ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]')}>
            <div className="overflow-hidden"><p className="px-5 pb-5 text-sm leading-relaxed text-mute">{a}</p></div>
          </div>
        </div>
      ))}
    </div>
  )
}

export function Newsletter() {
  const t = useT()
  const [email, setEmail] = useState(''), [state, setState] = useState('idle'), [err, setErr] = useState('')
  const submit = async (e) => {
    e.preventDefault(); setState('busy'); setErr('')
    try { await api('/newsletter', { method: 'POST', body: { email } }); setState('done'); setEmail('') }
    catch (ex) { setErr(ex.message); setState('idle') }
  }
  return state === 'done'
    ? <p className="flex items-center gap-2 font-semibold text-accent"><Check size={18} />{t('news.done')}</p>
    : (
      <form onSubmit={submit} className="flex w-full max-w-md flex-col gap-2 sm:flex-row">
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t('news.placeholder')} aria-label="Email" className={cx(inp, 'flex-1 py-3')} />
        <button disabled={state === 'busy'} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#B6FF2E] px-5 py-3 text-sm font-bold text-black transition-all hover:-translate-y-0.5">
          {state === 'busy' ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}{t('news.btn')}</button>
        {err && <p className="text-xs text-crimson sm:basis-full">{err}</p>}
      </form>
    )
}
