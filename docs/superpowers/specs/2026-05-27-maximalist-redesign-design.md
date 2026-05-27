# Marketing site — maximalist redesign + broadened audience

Date: 2026-05-27
Repo: `super-flow-web` (Astro 5, served at `manvu.ca/super-flow-web/`)
Scope: marketing site only. Electron app (`wispr-clone/`) untouched.

## Problem

Current site is technically polished but two things hold it back:

1. **Dev-coded surface** — the homepage hero leads with a terminal prompt (`$ super-flow start`), eyebrows use a `//` comment prefix, `kbd` elements appear in body copy as decoration, and "IDE-aware" sits high in the feature grid. This filters out writers, students, support agents, knowledge workers — the broader audience Super Flow actually serves.
2. **Visually quiet** — no motion, no background fx, no scroll-reveal, no interaction beyond hover transitions. Reads as a competent template instead of a product worth downloading.

The user asked for "animations, gradients and all cool UI stuff" *and* "it's not just for devs." Both shifts need to happen together so the redesign feels coherent.

## Goals

- Broaden audience signal without losing the distinctive identity that was built earlier.
- Add layered motion + gradient + interaction that gives the site personality, while respecting `prefers-reduced-motion`.
- Keep the site fast and static: vanilla CSS + small vanilla JS, no animation framework, total added JS budget <8KB minified.

## Non-goals

