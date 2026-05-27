/**
 * Count-up animation for numeric stats.
 * Opt-in via [data-counter="<finalValue>"] (parsed as float).
 * The text content of the element is replaced during the animation.
 * A `data-counter-suffix` attribute optionally appends static text (e.g. "+", "%").
 * Animation duration: 1200ms cap, regardless of magnitude.
 * Triggered when the element enters the viewport.
 */

const DURATION_MS = 1200

function formatValue(value: number, decimals: number): string {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

function getDecimals(target: number): number {
  /* If the target is e.g. 1.4 keep 1 decimal; if it's 2000 keep 0. */
  const s = String(target)
  const dot = s.indexOf('.')
  return dot >= 0 ? s.length - dot - 1 : 0
}

function animate(el: HTMLElement, target: number, suffix: string): void {
  const decimals = getDecimals(target)
  const start = performance.now()
  const tick = (now: number) => {
    const t = Math.min(1, (now - start) / DURATION_MS)
    /* easeOutCubic */
    const eased = 1 - Math.pow(1 - t, 3)
    const value = target * eased
    el.textContent = formatValue(value, decimals) + suffix
    if (t < 1) requestAnimationFrame(tick)
    else el.textContent = formatValue(target, decimals) + suffix
  }
  requestAnimationFrame(tick)
}

export function applyFinalValues(): void {
  document.querySelectorAll<HTMLElement>('[data-counter]').forEach(el => {
    const target = parseFloat(el.dataset.counter ?? '0')
    const suffix = el.dataset.counterSuffix ?? ''
    el.textContent = formatValue(target, getDecimals(target)) + suffix
  })
}

export function initCounters(): void {
  const els = document.querySelectorAll<HTMLElement>('[data-counter]')
  if (els.length === 0) return

  /* Initial: render 0 so layout doesn't jump from empty. */
  els.forEach(el => {
    const target = parseFloat(el.dataset.counter ?? '0')
    el.textContent = formatValue(0, getDecimals(target)) + (el.dataset.counterSuffix ?? '')
  })

  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return
      const el = entry.target as HTMLElement
      const target = parseFloat(el.dataset.counter ?? '0')
      const suffix = el.dataset.counterSuffix ?? ''
      animate(el, target, suffix)
      io.unobserve(el)
    })
  }, { threshold: 0.4 })

  els.forEach(el => io.observe(el))
}
