// Sets <html data-motion> from prefers-reduced-motion. Task 2+ wire feature dispatches here.

type MotionMode = 'full' | 'reduced'

function detectMode(): MotionMode {
  if (typeof window === 'undefined') return 'full'
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'reduced' : 'full'
}

const mode: MotionMode = detectMode()
document.documentElement.dataset.motion = mode

/* Feature-module dispatch (reveal / tilt / magnetic / counters) is wired
   up by Tasks 2, 3, and 5 of the maximalist-redesign plan as those modules
   are introduced. Task 1 ships only the data-motion flag — the inline
   pre-paint script in Base.astro already sets it, and the body::before
   mesh gradient in motion.css branches off it via the
   html[data-motion="reduced"] selector. */
