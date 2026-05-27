# Maximalist Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add animated mesh gradient bg, scroll-reveal, 3D tilt, magnetic CTAs, audio waveform, stat counters, marquee, hover glow, and a "who uses it" persona section to the `super-flow-web` marketing site — while broadening the homepage out of its dev-only framing.

**Architecture:** Astro stays static. All client behavior lives in `src/scripts/*.ts` modules bundled into one entrypoint `motion.ts` mounted from `Base.astro` via a single `<script type="module">`. CSS animations live in a new `src/styles/motion.css`. Reduced-motion preference is read once at page-load and surfaced as `<html data-motion="reduced|full">` — both CSS and JS branch off it.

**Tech Stack:** Astro 6, vanilla TS (compiled by Astro/Vite), CSS custom properties, IntersectionObserver, SVG inline. No frameworks, no animation libraries. Total added JS budget: <8KB minified.

**Spec:** [docs/superpowers/specs/2026-05-27-maximalist-redesign-design.md](../specs/2026-05-27-maximalist-redesign-design.md)

**Repo:** `D:\projects\clones\super-flow-web` — branch off `main`, single PR at the end.

---

## File Map

| Path | Action | Responsibility |
|------|--------|---------------|
| `src/layouts/Base.astro` | modify | inline motion-bootstrap script, mount `<ScrollProgress />`, load `motion.ts` |
| `src/styles/global.css` | modify | drop `// ` from `.eyebrow`, drop body grid texture, add reduced-motion block |
| `src/styles/motion.css` | create | all `@keyframes` (mesh gradient, waveform, marquee, blob drift, hover glow), `body::before` mesh layer |
| `src/scripts/motion.ts` | create | entrypoint — sets `<html data-motion>`, dispatches reveal/tilt/magnetic/counters/marquee-pause |
| `src/scripts/reveal.ts` | create | IntersectionObserver for `[data-reveal]` — fade + slide-up on enter, 60ms sibling stagger |
| `src/scripts/tilt.ts` | create | mousemove → rotateX/Y for `[data-tilt]`, ±6deg, pointer-coarse no-op |
| `src/scripts/magnetic.ts` | create | cursor-proximity translate for `[data-magnetic]`, 100px radius, ≤12px pull |
| `src/scripts/counters.ts` | create | count-up animation for `[data-counter]` on IO entry, 1.2s cap |
| `src/components/Header.astro` | no change | — |
| `src/components/Footer.astro` | modify | drop "all systems normal" line + status dot |
| `src/components/CtaButton.astro` | modify | primary variant gets `data-magnetic` |
| `src/components/FeatureCard.astro` | modify | wrap in element with `data-reveal data-tilt` |
| `src/components/HowItWorksStep.astro` | modify | add `data-reveal` |
| `src/components/PricingTable.astro` | modify | add `data-reveal` to rows |
| `src/components/ScrollProgress.astro` | create | 1px lime fixed bar at top |
| `src/components/HeroWaveform.astro` | create | inline SVG waveform behind hero H1 |
| `src/components/StatsStrip.astro` | create | 3 stats with `data-counter` |
| `src/components/MarqueeApps.astro` | create | CSS marquee of app names |
| `src/components/PersonaCard.astro` | create | persona icon + label + before/after sample |
| `src/pages/index.astro` | modify | drop `$ prompt`, hero copy reframe, mount HeroWaveform/StatsStrip/MarqueeApps/PersonaCard sections, reorder features, add `data-tilt` to pricing-teaser plans, animated gradient border on `.plan-featured` |
| `src/pages/pricing.astro` | modify | add hover glow to PricingTable's pro column header (animated angle) |
| `src/pages/faq.astro` | modify | add `data-reveal` to `<details>` items |
| `src/pages/about.astro` | no change | inherits global mesh + scroll progress only |
| `src/pages/auth-callback.astro` | NO TOUCH | functional bouncer — leave alone |

---

## Pre-flight

- [ ] **Step 0.1: Verify clean working tree on main**

```
cd D:/projects/clones/super-flow-web
rtk git status
rtk git checkout main && rtk git pull origin main --ff-only
```

Expected: clean tree on `main`, up to date with `origin/main`.

- [ ] **Step 0.2: Create the feature branch**

```
rtk git checkout -b feat/maximalist-redesign
```

Expected: switched to new branch `feat/maximalist-redesign`.

- [ ] **Step 0.3: Confirm dev server boots**

```
rtk npm run dev
```

Expected: Astro logs `Local http://localhost:4321/super-flow-web/` and serves home, pricing, faq, about without console errors. Stop the server (Ctrl+C) before continuing.

---

## Task 1: Foundation — motion bootstrap, mesh gradient bg, drop dev cues

**Files:**
- Create: `src/styles/motion.css`
- Create: `src/scripts/motion.ts`
- Modify: `src/styles/global.css` (drop `// ` eyebrow rule, drop body grid texture, add reduced-motion block)
- Modify: `src/layouts/Base.astro` (inline boot script, import motion.css, load motion.ts)
- Modify: `src/components/Footer.astro` (drop status block)
- Modify: `src/pages/index.astro` (drop `$ super-flow start` prompt line)

- [ ] **Step 1.1: Create `src/styles/motion.css` with the mesh gradient layer**

```css
/* ---------------------------------------------------------------
   Motion + visual effects. Loaded by Base.astro.

   Layer order:
     - body::before — animated mesh gradient (z-index: -2)
     - body::after  — page noise / depth layer (z-index: -1, currently unused)
     - content      — z-index: auto
   --------------------------------------------------------------- */

body::before {
  content: '';
  position: fixed;
  inset: -10%;
  z-index: -2;
  pointer-events: none;
  background:
    radial-gradient(40vw 40vw at 20% 20%, rgba(99, 102, 241, 0.18) 0%, transparent 60%),
    radial-gradient(45vw 45vw at 80% 30%, rgba(163, 230, 53, 0.12) 0%, transparent 65%),
    radial-gradient(50vw 50vw at 50% 90%, rgba(251, 191, 36, 0.08) 0%, transparent 60%);
  filter: blur(40px) saturate(120%);
  animation: meshDrift 18s ease-in-out infinite alternate;
  will-change: transform;
}

@keyframes meshDrift {
  0%   { transform: translate3d(0, 0, 0)       rotate(0deg); }
  50%  { transform: translate3d(-3%, 2%, 0)    rotate(2deg); }
  100% { transform: translate3d(2%, -3%, 0)    rotate(-2deg); }
}

/* Reduced-motion: freeze mesh in its rest position, no keyframe loop. */
html[data-motion="reduced"] body::before {
  animation: none;
  transform: none;
}
```

