// Sets <html data-motion> from prefers-reduced-motion. Task 2+ wire feature dispatches here.

type MotionMode = 'full' | 'reduced'

function detectMode(): MotionMode {
  if (typeof window === 'undefined') return 'full'
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'reduced' : 'full'
}

const mode: MotionMode = detectMode()
document.documentElement.dataset.motion = mode

if (mode === 'full') {
  void Promise.all([
    import('./reveal').then(m => m.initReveal()),
    import('./tilt').then(m => m.initTilt()),
    import('./magnetic').then(m => m.initMagnetic()),
  ])
}
