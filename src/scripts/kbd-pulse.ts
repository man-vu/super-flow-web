/**
 * One-time pulse animation on <kbd> elements when scrolled into view.
 * Suggests "press me" without being persistent visual noise.
 */

export function initKbdPulse(): void {
  const kbds = document.querySelectorAll<HTMLElement>('kbd')
  if (kbds.length === 0) return

  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return
      const el = entry.target as HTMLElement
      el.classList.add('kbd-pulse')
      io.unobserve(el)
    })
  }, { threshold: 0.8 })

  kbds.forEach(el => io.observe(el))
}
