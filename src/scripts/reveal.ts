/**
 * Scroll-reveal: fade + slide-up elements as they enter the viewport.
 * Opt-in via [data-reveal] attribute. Siblings inside the same direct parent
 * get a 60ms stagger.
 */

export function initReveal(): void {
  const targets = document.querySelectorAll<HTMLElement>('[data-reveal]')
  if (targets.length === 0) return

  /* Group by parent so siblings stagger relative to each other. */
  const byParent = new Map<Element, HTMLElement[]>()
  targets.forEach(el => {
    const parent = el.parentElement ?? document.body
    const list = byParent.get(parent) ?? []
    list.push(el)
    byParent.set(parent, list)
  })
  byParent.forEach(siblings => {
    siblings.forEach((el, i) => {
      el.style.transitionDelay = `${i * 60}ms`
    })
  })

  const io = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed')
          io.unobserve(entry.target)
        }
      })
    },
    { threshold: 0.15, rootMargin: '0px 0px -10% 0px' },
  )

  targets.forEach(el => io.observe(el))
}
