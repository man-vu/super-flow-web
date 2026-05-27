/**
 * Magnetic CTAs: pull the button toward the cursor within a proximity radius.
 * Opt-in via [data-magnetic]. Radius 100px. Max pull 12px. Touch / coarse-pointer: no-op.
 */

const RADIUS = 100
const PULL = 12

export function initMagnetic(): void {
  if (window.matchMedia('(pointer: coarse)').matches) return

  const buttons = document.querySelectorAll<HTMLElement>('[data-magnetic]')
  if (buttons.length === 0) return

  let raf = 0
  const update = (e: MouseEvent) => {
    cancelAnimationFrame(raf)
    raf = requestAnimationFrame(() => {
      buttons.forEach(btn => {
        const r = btn.getBoundingClientRect()
        const cx = r.left + r.width / 2
        const cy = r.top + r.height / 2
        const dx = e.clientX - cx
        const dy = e.clientY - cy
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist > RADIUS) {
          btn.style.transform = ''
          return
        }
        const strength = 1 - dist / RADIUS
        const tx = (dx / RADIUS) * PULL * strength
        const ty = (dy / RADIUS) * PULL * strength
        btn.style.transform = `translate(${tx.toFixed(2)}px, ${ty.toFixed(2)}px)`
      })
    })
  }

  window.addEventListener('mousemove', update, { passive: true })
}