- [ ] **Step 1.2: Create `src/scripts/motion.ts` — bootstrap entry**

```ts
/**
 * Single bootstrap entry for all client motion behaviors.
 * Sets the global motion flag, then dispatches feature modules
 * conditionally based on user preference + viewport capability.
 */

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
    import('./counters').then(m => m.initCounters()),
  ])
} else {
  /* Reduced mode: still count up via final-value assignment, no animation. */
  void import('./counters').then(m => m.applyFinalValues())
}
```

- [ ] **Step 1.3: Modify `src/styles/global.css` — drop `// ` eyebrow prefix and body grid texture, add reduced-motion block at end**

Open `src/styles/global.css`. Find this block:

```css
/* Subtle grid texture across the page — reads as intentional,
   not the default dark-mode-gradient SaaS look. */
body::before {
  content: '';
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: -1;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.018) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.018) 1px, transparent 1px);
  background-size: 32px 32px;
  background-position: -1px -1px;
  mask-image: radial-gradient(ellipse at top, black 30%, transparent 75%);
  -webkit-mask-image: radial-gradient(ellipse at top, black 30%, transparent 75%);
}
```

**Delete it entirely** (the mesh gradient in `motion.css` replaces it).

Find this block:

```css
.eyebrow::before {
  content: '// ';
  color: var(--text-tertiary);
}
```

**Delete it entirely.**

At the very end of `global.css`, after the existing `@media (prefers-reduced-motion: reduce)` block, append:

```css
/* ---- Reveal & motion utilities (used by scripts/reveal.ts etc) ---- */

[data-reveal] {
  opacity: 0;
  transform: translateY(16px);
  transition: opacity 600ms cubic-bezier(0.22, 0.61, 0.36, 1),
              transform 600ms cubic-bezier(0.22, 0.61, 0.36, 1);
  will-change: opacity, transform;
}
[data-reveal].is-revealed {
  opacity: 1;
  transform: none;
}

html[data-motion="reduced"] [data-reveal] {
  opacity: 1;
  transform: none;
  transition: none;
}
```

- [ ] **Step 1.4: Modify `src/layouts/Base.astro` — import motion.css, mount ScrollProgress (stub), boot script**

Replace the file contents with:

```astro
---
import '../styles/global.css'
import '../styles/motion.css'
import Header from '../components/Header.astro'
import Footer from '../components/Footer.astro'

interface Props {
  title: string
  description?: string
}
const { title, description = 'Dictate anywhere on Windows. Polished by AI.' } = Astro.props
const base = import.meta.env.BASE_URL
---
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{title}</title>
    <meta name="description" content={description} />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:type" content="website" />
    <meta property="og:image" content={`${base}og-image.png`} />
    <meta name="twitter:card" content="summary_large_image" />
    <link rel="icon" type="image/svg+xml" href={`${base}favicon.svg`} />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600&family=JetBrains+Mono:wght@500;600;700&display=swap" rel="stylesheet" />
    <script is:inline>
      /* Set motion mode pre-paint so CSS branches before first frame. */
      document.documentElement.dataset.motion =
        window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'reduced' : 'full';
    </script>
  </head>
  <body>
    <Header />
    <slot />
    <Footer />
    <script>
      import '../scripts/motion'
    </script>
  </body>
</html>
```

Note: `ScrollProgress` is added in Task 2. The `<script>` block at body end is Astro's standard pattern for bundled client scripts.

- [ ] **Step 1.5: Modify `src/components/Footer.astro` — drop status block**

Open `src/components/Footer.astro`. Delete the block:

```astro
      <div class="footer-status">
        <span class="status-dot" aria-hidden="true"></span>
        v0.1.0 · all systems normal
      </div>
```

Also delete the matching CSS rules:

```css
  .footer-status {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-family: var(--font-mono);
    font-size: 0.78rem;
    color: var(--text-tertiary);
  }
  .status-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: var(--lime);
    box-shadow: 0 0 8px var(--lime);
  }
```

Leave `.footer-built` ("Built with care, not templates.") in place — it's tonal, not dev-coded.

- [ ] **Step 1.6: Modify `src/pages/index.astro` — drop the `$ super-flow start` prompt line**

In the HERO section, delete this line:

```astro
      <div class="hero-prompt"><span class="prompt-marker">$</span> super-flow start</div>
```

Also delete the matching CSS:

```css
  .hero-prompt {
    font-family: var(--font-mono);
    font-size: 0.85rem;
    color: var(--lime);
    margin-bottom: var(--space-5);
    letter-spacing: 0.02em;
  }
  .hero-prompt .prompt-marker { color: var(--text-tertiary); margin-right: 8px; }
```

Keep everything else in the hero for now (Task 9 reframes the H1 / subhead).

- [ ] **Step 1.7: Run dev server + manual smoke**

```
rtk npm run dev
```

Open `http://localhost:4321/super-flow-web/` in a browser. Verify:
- No `$ super-flow start` prompt above the H1.
- No `// ` prefix before any eyebrow label (`what it does`, `how it works`, etc.).
- No status dot or "all systems normal" line in the footer.
- A soft animated indigo+lime+amber gradient drifts behind the content (subtle, headings remain readable).
- No console errors in DevTools.
- Toggle OS reduced-motion (Windows: Settings → Accessibility → Visual effects → Animation effects → Off). Reload. Mesh gradient should be static. `<html>` element should have `data-motion="reduced"`.

Stop the dev server.

- [ ] **Step 1.8: Commit**

```
rtk git add src/styles/motion.css src/styles/global.css src/scripts/motion.ts src/layouts/Base.astro src/components/Footer.astro src/pages/index.astro
rtk git status
rtk git diff --staged --stat
rtk git commit -m "feat(motion): bootstrap + mesh gradient bg + drop dev cues"
```

---

## Task 2: Scroll-progress bar + scroll-reveal utility

**Files:**
- Create: `src/components/ScrollProgress.astro`
- Create: `src/scripts/reveal.ts`
- Modify: `src/layouts/Base.astro` (mount `<ScrollProgress />`)
- Modify: `src/components/FeatureCard.astro` (add `data-reveal`)
- Modify: `src/components/HowItWorksStep.astro` (add `data-reveal`)
- Modify: `src/pages/faq.astro` (add `data-reveal` to `<details>` items)
- Modify: `src/pages/index.astro` (add `data-reveal` to `.plan` cards in pricing teaser)

- [ ] **Step 2.1: Create `src/components/ScrollProgress.astro`**