- No copy rewrite beyond the audience-broadening edits called out below.
- No new pages, no blog, no testimonials (none exist yet).
- No changes to `auth-callback.astro` (it's a functional bouncer, not marketing).
- No font swap. JetBrains Mono headings + IBM Plex Sans body stay.

## Identity changes

| Keep | Drop / replace |
|------|---------------|
| JetBrains Mono headings | `$ super-flow start` hero prompt |
| IBM Plex Sans body | `//` prefix on `.eyebrow` |
| Lime (`#a3e635`) + indigo (`#6366f1`) accents | "kbd as bullet" inside body copy |
| Warmer black background (`#0a0a0b`) | "IDE-aware" as top-line feature framing |
| Sharp corners (4 / 6 / 10 px radii) | Body grid texture (replaced by mesh gradient) |
| `<kbd>` for actual hotkey references (e.g. F9) | "all systems normal" footer line |
| Eyebrow tags (small uppercase) | |

## Copy changes

**Homepage hero:**
- Remove `$ super-flow start` prompt line.
- Subhead reframed to lead with outcome, not command. Current "Press F9 in any text field. Speak naturally..." becomes a sub-supporting line under a more emotional H1.
- New optional supporting kicker (above H1): small lime tag e.g. `for anyone who types` — replaces the prompt visually but invites instead of gating.

**Feature grid (`features` array in `index.astro`):**
- Reorder so "IDE-aware" drops from middle to last.
- New feature copy examples:
  - "F9 to dictate" → keep, but examples mention email + Slack + docs, not "code editor."
  - "Polish hotkey" → keep.
  - "Voice snippets" → keep.
  - "Custom dictionary" → keep.
  - "Local or cloud" → keep.
  - "IDE-aware" → keep but moved last.

**New section — "Who uses it":**
Placed between "How it works" and the pricing teaser. Four cards, each with:
- Persona icon (SVG, single color)
- Persona label (e.g. "Writer", "Support lead", "Student", "Developer")
- One-line use case
- Sample dictation → polished output (small mono "before / after")

**Eyebrow component:**
- Remove the `::before { content: '// '; }` rule from `global.css`.
- Eyebrows become a small uppercase tag (current letter-spacing + color already work).

## Visual / motion effects

Numbered for the implementation plan to reference.

### M1 — Animated mesh gradient background (hero, all pages)
Three large radial gradients (indigo, lime, amber) drifting on a slow `transform: translate3d` keyframe loop (~14s, ease-in-out). Lives inside a fixed `body::before` pseudo-element. Replaces the current grid texture. Total alpha contribution capped at 0.18 so headings stay readable (current grid sits at 0.018; this is ~10× bolder but still well under text contrast threshold).

### M2 — Animated SVG audio waveform (homepage hero only)
Pure inline SVG behind the H1. ~30 vertical bars, CSS `@keyframes` morphing `height` per bar with staggered `animation-delay`. Lime stroke at low opacity. Stops when off-viewport via IntersectionObserver to save CPU.

### M3 — Sticky scroll-progress bar (all pages)
1px lime bar at top of viewport, fills left-to-right as the page scrolls. CSS-only via `animation-timeline: scroll(root)` with fallback to a tiny JS scroll listener for browsers lacking support. Position: `fixed; top: 0;` so it sits above the sticky header.

### M4 — Scroll-reveal on cards (all pages, applies to FeatureCard, HowItWorksStep, persona cards, pricing plans, FAQ items)
IntersectionObserver utility (~30 lines). Cards start at `opacity: 0; translateY(16px)` then animate to visible on entry. 60ms stagger between siblings inside the same grid. `prefers-reduced-motion: reduce` short-circuits to instant visible.

### M5 — 3D tilt on cards (all pages, mouse only)
Vanilla JS `mousemove` handler computes rotateX/rotateY based on cursor position over each card, clamped to ±6deg. Uses `transform: perspective(800px) rotateX() rotateY()`. Pointer-coarse media query disables on touch. Applies to: feature cards, persona cards, pricing plans.

### M6 — Magnetic CTAs (all pages, primary buttons only)
Vanilla JS — when cursor enters a 100px radius around any `.cta-primary`, button translates toward cursor by up to 12px with cubic-bezier easing. Returns to rest on mouseleave. Touch devices: no-op.

### M7 — Animated stat counters (new "stats strip" section on homepage, between hero and features)
Three big numbers with descriptors. **Numbers are placeholder — user to confirm or replace before launch.** Suggested set if no real data is available:
- `2,000` words / week (free tier limit — provable, not invented)
- `<1s` typical hotkey-to-text latency (matches the in-app spec)
- `100%` local on Free tier (provable claim about Whisper)

If the user has real usage numbers we can swap in (e.g. "12M+ words polished" once we have telemetry), use those instead. **Do not ship invented metrics.**

Numbers count up from 0 when scrolled into view (IntersectionObserver). Mono font, big, tabular-nums. Reduced-motion: no count animation, numbers just appear.

### M8 — Liquid blob shapes (faint, in section backgrounds, all pages)
Two SVG blobs per long section with `feGaussianBlur` + `feColorMatrix` filter giving them a soft "ink" feel. CSS `@keyframes` slowly translates + rotates them (~25s loop). Lime and indigo tints at ~6% opacity so they don't fight with text. Inside `pointer-events: none` containers.

### M9 — Marquee strip ("works in...")
New section after stats strip on homepage. Single row of app logos + names: Gmail, Notion, VS Code, Slack, Word, Google Docs, Discord, Outlook, Linear, Figma. Pure CSS `@keyframes translateX` infinite loop. Pauses on hover via `animation-play-state: paused`. Two duplicate rows side-by-side for seamless wrap. Fades to bg at left/right edges via gradient masks.

### M10 — Hover glow on featured pricing card (homepage + pricing page)
Already has a static gradient border. Upgrade: gradient now rotates via animated `--angle` CSS custom property (`@property --angle: angle`). Slow ~6s rotation. Glow brightens on hover.

### M11 — `prefers-reduced-motion` support
A single CSS block at the end of `global.css` that:
- Stops all `@keyframes` animations.
- Disables tilt + magnetic JS listeners (controlled by a `<html data-motion="reduced">` attribute set on page load if the media query matches).
- Makes counters jump to final value.
- Mesh gradient + blobs become static (no `transform` keyframes).

## Architecture

```
super-flow-web/
├── src/
│   ├── components/
│   │   ├── Header.astro              (no change)
│   │   ├── Footer.astro              (drop "all systems normal" line)
│   │   ├── FeatureCard.astro         (add data-tilt + data-reveal attrs)
│   │   ├── HowItWorksStep.astro      (add data-reveal attr)
│   │   ├── PricingTable.astro        (no change)
│   │   ├── CtaButton.astro           (variant="primary" gets .cta-primary + data-magnetic)
│   │   ├── PersonaCard.astro         NEW
│   │   ├── StatsStrip.astro          NEW
│   │   ├── MarqueeApps.astro         NEW
│   │   ├── HeroWaveform.astro        NEW (inline SVG + CSS)
│   │   └── ScrollProgress.astro      NEW (1px bar, JS fallback)
│   ├── layouts/
│   │   └── Base.astro                (mount scroll-progress, motion-bootstrap script)
│   ├── pages/
│   │   ├── index.astro               (hero copy reframe, add stats strip, personas, marquee)
│   │   ├── pricing.astro             (no copy change, gets bg fx)
│   │   ├── faq.astro                 (no copy change, gets bg fx + scroll-reveal)
│   │   ├── about.astro               (no copy change, gets bg fx)
│   │   └── auth-callback.astro       (UNTOUCHED)
│   ├── scripts/                       NEW directory
│   │   ├── motion.ts                  (entrypoint — bootstraps reveal/tilt/magnetic/counters/marquee-pause)
│   │   ├── reveal.ts                  (IntersectionObserver for scroll-reveal)
│   │   ├── tilt.ts                    (mousemove → rotateX/Y, opt-in via [data-tilt])
│   │   ├── magnetic.ts                (cursor proximity → translate, opt-in via [data-magnetic])
│   │   ├── counters.ts                (count-up via IntersectionObserver, opt-in via [data-counter])
│   │   └── scroll-progress.ts         (fallback for browsers without scroll-driven anims)
│   └── styles/
│       ├── global.css                 (drop // eyebrow, drop body grid, add reduced-motion block)
│       └── motion.css                 NEW (all @keyframes, mesh gradient, blobs, marquee)
```

`motion.ts` is the single client-side script, loaded once from `Base.astro` via `<script src=... type="module">`. Each sub-module is tree-shaken into the same bundle.

## Data flow

All marketing content stays as inline Astro frontmatter arrays (no CMS, no fetch). Persona cards and marquee items are simple typed const arrays inside `index.astro` (or extracted to `src/content/personas.ts` if they grow).

## Reduced motion

A `<script>` block at the top of `Base.astro` (runs before any other JS) sets `document.documentElement.dataset.motion = matchMedia('(prefers-reduced-motion: reduce)').matches ? 'reduced' : 'full'`. All motion modules and CSS keyframes branch off this attribute. No animation runs if `reduced`.

## Accessibility

- Mesh gradient + blobs sit behind text with `aria-hidden="true"` and `pointer-events: none`.
- Scroll progress bar is `aria-hidden="true"`.
- Waveform SVG is `role="img" aria-hidden="true"` (decorative).
- Marquee uses `aria-hidden="true"` for the visual strip + a hidden static list for screen readers (single comma-separated list inside `.sr-only`).
- Counters announce final value via `aria-label` on the surrounding element so SR users skip the animation.
- All interactive cards remain keyboard-reachable; tilt + magnetic effects only fire on `mousemove` so keyboard nav is unaffected.

## Performance

- All animations use `transform` and `opacity` only (composited).
- `will-change: transform` only on actively animating elements, removed via JS after first interaction.
- IntersectionObserver-gated effects (waveform, counters, scroll-reveal) don't run while off-screen.
- Total added JS: target <8KB minified (5 small modules, no deps).
- CSS additions: ~6KB (mesh gradient + blobs + marquee + reveal transitions).
- Lighthouse score target: ≥95 performance, ≥95 accessibility (current baseline measured before any work begins, regression budget ±2 points).

## Testing

- Manual smoke at `localhost:4321` (Astro dev server) on each page.
- Playwright CLI mobile + desktop screenshots (390×844, 1440×900) to confirm:
  - No motion when `prefers-reduced-motion: reduce`.
  - No tilt or magnetic on touch viewport.
  - Layouts not broken on either size.
- Verify GitHub Actions deploy succeeds (existing `withastro/action@v3` workflow).
- Smoke verify auth-callback page still works post-deploy (touch nothing, but redeploy could surface a regression).

## Decisions made (not open)

- Vanilla JS + CSS — no Motion / Framer / GSAP. Keeps bundle tiny and Astro static.
- Inline SVG for waveform + blobs — no external assets, no extra HTTP roundtrip.
- Marquee built CSS-first — no JS until you hover (then a paused-state class).
- Personas stay homepage-only (no `/personas` page).
- No changes to `Header.astro` or `Footer.astro` layout; only Footer drops the "all systems normal" line.
- Reduced-motion path is a hard requirement, not an enhancement.

## Risks

- **Mesh gradient over text:** if opacity not capped correctly, headings become unreadable. Mitigation: cap mesh gradient alpha at 0.18 (current grid texture sits at 0.018, so we're 10x bolder but still well under text contrast threshold).
- **Tilt + magnetic on cards inside reveal containers:** transforms can fight each other. Mitigation: tilt only applies after the reveal animation finishes (`transitionend` listener on the reveal class).
- **CSS scroll-driven animations limited browser support:** Chrome/Edge 115+ only. JS fallback handles Safari/Firefox. Both paths tested.
- **Counter animations on slow devices:** counting from 0 to 12M could thrash. Mitigation: `requestAnimationFrame` with timing cap at 1.2s total regardless of target value.

## Out of scope (explicit)

- Anything in `D:/projects/clones/wispr-clone/` (Electron app, Settings UI, product tour, etc.).
- The Supabase Dashboard config (already fixed manually).
- Re-spec'ing the existing pricing model.
- A blog or any new content type.
- Internationalization.
