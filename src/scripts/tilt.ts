/**
 * 3D tilt: rotates a card slightly toward the cursor on mousemove.
 * Opt-in via [data-tilt]. Max ±6deg. Touch / coarse-pointer: no-op.
 */

const MAX_DEG = 6
const PERSPECTIVE = 800

export function initTilt(): void {
  if (window.matchMedia('(pointer: coarse)').matches) return

  const cards = document.querySelectorAll<HTMLElement>('[data-tilt]')
  cards.forEach(card => {
    card.style.transformStyle = 'preserve-3d'
    card.style.willChange = 'transform'

    let raf = 0
    const reset = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        card.style.transform = `perspective(${PERSPECTIVE}px) rotateX(0deg) rotateY(0deg)`
      })
    }

    card.addEventListener('mousemove', (e: MouseEvent) => {
      const r = card.getBoundingClientRect()
      const x = (e.clientX - r.left) / r.width   /* 0..1 */
      const y = (e.clientY - r.top) / r.height   /* 0..1 */
      const rotY = (x - 0.5) * 2 * MAX_DEG       /* -MAX..+MAX */
      const rotX = -(y - 0.5) * 2 * MAX_DEG
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        card.style.transform = `perspective(${PERSPECTIVE}px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg)`
      })
    })

    card.addEventListener('mouseleave', reset)
  })
}