```astro
---
/* Sticky 1px scroll-progress bar at top of viewport.
   Uses CSS scroll-driven animations where supported (Chrome/Edge 115+);
   falls back to scripts/scroll-progress.ts JS scroll listener otherwise.
   The script is bundled by motion.ts. */
---
<div class="scroll-progress" aria-hidden="true">
  <span class="scroll-progress-fill"></span>
</div>
<style>
  .scroll-progress {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    z-index: 1000;
    pointer-events: none;
    background: transparent;
  }
  .scroll-progress-fill {
    display: block;
    height: 100%;
    width: 0;
    background: linear-gradient(90deg, var(--accent), var(--lime));
    transform-origin: 0 0;
    /* Modern path: scroll-driven animation. JS fallback covers the rest. */
    animation: scrollFill linear;
    animation-timeline: scroll(root);
    animation-range: 0% 100%;
    transition: width 80ms linear;
    will-change: width, transform;
  }
  @keyframes scrollFill {
    from { width: 0; }
    to   { width: 100%; }
  }
  html[data-motion="reduced"] .scroll-progress-fill {
    animation: none;
  }
</style>
```

- [ ] **Step 2.2: Create `src/scripts/reveal.ts`**

```ts
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
```

- [ ] **Step 2.3: Mount `<ScrollProgress />` in `Base.astro`**

In `src/layouts/Base.astro`, add the import at the top alongside other component imports:

```astro
import ScrollProgress from '../components/ScrollProgress.astro'
```

In the `<body>`, add `<ScrollProgress />` as the first child (above `<Header />`):

```astro
  <body>
    <ScrollProgress />
    <Header />
    <slot />
    <Footer />
    <script>
      import '../scripts/motion'
    </script>
  </body>
```

- [ ] **Step 2.4: Add `data-reveal` to `FeatureCard.astro`**

In `src/components/FeatureCard.astro`, change the root `<div class="card">` to:

```astro
<div class="card" data-reveal>
```

- [ ] **Step 2.5: Add `data-reveal` to `HowItWorksStep.astro`**

In `src/components/HowItWorksStep.astro`, change the root `<div class="step">` to:

```astro
<div class="step" data-reveal>
```

- [ ] **Step 2.6: Add `data-reveal` to FAQ `<details>` items**

In `src/pages/faq.astro`, change `<details>` to `<details data-reveal>`.

- [ ] **Step 2.7: Add `data-reveal` to pricing-teaser plan cards in `index.astro`**

In `src/pages/index.astro`, change:

```astro
        <div class="plan">
```

to:

```astro
        <div class="plan" data-reveal>
```

And:

```astro
        <div class="plan plan-featured">
```

to:

```astro
        <div class="plan plan-featured" data-reveal>
```

- [ ] **Step 2.8: Run dev server + manual smoke**

```
rtk npm run dev
```

Verify:
- 1px gradient bar at the top of viewport fills left→right as you scroll.
- Feature cards, How-it-works steps, FAQ items, and pricing teaser cards animate in (fade + slide-up) as they enter the viewport.
- Siblings stagger 60ms apart, not all-at-once.
- With reduced-motion ON, all cards are immediately visible; bar fills instantly (no animation).
- No console errors.

Stop dev server.

- [ ] **Step 2.9: Commit**

```
rtk git add src/components/ScrollProgress.astro src/scripts/reveal.ts src/layouts/Base.astro src/components/FeatureCard.astro src/components/HowItWorksStep.astro src/pages/faq.astro src/pages/index.astro
rtk git diff --staged --stat
rtk git commit -m "feat(motion): scroll-progress bar + scroll-reveal cards"
```

---

## Task 3: 3D tilt + magnetic CTAs

**Files:**
- Create: `src/scripts/tilt.ts`
- Create: `src/scripts/magnetic.ts`
- Modify: `src/components/CtaButton.astro` (add `data-magnetic` to primary)
- Modify: `src/components/FeatureCard.astro` (add `data-tilt`)
- Modify: `src/pages/index.astro` (add `data-tilt` to pricing-teaser plans — Persona cards covered in Task 9)

- [ ] **Step 3.1: Create `src/scripts/tilt.ts`**

```ts
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
```

- [ ] **Step 3.2: Create `src/scripts/magnetic.ts`**

```ts
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
```

- [ ] **Step 3.3: Mark primary CTAs as magnetic**

In `src/components/CtaButton.astro`, change the anchor to add `data-magnetic` conditionally on primary:

```astro
<a
  href={href}
  class={`cta cta-${variant}`}
  data-magnetic={variant === 'primary' ? '' : undefined}
>
```

Also, since magnetic.ts sets `transform` directly, the CSS `transition` on `.cta` currently includes `transform 100ms ease` which fights with our per-frame updates. Tighten it to 60ms so it still smooths but doesn't lag:

Find:

```css
    transition: background 180ms ease, color 180ms ease, transform 100ms ease, box-shadow 180ms ease;
```

Change to:

```css
    transition: background 180ms ease, color 180ms ease, transform 60ms ease, box-shadow 180ms ease;
```

- [ ] **Step 3.4: Add `data-tilt` to FeatureCard**

In `src/components/FeatureCard.astro`, change:

```astro
<div class="card" data-reveal>
```

to:

```astro
<div class="card" data-reveal data-tilt>
```

- [ ] **Step 3.5: Add `data-tilt` to pricing-teaser plans**

In `src/pages/index.astro`, change:

```astro
        <div class="plan" data-reveal>
```

to:

```astro
        <div class="plan" data-reveal data-tilt>
```

And:

```astro
        <div class="plan plan-featured" data-reveal>
```

to:

```astro
        <div class="plan plan-featured" data-reveal data-tilt>
```

- [ ] **Step 3.6: Dev server smoke**

```
rtk npm run dev
```

Verify:
- Hover over a feature card or pricing card — it tilts toward the cursor (~6deg max). Move off — it snaps back.
- Move cursor near a primary "Download for Windows" CTA — it eases toward the cursor up to ~12px and returns when you move away.
- Secondary "See how it works" CTA does NOT move (only primary has `data-magnetic`).
- No console errors.
- With reduced-motion ON, tilt + magnetic stop firing (the module simply does not initialize because motion.ts skips the dispatch).
- On a touch-only viewport (or with browser DevTools touch emulation enabled), tilt/magnetic do not fire.

Stop dev server.

- [ ] **Step 3.7: Commit**

```
rtk git add src/scripts/tilt.ts src/scripts/magnetic.ts src/components/CtaButton.astro src/components/FeatureCard.astro src/pages/index.astro
rtk git diff --staged --stat
rtk git commit -m "feat(motion): 3D tilt cards + magnetic primary CTAs"
```

---

## Task 4: Hero audio waveform

**Files:**
- Create: `src/components/HeroWaveform.astro`
- Modify: `src/pages/index.astro` (mount `<HeroWaveform />` inside `.hero`)

