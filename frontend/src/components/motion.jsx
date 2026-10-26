import { useEffect, useRef, useState } from 'react'
import { cx } from './ui.jsx'

const reducedMotion = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** Types phrases one after another. With one phrase and loop=false it types once and stays. */
export function Typewriter({ phrases, speed = 48, hold = 1700, loop = true, className = '' }) {
  const [i, setI] = useState(0), [n, setN] = useState(0), [del, setDel] = useState(false)
  const reduce = reducedMotion()
  useEffect(() => {
    if (reduce) return
    const full = phrases[i]
    let t
    if (!del && n < full.length) t = setTimeout(() => setN(n + 1), speed)
    else if (!del) { if (!loop && i === phrases.length - 1) return; t = setTimeout(() => setDel(true), hold) }
    else if (n > 0) t = setTimeout(() => setN(n - 1), speed / 2)
    else { setDel(false); setI((i + 1) % phrases.length) }
    return () => clearTimeout(t)
  }, [n, del, i, phrases, speed, hold, loop, reduce])
  const text = reduce ? phrases[0] : phrases[i].slice(0, n)
  return (
    <span className={className}>
      <span className="sr-only">{phrases[0]}</span>
      <span aria-hidden="true">{text}</span><span className="caret" aria-hidden="true" />
    </span>
  )
}

export function Reveal({ as: Tag = 'div', delay = 0, className = '', children, ...p }) {
  const ref = useRef(null)
  const [on, setOn] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setOn(true); io.disconnect() } }, { threshold: 0.15 })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return <Tag ref={ref} style={{ transitionDelay: delay + 'ms' }} className={cx('reveal', on && 'in', className)} {...p}>{children}</Tag>
}

export function CountUp({ to, prefix = '', suffix = '', decimals = 0, duration = 1500 }) {
  const ref = useRef(null)
  const [v, setV] = useState(0)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (reducedMotion()) { setV(to); return }
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return
      io.disconnect()
      const t0 = performance.now()
      const tick = (t) => { const p = Math.min((t - t0) / duration, 1); setV(to * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(tick) }
      requestAnimationFrame(tick)
    }, { threshold: 0.4 })
    io.observe(el)
    return () => io.disconnect()
  }, [to, duration])
  return <span ref={ref} className="num">{prefix}{v.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}{suffix}</span>
}

/** Cross-fading photo slideshow; each photo drifts slowly (Ken Burns). */
export function Slideshow({ images, interval = 5200, className = '', dots = true, children }) {
  const [a, setA] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setA((x) => (x + 1) % images.length), interval)
    return () => clearInterval(t)
  }, [images.length, interval])
  return (
    <div className={cx('relative overflow-hidden', className)}>
      {images.map((src, i) => (
        <img key={src} src={src} alt="" loading={i === 0 ? 'eager' : 'lazy'}
          className={cx('kb absolute inset-0 h-full w-full object-cover transition-opacity duration-[1400ms]', i === a ? 'opacity-100' : 'opacity-0')} />
      ))}
      {children}
      {dots && (
        <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
          {images.map((_, i) => (
            <button key={i} aria-label={`Show photo ${i + 1}`} onClick={() => setA(i)}
              className={cx('h-1.5 rounded-full bg-white transition-all', i === a ? 'w-6 opacity-100' : 'w-1.5 opacity-50')} />
          ))}
        </div>
      )}
    </div>
  )
}
