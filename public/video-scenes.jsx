/* Super Flow — 30s marketing film. Scenes for animations.jsx Stage.
   Brand per marketing/DESIGN.md: paper + ink + one violet, Spectral/Archivo,
   one dark "Graphite" glass moment. */
const { Easing, clamp, useTime, useSprite } = window;

const C = {
  paper: '#f4f1ea', paper2: '#ece7dc',
  ink: '#1d1a16', inkMut: '#574f44',
  violet: '#6d4ad6', violetDeep: '#4b2fa8', violetSoft: 'rgba(109,74,214,0.12)',
  glass: '#17161c', glassPanel: '#1c1b22',
  glassAccent: '#8f7bff', glassText: '#efeaf7', glassMut: '#a9a2bb',
  amber: '#e0a83a', go: '#5bbd83', live: '#e2655a',
};
const SERIF = '"Spectral", Georgia, serif';
const SANS = '"Archivo", system-ui, sans-serif';
const MONO = '"JetBrains Mono", ui-monospace, monospace';

/* ---------- helpers ---------- */
function sceneOpacity(localTime, duration, inDur = 0.5, outDur = 0.45) {
  const i = Easing.easeOutCubic(clamp(localTime / inDur, 0, 1));
  const o = Easing.easeInCubic(clamp((duration - localTime) / outDur, 0, 1));
  return Math.min(i, o);
}

// clip-reveal block of text (slides up from a mask)
function Reveal({ children, delay = 0, dur = 0.7, y = 115, style = {}, innerStyle = {} }) {
  const { localTime } = useSprite();
  const t = clamp((localTime - delay) / dur, 0, 1);
  const e = Easing.easeOutCubic(t);
  return (
    <div style={{ overflow: 'hidden', paddingBottom: '0.08em', ...style }}>
      <div style={{ transform: `translateY(${(1 - e) * y}%)`, opacity: t > 0 ? 1 : 0, willChange: 'transform' }}>
        {children}
      </div>
    </div>
  );
}

// fade+rise simple element
function Rise({ children, delay = 0, dur = 0.6, dist = 26, style = {} }) {
  const { localTime } = useSprite();
  const t = Easing.easeOutCubic(clamp((localTime - delay) / dur, 0, 1));
  return <div style={{ opacity: t, transform: `translateY(${(1 - t) * dist}px)`, willChange: 'transform, opacity', ...style }}>{children}</div>;
}

function Eyebrow({ children, color = C.violet, delay = 0, style = {} }) {
  return (
    <Rise delay={delay} dist={14}>
      <div style={{ fontFamily: MONO, fontSize: 24, fontWeight: 600, letterSpacing: '0.32em', textTransform: 'uppercase', color, ...style }}>
        {children}
      </div>
    </Rise>
  );
}

/* ---------- ambient ---------- */
function Grain() {
  // faint warm vignette so paper never reads as flat #fff
  return (
    <div style={{
      position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1,
      background: 'radial-gradient(120% 90% at 50% 12%, rgba(109,74,214,0.05), transparent 55%), radial-gradient(140% 120% at 50% 100%, rgba(29,26,22,0.06), transparent 60%)',
    }} />
  );
}
function Progress() {
  const t = useTime();
  return (
    <div style={{ position: 'absolute', left: 0, top: 0, height: 4, width: `${(t / 30) * 100}%`, background: C.violet, opacity: 0.5, zIndex: 30 }} />
  );
}

/* ============================================================
   SCENE 1 — HOOK
   ============================================================ */