- [ ] **Step 4.1: Create `src/components/HeroWaveform.astro`**

```astro
---
/* Inline SVG waveform behind the hero H1. 30 bars, CSS keyframes animate
   the `height` of each via staggered animation-delay. Lime stroke at low
   opacity. Decorative — aria-hidden. Pauses out of view via IntersectionObserver
   (set in scripts/motion.ts is sufficient — the element is scroll-revealed). */

const BARS = 30
---
<svg
  class="hero-waveform"
  viewBox="0 0 300 80"
  preserveAspectRatio="none"
  role="img"
  aria-hidden="true"
  xmlns="http://www.w3.org/2000/svg"
>
  {Array.from({ length: BARS }, (_, i) => (
    <rect
      x={i * 10 + 2}
      y={30}
      width={6}
      height={20}
      rx={2}
      class={`bar bar-${i % 5}`}
      style={`animation-delay: ${(i * 60) % 900}ms`}
    />
  ))}
</svg>
<style>
  .hero-waveform {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    opacity: 0.22;
    z-index: 0;
  }
  .bar {
    fill: var(--lime);
    transform-box: fill-box;
    transform-origin: 50% 50%;
    animation: barPulse 1.6s ease-in-out infinite;
  }
  /* Five base heights so the wave doesn't look uniform. */
  .bar-0 { animation-name: barPulseA; }
  .bar-1 { animation-name: barPulseB; }
  .bar-2 { animation-name: barPulseC; }
  .bar-3 { animation-name: barPulseD; }
  .bar-4 { animation-name: barPulseE; }

  @keyframes barPulseA { 0%,100%{transform:scaleY(0.4)} 50%{transform:scaleY(1.4)} }
  @keyframes barPulseB { 0%,100%{transform:scaleY(0.6)} 50%{transform:scaleY(1.8)} }
  @keyframes barPulseC { 0%,100%{transform:scaleY(0.3)} 50%{transform:scaleY(1.2)} }
  @keyframes barPulseD { 0%,100%{transform:scaleY(0.7)} 50%{transform:scaleY(2.0)} }
  @keyframes barPulseE { 0%,100%{transform:scaleY(0.5)} 50%{transform:scaleY(1.6)} }

  html[data-motion="reduced"] .bar { animation: none; }
</style>
```

- [ ] **Step 4.2: Mount waveform in homepage hero**

In `src/pages/index.astro`, add the import at the top with the others:

```astro
import HeroWaveform from '../components/HeroWaveform.astro'
```

Inside the `.hero` section (just after the opening `<section class="container hero">`), add:

```astro
      <HeroWaveform />
```

The hero must be positioned for the absolutely-positioned waveform to anchor correctly. In the `.hero` CSS rule, add `position: relative;`:

```css
  .hero {
    position: relative;
    padding: var(--space-8) 0 var(--space-7);
    max-width: 880px;
  }
```

Also make the hero content sit above the waveform — add `position: relative; z-index: 1;` to `.hero h1`, `.hero-tag`, `.hero-cta`, and `.hero-meta`. Simplest: wrap them all in a new `<div class="hero-content">` and style that:

In `index.astro`, change:

```astro
    <section class="container hero">
      <HeroWaveform />
      <h1>
        Dictate anywhere<br />
        on Windows.<br />
        <span class="hero-h1-accent">Polished by AI.</span>
      </h1>
      <p class="hero-tag">
        Press <kbd>F9</kbd> in any text field. Speak naturally. Super Flow
        removes filler, fixes grammar, and types the polished result.
      </p>
      <div class="hero-cta">
        <CtaButton href={downloadHref}>Download for Windows</CtaButton>
        <CtaButton href="#how" variant="secondary">See how it works</CtaButton>
      </div>
      <div class="hero-meta">
        Windows 10 &amp; 11 · 70 MB · Signed installer
      </div>
    </section>
```

to:

```astro
    <section class="container hero">
      <HeroWaveform />
      <div class="hero-content">
        <h1>
          Dictate anywhere<br />
          on Windows.<br />
          <span class="hero-h1-accent">Polished by AI.</span>
        </h1>
        <p class="hero-tag">
          Press <kbd>F9</kbd> in any text field. Speak naturally. Super Flow
          removes filler, fixes grammar, and types the polished result.
        </p>
        <div class="hero-cta">
          <CtaButton href={downloadHref}>Download for Windows</CtaButton>
          <CtaButton href="#how" variant="secondary">See how it works</CtaButton>
        </div>
        <div class="hero-meta">
          Windows 10 &amp; 11 · 70 MB · Signed installer
        </div>
      </div>
    </section>
```

Add to the `<style>` block in `index.astro`:

```css
  .hero-content {
    position: relative;
    z-index: 1;
  }
```

- [ ] **Step 4.3: Dev smoke**

```
rtk npm run dev
```

Verify:
- Hero shows pulsing lime bars behind the headline, low-opacity, not fighting with text.
- Bars animate with varied amplitudes (not all in lockstep).
- Reduced-motion: bars are visible but static.
- No layout shift.

Stop dev server.

- [ ] **Step 4.4: Commit**

```
rtk git add src/components/HeroWaveform.astro src/pages/index.astro
rtk git diff --staged --stat
rtk git commit -m "feat(hero): animated SVG audio waveform"
```

---

## Task 5: Stats strip + count-up counters

**Files:**
- Create: `src/components/StatsStrip.astro`
- Create: `src/scripts/counters.ts`
- Modify: `src/pages/index.astro` (mount `<StatsStrip />` between hero and features)

- [ ] **Step 5.1: Create `src/scripts/counters.ts`**

```ts
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
```

- [ ] **Step 5.2: Create `src/components/StatsStrip.astro`**

```astro
---
/* Three stat counters. Numbers chosen to be provable from product spec —
   no invented metrics. Final values are encoded in data-counter and animated
   by scripts/counters.ts when the strip scrolls into view. */

const stats = [
  { value: 2000,  suffix: '+',  label: 'words / week on the free tier' },
  { value: 1,     suffix: 's',  label: 'typical hotkey-to-text latency', prefix: '<' },
  { value: 100,   suffix: '%',  label: 'local on the free tier' },
]
---
<section class="container stats-strip" aria-label="Super Flow at a glance">
  <div class="stats-grid">
    {stats.map(s => (
      <div class="stat" data-reveal>
        <div class="stat-value">
          {s.prefix && <span class="stat-prefix">{s.prefix}</span>}
          <span data-counter={String(s.value)} data-counter-suffix={s.suffix} aria-label={`${s.prefix ?? ''}${s.value}${s.suffix}`}>
            0{s.suffix}
          </span>
        </div>
        <div class="stat-label">{s.label}</div>
      </div>
    ))}
  </div>
</section>
<style>
  .stats-strip {
    padding: var(--space-6) 0;
    margin-top: var(--space-6);
    border-top: 1px solid var(--border);
    border-bottom: 1px solid var(--border);
  }
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--space-5);
  }
  .stat { text-align: left; }
  .stat-value {
    font-family: var(--font-heading);
    font-size: clamp(2rem, 5vw, 3.4rem);
    font-weight: 600;
    line-height: 1;
    letter-spacing: -0.04em;
    color: var(--text);
    font-variant-numeric: tabular-nums;
    margin-bottom: var(--space-2);
    display: flex;
    align-items: baseline;
    gap: 4px;
  }
  .stat-prefix {
    color: var(--text-tertiary);
    font-size: 0.7em;
  }
  .stat-label {
    font-family: var(--font-mono);
    font-size: 0.82rem;
    color: var(--text-tertiary);
    letter-spacing: 0.04em;
  }
  @media (max-width: 640px) {
    .stats-grid { grid-template-columns: 1fr; gap: var(--space-4); }
  }
</style>
```

- [ ] **Step 5.3: Mount StatsStrip in `index.astro` between hero and features**

Add the import at the top of `src/pages/index.astro`:

```astro
import StatsStrip from '../components/StatsStrip.astro'
```

Insert `<StatsStrip />` between the `</section>` that closes HERO and the `<section class="container section">` for FEATURES:

```astro
    </section>

    <StatsStrip />

    <!-- FEATURES -->
    <section class="container section">
```

- [ ] **Step 5.4: Dev smoke**

```
rtk npm run dev
```

Verify:
- After the hero, three stat numbers appear: `2,000+`, `<1s`, `100%`. They count up from 0 once they enter the viewport.
- Layout doesn't jump when counting starts (initial `0` placeholder reserves width).
- On reduced-motion, the final values appear immediately (no count animation).
- Mobile (≤640px): one stat per row.

Stop dev server.

- [ ] **Step 5.5: Commit**

```
rtk git add src/scripts/counters.ts src/components/StatsStrip.astro src/pages/index.astro
rtk git diff --staged --stat
rtk git commit -m "feat(home): stats strip with animated count-up"
```

---

## Task 6: Marquee strip — "works in..."

**Files:**
- Create: `src/components/MarqueeApps.astro`
- Modify: `src/pages/index.astro` (mount after StatsStrip)

- [ ] **Step 6.1: Create `src/components/MarqueeApps.astro`**

```astro
---
/* Pure-CSS horizontal marquee of supported app names.
   No JS. Pauses on hover via animation-play-state.
   Two copies of the list sit side-by-side for seamless wrap.
   Accessible: visible row is aria-hidden, a sr-only static list announces the apps. */

const apps = [
  'Gmail', 'Notion', 'VS Code', 'Slack', 'Word',
  'Google Docs', 'Discord', 'Outlook', 'Linear', 'Figma',
  'ChatGPT', 'Cursor', 'Obsidian',
]
---
<section class="marquee-section" aria-label="Where Super Flow works">
  <div class="marquee-eyebrow">works in</div>
  <div class="marquee" aria-hidden="true">
    <div class="marquee-track">
      {apps.map(name => <span class="marquee-item">{name}</span>)}
      {apps.map(name => <span class="marquee-item" aria-hidden="true">{name}</span>)}
    </div>
  </div>
  <ul class="sr-only">
    {apps.map(name => <li>{name}</li>)}
  </ul>
</section>
<style>
  .marquee-section {
    padding: var(--space-6) 0;
    overflow: hidden;
  }
  .marquee-eyebrow {
    text-align: center;
    font-family: var(--font-mono);
    font-size: 0.78rem;
    text-transform: uppercase;
    letter-spacing: 0.14em;
    color: var(--text-tertiary);
    margin-bottom: var(--space-4);
  }
  .marquee {
    position: relative;
    width: 100%;
    overflow: hidden;
    mask-image: linear-gradient(90deg, transparent 0%, black 10%, black 90%, transparent 100%);
    -webkit-mask-image: linear-gradient(90deg, transparent 0%, black 10%, black 90%, transparent 100%);
  }
  .marquee-track {
    display: inline-flex;
    gap: var(--space-6);
    padding-right: var(--space-6);
    animation: marqueeScroll 28s linear infinite;
    white-space: nowrap;
    will-change: transform;
  }
  .marquee:hover .marquee-track { animation-play-state: paused; }
  .marquee-item {
    font-family: var(--font-heading);
    font-size: 1.1rem;
    font-weight: 500;
    color: var(--text-secondary);
    letter-spacing: -0.01em;
    flex-shrink: 0;
  }
  .marquee-item::after {
    content: '·';
    margin-left: var(--space-6);
    color: var(--text-tertiary);
  }
  @keyframes marqueeScroll {
    from { transform: translateX(0); }
    to   { transform: translateX(-50%); }
  }
  .sr-only {
    position: absolute;
    width: 1px; height: 1px;
    padding: 0; margin: -1px;
    overflow: hidden;
    clip: rect(0,0,0,0);
    white-space: nowrap;
    border: 0;
  }
  html[data-motion="reduced"] .marquee-track {
    animation: none;
    transform: none;
  }
</style>
```

- [ ] **Step 6.2: Mount in `index.astro` after StatsStrip**

Add the import at the top of `src/pages/index.astro`:

```astro
import MarqueeApps from '../components/MarqueeApps.astro'
```

Insert `<MarqueeApps />` between StatsStrip and the FEATURES section:

```astro
    <StatsStrip />

    <MarqueeApps />

    <!-- FEATURES -->
    <section class="container section">
```

- [ ] **Step 6.3: Dev smoke**

```
rtk npm run dev
```

Verify:
- A row of app names scrolls horizontally below the stats strip.
- Hover pauses the scroll.
- Left + right edges fade to background (no harsh cut).
- Names loop seamlessly — no visible jump.
- Reduced-motion: track is static (visible names from the first copy only).

Stop dev server.

- [ ] **Step 6.4: Commit**

```
rtk git add src/components/MarqueeApps.astro src/pages/index.astro
rtk git diff --staged --stat
rtk git commit -m "feat(home): marquee strip of supported apps"
```

---

## Task 7: Liquid blob shapes (subtle, all pages)

**Files:**
- Modify: `src/styles/motion.css` (add blob `@keyframes` + class)
- Modify: `src/layouts/Base.astro` (mount two `<div class="blob">` in body)

- [ ] **Step 7.1: Add blob styles to `motion.css`**

Append to `src/styles/motion.css`:

```css
/* ---- Liquid blob shapes — sit behind content, slow drift. ---- */

.blob {
  position: fixed;
  z-index: -1;
  pointer-events: none;
  filter: blur(80px);
  opacity: 0.4;
  border-radius: 50%;
  will-change: transform;
}
.blob-1 {
  width: 480px;
  height: 480px;
  top: -120px;
  left: -120px;
  background: radial-gradient(closest-side, var(--accent), transparent);
  animation: blobDrift1 28s ease-in-out infinite alternate;
}
.blob-2 {
  width: 520px;
  height: 520px;
  bottom: -180px;
  right: -160px;
  background: radial-gradient(closest-side, var(--lime), transparent);
  animation: blobDrift2 32s ease-in-out infinite alternate;
}

@keyframes blobDrift1 {
  0%   { transform: translate3d(0, 0, 0)        scale(1); }
  100% { transform: translate3d(120px, 80px, 0) scale(1.15); }
}
@keyframes blobDrift2 {
  0%   { transform: translate3d(0, 0, 0)         scale(1); }
  100% { transform: translate3d(-80px, -100px, 0) scale(0.9); }
}

html[data-motion="reduced"] .blob {
  animation: none;
  transform: none;
}
```

- [ ] **Step 7.2: Mount blobs in `Base.astro`**

In `src/layouts/Base.astro`, add two `<div>` elements as the first children of `<body>` (after `<ScrollProgress />`):

```astro
  <body>
    <ScrollProgress />
    <div class="blob blob-1" aria-hidden="true"></div>
    <div class="blob blob-2" aria-hidden="true"></div>
    <Header />
    <slot />
    <Footer />
    <script>
      import '../scripts/motion'
    </script>
  </body>
```

- [ ] **Step 7.3: Dev smoke**

```
rtk npm run dev
```

Verify:
- Two large soft glowing shapes — one indigo top-left, one lime bottom-right — drift slowly in the background of every page.
- Headings remain readable. No text contrast regression.
- Reduced-motion: blobs visible but static.

Stop dev server.

- [ ] **Step 7.4: Commit**

```
rtk git add src/styles/motion.css src/layouts/Base.astro
rtk git diff --staged --stat
rtk git commit -m "feat(motion): drifting blob shapes on all pages"
```

---

## Task 8: Hover glow on featured pricing card (animated gradient border)

**Files:**
- Modify: `src/pages/index.astro` (replace static `.plan-featured::before` border with animated `@property --angle` version)

- [ ] **Step 8.1: Replace the static gradient border with an animated one**

In `src/pages/index.astro`, find the existing rule:

```css
  .plan-featured::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: var(--radius-md);
    padding: 1px;
    background: linear-gradient(180deg, var(--accent), transparent);
    -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
    -webkit-mask-composite: xor;
            mask-composite: exclude;
    pointer-events: none;
  }
```

Replace with:

```css
  @property --plan-angle {
    syntax: '<angle>';
    initial-value: 0deg;
    inherits: false;
  }
  .plan-featured::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: var(--radius-md);
    padding: 1px;
    background: conic-gradient(
      from var(--plan-angle),
      var(--accent) 0deg,
      var(--lime) 90deg,
      var(--accent) 180deg,
      var(--accent-hover) 270deg,
      var(--accent) 360deg
    );
    -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
    -webkit-mask-composite: xor;
            mask-composite: exclude;
    pointer-events: none;
    animation: planAngleSpin 6s linear infinite;
  }
  .plan-featured:hover::before {
    filter: drop-shadow(0 0 12px var(--accent-glow));
  }
  @keyframes planAngleSpin {
    from { --plan-angle: 0deg; }
    to   { --plan-angle: 360deg; }
  }
  html[data-motion="reduced"] .plan-featured::before {
    animation: none;
    background: linear-gradient(180deg, var(--accent), transparent);
  }
```

- [ ] **Step 8.2: Dev smoke**

```
rtk npm run dev
```

Verify:
- The "Pro" card border in the homepage pricing teaser shows a slowly rotating conic gradient (indigo → lime → indigo → indigo-hover → indigo). Hover intensifies the glow.
- Reduced-motion: static linear-gradient border (matches previous look).
- No layout shift.

Stop dev server.

- [ ] **Step 8.3: Commit**

```
rtk git add src/pages/index.astro
rtk git diff --staged --stat
rtk git commit -m "feat(home): animated conic gradient border on Pro plan card"
```

---

## Task 9: Persona section + hero copy reframe + feature reorder

**Files:**
- Create: `src/components/PersonaCard.astro`
- Modify: `src/pages/index.astro` (hero H1 + subhead reframe, feature reorder, mount Personas section)

- [ ] **Step 9.1: Create `src/components/PersonaCard.astro`**

```astro
---
/* One persona card: icon SVG + label + use case + before/after sample dictation.
   data-reveal + data-tilt — picked up by reveal.ts + tilt.ts. */

interface Props {
  icon: string         /* one of the inline SVG paths defined below */
  label: string
  useCase: string
  before: string
  after: string
}
const { icon, label, useCase, before, after } = Astro.props

const icons: Record<string, string> = {
  pen:     'M3 17v4h4l11.5-11.5-4-4L3 17zM21 6.5L17.5 3l-2 2 3.5 3.5 2-2z',
  headset: 'M12 3a9 9 0 0 0-9 9v5a3 3 0 0 0 3 3h2v-7H5v-1a7 7 0 0 1 14 0v1h-3v7h2a3 3 0 0 0 3-3v-5a9 9 0 0 0-9-9z',
  book:    'M4 4h6a4 4 0 0 1 4 4v12a3 3 0 0 0-3-3H4V4zm16 0h-6a4 4 0 0 0-4 4v12a3 3 0 0 1 3-3h7V4z',
  code:    'M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z',
}
const path = icons[icon] ?? icons.pen
---
<article class="persona" data-reveal data-tilt>
  <div class="persona-head">
    <svg class="persona-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d={path} fill="currentColor" />
    </svg>
    <div class="persona-label">{label}</div>
  </div>
  <p class="persona-use">{useCase}</p>
  <div class="persona-sample">
    <div class="sample-row sample-before">
      <span class="sample-tag">said</span>
      <span class="sample-text">{before}</span>
    </div>
    <div class="sample-row sample-after">
      <span class="sample-tag">typed</span>
      <span class="sample-text">{after}</span>
    </div>
  </div>
</article>
<style>
  .persona {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    padding: var(--space-5);
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    transition: background 200ms ease, border-color 200ms ease;
  }
  .persona:hover {
    background: var(--surface-hover);
    border-color: var(--border-strong);
  }
  .persona-head {
    display: flex;
    align-items: center;
    gap: var(--space-3);
  }
  .persona-icon {
    width: 22px;
    height: 22px;
    color: var(--accent);
    flex-shrink: 0;
  }
  .persona-label {
    font-family: var(--font-heading);
    font-size: 1rem;
    font-weight: 600;
    color: var(--text);
    letter-spacing: -0.01em;
  }
  .persona-use {
    margin: 0;
    font-size: 0.94rem;
    color: var(--text-secondary);
    line-height: 1.5;
  }
  .persona-sample {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    margin-top: var(--space-2);
    padding-top: var(--space-3);
    border-top: 1px dashed var(--border);
  }
  .sample-row {
    display: grid;
    grid-template-columns: 56px 1fr;
    gap: var(--space-3);
    align-items: start;
  }
  .sample-tag {
    font-family: var(--font-mono);
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--text-tertiary);
    padding-top: 2px;
  }
  .sample-after .sample-tag { color: var(--lime); }
  .sample-text {
    font-size: 0.88rem;
    color: var(--text);
    line-height: 1.5;
  }
  .sample-before .sample-text { color: var(--text-tertiary); font-style: italic; }
</style>
```