function SceneHook() {
  const { localTime, duration } = useSprite();
  const op = sceneOpacity(localTime, duration);
  const glow = 0.5 + 0.5 * Math.sin(localTime * 1.6);
  const drift = -localTime * 5;
  return (
    <div style={{ position: 'absolute', inset: 0, opacity: op, zIndex: 2 }}>
      <div style={{
        position: 'absolute', left: '50%', top: 380, width: 900, height: 900, transform: 'translate(-50%,-50%)',
        background: `radial-gradient(circle, rgba(109,74,214,${0.10 + glow * 0.05}), transparent 62%)`, filter: 'blur(8px)',
      }} />
      <div style={{ position: 'absolute', inset: 0, textAlign: 'center', transform: `translateY(${drift}px)` }}>
        <div style={{ position: 'absolute', top: 300, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
          <Eyebrow delay={0.15}>For anyone who types all day</Eyebrow>
        </div>
        <Reveal delay={0.45} style={{ position: 'absolute', top: 356, left: 0, right: 0 }}>
          <div style={{ fontFamily: SERIF, fontWeight: 800, fontSize: 184, lineHeight: 1, color: C.ink, letterSpacing: '-0.02em' }}>Stop typing.</div>
        </Reveal>
        <Reveal delay={1.05} style={{ position: 'absolute', top: 556, left: 0, right: 0 }}>
          <div style={{ fontFamily: SERIF, fontWeight: 800, fontSize: 184, lineHeight: 1, color: C.violetDeep, letterSpacing: '-0.02em' }}>Start talking.</div>
        </Reveal>
        {/* underline draw */}
        <div style={{ position: 'absolute', top: 742, left: '50%', transform: 'translateX(-50%)', width: 612, height: 12, overflow: 'hidden' }}>
          <div style={{
            height: '100%', background: C.violet, borderRadius: 6,
            transformOrigin: 'left center',
            transform: `scaleX(${Easing.easeOutCubic(clamp((localTime - 1.5) / 0.7, 0, 1))})`,
          }} />
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   SCENE 2 — PROBLEM (typing is slow)
   ============================================================ */
function SceneProblem() {
  const { localTime, duration } = useSprite();
  const op = sceneOpacity(localTime, duration);
  const raw = "so um i was just thinking that maybe we could possibly...";
  const typeT = clamp((localTime - 1.2) / 4.2, 0, 1); // painfully slow
  const shown = raw.slice(0, Math.floor(typeT * raw.length));
  const caret = Math.floor(localTime * 2) % 2 === 0;
  const gauge = clamp((localTime - 1.2) / 4.6, 0, 1) * 0.34; // crawls to ~1/3
  return (
    <div style={{ position: 'absolute', inset: 0, opacity: op, zIndex: 2 }}>
      <div style={{ position: 'absolute', top: 232, left: 0, right: 0, textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 26 }}>
          <Eyebrow delay={0.1} color={C.inkMut}>The bottleneck</Eyebrow>
        </div>
        <Reveal delay={0.3}>
          <div style={{ fontFamily: SERIF, fontWeight: 800, fontSize: 132, lineHeight: 1.02, color: C.ink, letterSpacing: '-0.02em' }}>Your hands can&rsquo;t keep up.</div>
        </Reveal>
      </div>

      {/* slow typing line */}
      <Rise delay={0.9} style={{ position: 'absolute', top: 560, left: '50%', transform: 'translateX(-50%)', width: 1180 }}>
        <div style={{
          fontFamily: SANS, fontWeight: 300, fontSize: 46, color: C.inkMut, textAlign: 'center',
          borderBottom: `2px solid ${C.paper2}`, paddingBottom: 22, minHeight: 64,
        }}>
          {shown}<span style={{ opacity: caret ? 1 : 0, color: C.violet, fontWeight: 400 }}>|</span>
        </div>
      </Rise>

      {/* wpm gauge */}
      <Rise delay={1.2} style={{ position: 'absolute', top: 712, left: '50%', transform: 'translateX(-50%)', width: 760, textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 18, marginBottom: 22 }}>
          <span style={{ fontFamily: SERIF, fontWeight: 800, fontSize: 96, color: C.violetDeep, fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>~50</span>
          <span style={{ fontFamily: SANS, fontWeight: 400, fontSize: 36, color: C.inkMut, letterSpacing: '0.01em' }}>words / minute, typing</span>
        </div>
        <div style={{ height: 10, width: '100%', background: C.paper2, borderRadius: 6, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${gauge * 100}%`, background: C.violet, borderRadius: 6 }} />
        </div>
      </Rise>
    </div>
  );
}

/* ============================================================
   SCENE 3 — GRAPHITE DEMO (hero shot)
   ============================================================ */
function Waveform({ active }) {
  const t = useTime();
  const bars = [];
  for (let i = 0; i < 22; i++) {
    const h = active ? 6 + Math.abs(Math.sin(t * 6 + i * 0.7)) * (10 + (i % 5) * 4) : 4;
    bars.push(<i key={i} style={{ width: 4, height: h, borderRadius: 3, background: active ? '#fff' : C.glassMut, transition: 'background .3s' }} />);
  }
  return <div style={{ display: 'flex', alignItems: 'center', gap: 4, height: 30 }}>{bars}</div>;
}

function SceneDemo() {
  const { localTime, duration } = useSprite();
  const op = sceneOpacity(localTime, duration, 0.55, 0.5);
  const push = 1 + 0.03 * Easing.easeOutCubic(clamp(localTime / duration, 0, 1));

  // sub-timeline (local seconds): listen -> polish -> write -> done
  const pillShown = localTime > 0.7 && localTime < 7.4;
  const showCaption = localTime > 0.85 && localTime < 4.2;

  const heard = "so basically um can you send me the report by friday and uh thanks";
  const heardT = clamp((localTime - 0.9) / 2.0, 0, 1);
  const heardTxt = heard.slice(0, Math.floor(heardT * heard.length));

  const clean = "Can you send me the report by Friday? Thanks!";
  const cleanT = clamp((localTime - 4.2) / 1.9, 0, 1);
  const cleanTxt = clean.slice(0, Math.floor(cleanT * clean.length));
  const cleanCaret = localTime > 4.2 && localTime < 6.6 && Math.floor(localTime * 2) % 2 === 0;

  let pillMode, pillLabel, led;
  if (localTime < 3.2)      { pillMode = 'listen'; pillLabel = 'Listening'; led = C.live; }
  else if (localTime < 4.2) { pillMode = 'polish'; pillLabel = 'Polishing'; led = C.amber; }
  else if (localTime < 6.3) { pillMode = 'write';  pillLabel = 'Writing';   led = C.glassAccent; }
  else                      { pillMode = 'done';   pillLabel = 'Done';      led = C.go; }

  // F9 flash
  const f9 = localTime > 0.45 && localTime < 0.85;

  return (
    <div style={{ position: 'absolute', inset: 0, opacity: op, zIndex: 2 }}>
      <div style={{ position: 'absolute', top: 96, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
        <Eyebrow delay={0.2}>The dictation overlay, live</Eyebrow>
      </div>

      {/* glass panel */}
      <div style={{
        position: 'absolute', left: 360, top: 168, width: 1200, height: 776, borderRadius: 30,
        background: C.glass, boxShadow: '0 40px 120px rgba(29,26,22,0.34), 0 8px 24px rgba(29,26,22,0.18)',
        transform: `scale(${push})`, transformOrigin: 'center 40%', overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.05)',
      }}>
        {/* window bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '20px 26px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <span style={{ width: 12, height: 12, borderRadius: 6, background: '#3a3842' }} />
          <span style={{ width: 12, height: 12, borderRadius: 6, background: '#3a3842' }} />
          <span style={{ width: 12, height: 12, borderRadius: 6, background: '#3a3842' }} />
          <span style={{ marginLeft: 14, fontFamily: MONO, fontSize: 19, color: C.glassMut }}>New message — your email, your cursor</span>
        </div>

        {/* compose context */}
        <div style={{ padding: '40px 56px' }}>
          <div style={{ fontFamily: MONO, fontSize: 21, color: C.glassMut, lineHeight: 2.1, borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: 18, marginBottom: 36 }}>
            <div><span style={{ color: '#6b6678' }}>To&nbsp;&nbsp;&nbsp;&nbsp;</span> maria@northwind.co</div>
            <div><span style={{ color: '#6b6678' }}>Subj&nbsp;</span> Friday report</div>
          </div>

          {/* compose body */}
          <div style={{ fontFamily: SANS, fontWeight: 400, fontSize: 56, lineHeight: 1.45, color: C.glassText, minHeight: 180, letterSpacing: '-0.01em' }}>
            {cleanT > 0 ? (
              <span>{cleanTxt}<span style={{ opacity: cleanCaret ? 1 : 0, color: C.glassAccent }}>|</span></span>
            ) : (
              <span style={{ color: '#5f5a6b' }}>Press <span style={{ color: C.glassAccent, fontFamily: MONO, fontSize: 40 }}>F9</span> and just talk&hellip;</span>
            )}
          </div>
        </div>

        {/* heard caption */}
        <div style={{ position: 'absolute', left: 56, right: 56, bottom: 168, textAlign: 'center', fontFamily: MONO, fontSize: 22, color: C.glassMut, opacity: showCaption ? 1 : 0, transition: 'opacity .3s' }}>
          <span style={{ color: C.live }}>heard&nbsp;&nbsp;</span>{heardTxt}
        </div>

        {/* overlay pill */}
        <div style={{
          position: 'absolute', left: '50%', bottom: 56, transform: `translateX(-50%) translateY(${pillShown ? 0 : 16}px)`,
          display: 'flex', alignItems: 'center', gap: 20, padding: '16px 28px', borderRadius: 100,
          background: C.glassPanel, border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 16px 50px rgba(0,0,0,0.45)',
          opacity: pillShown ? 1 : 0, transition: 'opacity .35s, transform .35s', whiteSpace: 'nowrap',
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 12, fontFamily: MONO, fontSize: 22, color: C.glassText }}>
            <span style={{ width: 12, height: 12, borderRadius: 6, background: led, boxShadow: `0 0 14px ${led}` }} />
            {pillLabel}
          </span>
          <Waveform active={pillMode === 'listen'} />
          <span style={{ width: 1, height: 26, background: 'rgba(255,255,255,0.1)' }} />
          <span style={{ fontFamily: MONO, fontSize: 19, color: C.glassMut }}>F9 to stop</span>
        </div>

        {/* F9 press flash */}
        <div style={{
          position: 'absolute', left: '50%', top: '52%', transform: 'translate(-50%,-50%)',
          fontFamily: MONO, fontWeight: 700, fontSize: 96, color: C.glassAccent,
          opacity: f9 ? 0.9 : 0, transition: 'opacity .12s', textShadow: `0 0 40px ${C.glassAccent}`,
        }}>F9</div>
      </div>
    </div>
  );
}

/* ============================================================
   SCENE 4 — PRIVACY
   ============================================================ */
function LockGlyph({ t }) {
  const draw = Easing.easeOutCubic(clamp(t, 0, 1));
  const glow = 0.5 + 0.5 * Math.sin((t) * 3);
  return (
    <svg width="120" height="130" viewBox="0 0 120 130" style={{ filter: `drop-shadow(0 0 ${10 + glow * 14}px rgba(109,74,214,0.5))` }}>
      <path d="M35 56 V40 a25 25 0 0 1 50 0 V56" fill="none" stroke={C.violet} strokeWidth="9" strokeLinecap="round"
        strokeDasharray="150" strokeDashoffset={150 * (1 - draw)} />
      <rect x="22" y="56" width="76" height="62" rx="14" fill={C.violet} opacity={draw} />
      <circle cx="60" cy="82" r="8" fill={C.paper} opacity={draw} />
      <rect x="56" y="86" width="8" height="18" rx="4" fill={C.paper} opacity={draw} />
    </svg>
  );
}
function ScenePrivacy() {
  const { localTime, duration } = useSprite();
  const op = sceneOpacity(localTime, duration);
  const chips = ['On-device Whisper', 'Privacy Mode', 'No account to start'];
  return (
    <div style={{ position: 'absolute', inset: 0, opacity: op, zIndex: 2, textAlign: 'center' }}>
      <div style={{ position: 'absolute', top: 214, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
        <LockGlyph t={(localTime - 0.2) / 0.8} />
      </div>
      <div style={{ position: 'absolute', top: 386, left: 0, right: 0 }}>
        <Reveal delay={0.45}>
          <div style={{ fontFamily: SERIF, fontWeight: 800, fontSize: 116, lineHeight: 1.04, color: C.ink, letterSpacing: '-0.02em' }}>Your voice never leaves</div>
        </Reveal>
        <Reveal delay={0.62}>
          <div style={{ fontFamily: SERIF, fontWeight: 800, fontSize: 116, lineHeight: 1.04, color: C.violetDeep, letterSpacing: '-0.02em' }}>your machine.</div>
        </Reveal>
      </div>
      <div style={{ position: 'absolute', top: 720, left: 0, right: 0, display: 'flex', gap: 20, justifyContent: 'center' }}>
        {chips.map((c, i) => (
          <Rise key={c} delay={1.0 + i * 0.16} dist={20}>
            <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 30, color: C.ink, padding: '16px 32px', borderRadius: 100, border: `2px solid ${C.violet}`, background: C.violetSoft }}>{c}</div>
          </Rise>
        ))}
      </div>
    </div>
  );
}

/* ============================================================
   SCENE 5 — CTA
   ============================================================ */
function Mark({ size = 64 }) {
  return (
    <div style={{ width: size, height: size, borderRadius: size * 0.28, background: C.violet, display: 'grid', placeItems: 'center', boxShadow: '0 8px 24px rgba(109,74,214,0.35)' }}>
      <div style={{ display: 'flex', gap: size * 0.07, alignItems: 'center' }}>
        <span style={{ width: size * 0.07, height: size * 0.26, background: '#fff', borderRadius: 4 }} />
        <span style={{ width: size * 0.07, height: size * 0.42, background: '#fff', borderRadius: 4 }} />
        <span style={{ width: size * 0.07, height: size * 0.30, background: '#fff', borderRadius: 4 }} />
      </div>
    </div>
  );
}
function SceneCTA() {
  const { localTime, duration } = useSprite();
  const op = sceneOpacity(localTime, duration, 0.6, 0.4);
  const pulse = 0.5 + 0.5 * Math.sin(localTime * 2.4);
  return (
    <div style={{ position: 'absolute', inset: 0, opacity: op, zIndex: 2, textAlign: 'center' }}>
      <div style={{
        position: 'absolute', left: '50%', top: 300, width: 1000, height: 540, transform: 'translateX(-50%)',
        background: 'radial-gradient(circle at 50% 40%, rgba(109,74,214,0.08), transparent 60%)',
      }} />
      <Rise delay={0.2} dist={20} style={{ position: 'absolute', top: 320, left: 0, right: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 22 }}>
        <Mark size={72} />
        <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: 56, color: C.ink, letterSpacing: '-0.01em' }}>Super Flow</span>
      </Rise>
      <Reveal delay={0.5} style={{ position: 'absolute', top: 444, left: 0, right: 0 }}>
        <div style={{ fontFamily: SERIF, fontWeight: 700, fontStyle: 'italic', fontSize: 104, color: C.violetDeep, letterSpacing: '-0.01em' }}>Stop typing. Start talking.</div>
      </Reveal>
      <Rise delay={1.0} dist={24} style={{ position: 'absolute', top: 640, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 16, fontFamily: SANS, fontWeight: 600, fontSize: 38,
          color: '#fff', background: C.violet, padding: '24px 52px', borderRadius: 16, whiteSpace: 'nowrap',
          boxShadow: `0 18px 50px rgba(109,74,214,${0.3 + pulse * 0.22})`,
        }}>Download for Windows <span>&rarr;</span></div>
      </Rise>
      <Rise delay={1.3} style={{ position: 'absolute', top: 800, left: 0, right: 0 }}>
        <div style={{ fontFamily: MONO, fontSize: 24, color: C.inkMut, letterSpacing: '0.02em' }}>Windows 10 &amp; 11 &middot; 70 MB &middot; free forever</div>
      </Rise>
    </div>
  );
}

window.SF = { C, Grain, Progress, SceneHook, SceneProblem, SceneDemo, ScenePrivacy, SceneCTA };