- [ ] **Step 9.2: Reframe hero copy + reorder features + add personas section**

In `src/pages/index.astro`, change the imports block to also import PersonaCard:

```astro
import PersonaCard from '../components/PersonaCard.astro'
```

Replace the existing `features` array with a reordered + broadened version:

```ts
const features = [
  { title: 'F9 to dictate',     body: 'Tap <kbd>F9</kbd> in any text field — email, Slack, doc, browser — and the system types what you say.' },
  { title: 'Polish hotkey',     body: 'Select messy text, press <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>P</kbd>, get clean prose back in place.' },
  { title: 'Voice snippets',    body: 'Say a trigger phrase, get a full email signature, address, or boilerplate.' },
  { title: 'Custom dictionary', body: 'Teach Super Flow your jargon, names, and acronyms once.' },
  { title: 'Local or cloud',    body: 'Whisper runs offline; Deepgram + GPT-4o-mini when you want cloud speed.' },
  { title: 'IDE-aware coding',  body: 'When the cursor is in code, Super Flow speaks camelCase, snake_case, and your file context.' },
]
```

Add a `personas` array near the existing `features` / `steps`:

```ts
const personas = [
  {
    icon: 'pen',
    label: 'Writers',
    useCase: 'Drafting long-form posts and essays.',
    before: 'so basically what im saying is like um the whole point of this is that you can just talk instead of typing right',
    after: 'The point is simple: you talk instead of typing.',
  },
  {
    icon: 'headset',
    label: 'Support leads',
    useCase: 'Replying to tickets without RSI by 4pm.',
    before: 'hi sorry for the delay um can you try restarting and then like let me know if that helps',
    after: 'Sorry for the delay. Could you try restarting and let me know if that helps?',
  },
  {
    icon: 'book',
    label: 'Students',
    useCase: 'Taking notes faster than they can be lectured.',
    before: 'so the thing about the krebs cycle is its like a loop and it takes acetyl coa and turns it into co2 i think',
    after: 'The Krebs cycle is a loop: it takes acetyl-CoA and turns it into CO₂.',
  },
  {
    icon: 'code',
    label: 'Developers',
    useCase: 'Dictating PR descriptions, commits, and code comments.',
    before: 'this pr adds the new auth flow plus a couple bug fixes also fixes the thing with the dropdown',
    after: 'This PR adds the new auth flow and fixes the dropdown bug.',
  },
]
```

Reframe the hero H1 + tag. Replace:

```astro
      <div class="hero-content">
        <h1>
          Dictate anywhere<br />
          on Windows.<br />
          <span class="hero-h1-accent">Polished by AI.</span>
        </h1>
        <p class="hero-tag">
          Press <kbd>F9</kbd> in any text field. Speak naturally. Super Flow
          removes filler, fixes grammar, and types the polished result.
        </p>
```

with:

```astro
      <div class="hero-content">
        <div class="hero-kicker">for anyone who types</div>
        <h1>
          Speak.<br />
          <span class="hero-h1-accent">We'll polish.</span>
        </h1>
        <p class="hero-tag">
          Press <kbd>F9</kbd> in any text field — email, doc, chat, code.
          Super Flow removes the <em>ums</em>, fixes the grammar, and types
          the clean version into whatever app you are focused on.
        </p>
```

Add the hero-kicker style in the same `<style>` block:

```css
  .hero-kicker {
    display: inline-block;
    font-family: var(--font-mono);
    font-size: 0.78rem;
    text-transform: uppercase;
    letter-spacing: 0.14em;
    color: var(--lime);
    margin-bottom: var(--space-4);
    padding: 4px 10px;
    border: 1px solid var(--lime-soft);
    background: var(--lime-soft);
    border-radius: var(--radius-sm);
  }
```

Insert a new "Who uses it" section between HOW IT WORKS and PRICING TEASER:

```astro
    <!-- WHO IT'S FOR -->
    <section class="container section">
      <span class="eyebrow">who uses it</span>
      <h2>Not just for developers.</h2>
      <div class="personas-grid">
        {personas.map(p => (
          <PersonaCard
            icon={p.icon}
            label={p.label}
            useCase={p.useCase}
            before={p.before}
            after={p.after}
          />
        ))}
      </div>
    </section>
```

And add the personas grid style:

```css
  /* PERSONAS — 2x2 grid that collapses to single column on mobile. */
  .personas-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-4);
    margin-top: var(--space-5);
  }
  @media (max-width: 700px) {
    .personas-grid { grid-template-columns: 1fr; }
  }
```

- [ ] **Step 9.3: Dev smoke**

```
rtk npm run dev
```

Verify:
- Hero shows lime "FOR ANYONE WHO TYPES" tag, then a tighter H1 "Speak. We'll polish." with the accent on the second line.
- New "Who uses it" section appears between How-it-works and Pricing teaser, with 4 persona cards. Each card has icon + label + use case + a `said` / `typed` before/after pair.
- Persona cards tilt on hover and reveal on scroll.
- Feature grid now ends with "IDE-aware coding" (last in order).
- Mobile (≤700px): persona cards stack one per row.
- No console errors.

Stop dev server.

- [ ] **Step 9.4: Commit**

```
rtk git add src/components/PersonaCard.astro src/pages/index.astro
rtk git diff --staged --stat
rtk git commit -m "feat(home): broaden audience — kicker + new hero copy + personas section"
```

---

## Task 10: Cross-page polish + verification

**Files:**
- Modify: `src/pages/pricing.astro` (add `data-reveal` to PricingTable rows by passing into the table)
- Modify: `src/components/PricingTable.astro` (add `data-reveal` to each `<tr>` inside `<tbody>`)
- Modify: `src/pages/about.astro` (add `data-reveal` to paragraphs + contact block — quick win, no new component)

- [ ] **Step 10.1: Add `data-reveal` to PricingTable rows**

In `src/components/PricingTable.astro`, change:

```astro
      {rows.map(row => (
        <tr>
```

to:

```astro
      {rows.map(row => (
        <tr data-reveal>
```

- [ ] **Step 10.2: Add `data-reveal` to about-page paragraphs**

In `src/pages/about.astro`, add `data-reveal` to each `<p>` in `.about` and to the `.contact-block`:

```astro
    <p data-reveal>...</p>
    <p data-reveal>...</p>
    <p data-reveal>...</p>
    <div class="contact-block" data-reveal>
```

- [ ] **Step 10.3: Full dev-server smoke across all 4 pages**

```
rtk npm run dev
```

Open each page in turn at `http://localhost:4321/super-flow-web/<page>/`:

1. **Home (`/`)**:
   - Hero: kicker tag, new H1, waveform behind, no `$` prompt.
   - Stats strip counts up.
   - Marquee scrolls + pauses on hover.
   - Feature cards tilt + reveal-in.
   - Personas section appears with 4 cards, tilt + reveal.
   - Pro plan card has animated conic gradient border.
   - Magnetic primary CTA pulls toward cursor.
   - Mesh gradient + blobs drift in the background.

2. **Pricing (`/pricing/`)**:
   - Mesh + blobs visible.
   - Table rows fade-in as you scroll.
   - Scroll progress bar fills.
   - No console errors.

3. **FAQ (`/faq/`)**:
   - Mesh + blobs visible.
   - `<details>` items reveal-in as you scroll.
   - Scroll progress bar fills.

4. **About (`/about/`)**:
   - Mesh + blobs visible.
   - Paragraphs fade-in as you scroll.

5. **Reduced-motion** (Windows: Settings → Accessibility → Visual effects → Animation effects → Off; or DevTools → Rendering → Emulate CSS media feature `prefers-reduced-motion: reduce`):
   - Reload each page.
   - Mesh, waveform, blobs, marquee, conic border, count-up, reveal — all static / instant.

Stop dev server. Commit only after manual smoke passes.

- [ ] **Step 10.4: Type-check the project**

```
rtk npx astro check
```

Expected: 0 errors. (Warnings about unused imports are OK to ignore — fix only if they're in files you touched.)

- [ ] **Step 10.5: Production build sanity check**

```
rtk npm run build
```

Expected: build completes with no errors. Output lands in `dist/`. JS bundle for motion.ts + sub-modules combined should be <8KB minified — check via:

```
rtk ls -la dist/_astro/*.js
```

Note the size of the motion entry. If it's significantly over budget (>10KB), open an issue — but for v1 don't block on it.

- [ ] **Step 10.6: Playwright CLI screenshot diff (optional but recommended)**

```
rtk npm run dev
```

In another shell, drive a Playwright session against `http://localhost:4321/super-flow-web/` at desktop (1440×900) and mobile (390×844) viewports. Capture screenshots of home / pricing / faq / about. Visually confirm:
- No content overflow.
- Mesh gradient + blobs not crushing text contrast.
- Mobile layout collapses correctly (stats grid 1col, personas 1col, marquee still fades at edges).

Stop dev server.

- [ ] **Step 10.7: Commit + push branch**

```
rtk git add src/pages/pricing.astro src/components/PricingTable.astro src/pages/about.astro
rtk git diff --staged --stat
rtk git commit -m "feat(motion): scroll-reveal across pricing/about + final polish"
rtk git push -u origin feat/maximalist-redesign
```

- [ ] **Step 10.8: Open PR**

```
rtk gh pr create --title "feat: maximalist redesign + broadened audience" --body "Implements docs/superpowers/specs/2026-05-27-maximalist-redesign-design.md.

Adds: animated mesh gradient bg, drifting blob shapes, scroll-progress bar, scroll-reveal cards, 3D mousemove tilt, magnetic primary CTAs, animated hero audio waveform, count-up stats strip (3 provable numbers: 2000+ words/wk, <1s latency, 100% local), marquee of supported apps, animated conic gradient border on Pro plan card, new 'Who uses it' personas section (Writer / Support lead / Student / Developer), hero copy reframe (kicker + 'Speak. We'll polish.'), feature reorder.

Drops: terminal '\$ super-flow start' prompt, '// ' eyebrow prefix, 'all systems normal' footer.

Respects prefers-reduced-motion: every animation has a static fallback.

Verified locally on home / pricing / faq / about at desktop + mobile viewports. astro check clean."
```

- [ ] **Step 10.9: Merge PR after green checks (or admin override per user policy)**

```
rtk gh pr merge --squash --admin --delete-branch
```

- [ ] **Step 10.10: Verify live deploy**

Watch the GitHub Actions workflow:

```
rtk gh run list --repo man-vu/super-flow-web --limit 3
```

Wait for the most recent `pages-build-deployment` workflow to complete (green). Then open `https://manvu.ca/super-flow-web/` in a fresh browser window and confirm:
- Mesh gradient + blobs visible.
- Stats counted up.
- Persona section present.
- No `$ super-flow start` prompt.
- Mobile (DevTools 390×844): layouts intact.
- `auth-callback` still works: open `https://manvu.ca/super-flow-web/auth-callback/` — it should render the "Signed in" card (functional bouncer, untouched).

Mark this task complete only after the live URL shows the changes.

---

## Spec coverage check

Spec section → Plan task:

- M1 mesh gradient bg → Task 1
- M2 hero waveform → Task 4
- M3 scroll-progress bar → Task 2
- M4 scroll-reveal → Tasks 2 + 10
- M5 3D tilt → Task 3 (+ Persona Task 9)
- M6 magnetic CTAs → Task 3
- M7 stats counters → Task 5
- M8 liquid blobs → Task 7
- M9 marquee → Task 6
- M10 hover glow on featured pricing card → Task 8
- M11 reduced-motion → every task (per-feature, gated by `data-motion="reduced"`)
- Copy: drop `$` prompt → Task 1; drop `// ` eyebrow → Task 1; drop "all systems normal" → Task 1; reorder features → Task 9; new hero H1/tag → Task 9; persona section → Task 9
- Footer change → Task 1
- All-page propagation → Tasks 1, 7 (bg fx via Base.astro), Task 10 (per-page reveal)
- No changes to `auth-callback.astro` → enforced in Task 10.10 (smoke verifies it still works)
- JS bundle budget → Task 10.5 reports size
- Lighthouse target → not gated in plan (manual after merge if desired)
