import { useState, useRef, useEffect, useCallback } from "react";
import type { ReactNode, CSSProperties } from "react";
import {
  Link, NavLink, Route, Routes,
  useLocation, useNavigate, useParams, useSearchParams,
} from "react-router-dom";
import {
  AnimatePresence, motion,
  useMotionValue, useTransform, useSpring,
  useScroll, useMotionTemplate,
} from "framer-motion";
import { useStore } from "./useStore";
import { $, CATS, PAL } from "./lib";

/* ═══════════════════════════════════════════════════════
   CUSTOM CURSOR
═══════════════════════════════════════════════════════ */
function CustomCursor() {
  const cx = useMotionValue(-100);
  const cy = useMotionValue(-100);
  const sx = useSpring(cx, { stiffness: 180, damping: 18 });
  const sy = useSpring(cy, { stiffness: 180, damping: 18 });

  useEffect(() => {
    const move = (e: MouseEvent) => { cx.set(e.clientX); cy.set(e.clientY); };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, [cx, cy]);

  return (
    <>
      <motion.div id="cursor" style={{ left: cx, top: cy }} />
      <motion.div id="cursor-ring" style={{ left: sx, top: sy }} />
    </>
  );
}

/* ═══════════════════════════════════════════════════════
   PARTICLE CANVAS
═══════════════════════════════════════════════════════ */
function ParticleCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let raf: number;
    const W = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    W();
    window.addEventListener("resize", W);

    type P = { x: number; y: number; vx: number; vy: number; r: number; a: number; da: number };
    const particles: P[] = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - .5) * .3,
      vy: (Math.random() - .5) * .3,
      r: Math.random() * 1.5 + .5,
      a: Math.random(),
      da: (Math.random() - .5) * .002,
    }));

    const colors = ["#f5c842", "#9d7cf8", "#f0607a", "#22d3ee", "#34d399"];

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p, i) => {
        p.x += p.vx; p.y += p.vy; p.a += p.da;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        p.a = Math.max(.05, Math.min(.9, p.a));

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = colors[i % colors.length];
        ctx.globalAlpha = p.a * 0.4;
        ctx.fill();

        // Connect nearby particles
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[j].x - p.x;
          const dy = particles[j].y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = "#9d7cf8";
            ctx.globalAlpha = (1 - dist / 100) * 0.08;
            ctx.lineWidth = .5;
            ctx.stroke();
          }
        }
      });
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", W); };
  }, []);
  return <canvas ref={ref} id="particle-canvas" />;
}

/* ═══════════════════════════════════════════════════════
   FLOATING ORBS
═══════════════════════════════════════════════════════ */
const ORBS = [
  { x: "8%",  y: "15%", s: 500, c: "#7c3aed", d: 10 },
  { x: "72%", y: "5%",  s: 350, c: "#f5c842", d: 14 },
  { x: "88%", y: "55%", s: 280, c: "#f0607a", d: 11 },
  { x: "2%",  y: "65%", s: 220, c: "#22d3ee", d: 13 },
  { x: "50%", y: "80%", s: 300, c: "#9d7cf8", d: 9  },
];
function FloatingOrbs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {ORBS.map((o, i) => (
        <motion.div key={i} className="orb"
          animate={{ y: [0, -40, 10, 0], x: [0, 20, -10, 0] }}
          transition={{ duration: o.d, repeat: Infinity, ease: "easeInOut", delay: i * 1.4 }}
          style={{ left: o.x, top: o.y, width: o.s, height: o.s,
                   background: o.c, opacity: 0.09 }} />
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   ANIMATED COUNTER
═══════════════════════════════════════════════════════ */
function Counter({ value }: { value: number }) {
  return (
    <AnimatePresence mode="popLayout">
      <motion.span key={value}
        initial={{ y: -18, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 18, opacity: 0 }}
        transition={{ type: "spring", stiffness: 350, damping: 28 }}
        className="inline-block tabular-nums">
        {value}
      </motion.span>
    </AnimatePresence>
  );
}

/* ═══════════════════════════════════════════════════════
   STAR RATING
═══════════════════════════════════════════════════════ */
function Stars({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" }) {
  const sz = size === "md" ? "w-4 h-4" : "w-3 h-3";
  return (
    <span className="flex items-center gap-1" aria-label={`${rating.toFixed(1)} stars`}>
      {[1,2,3,4,5].map(i => (
        <svg key={i} viewBox="0 0 12 12" className={sz}>
          <defs>
            <linearGradient id={`star-${i}-${rating}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f5c842" />
              <stop offset="100%" stopColor="#e8980a" />
            </linearGradient>
          </defs>
          <polygon points="6,1 7.8,4.4 11.5,5 8.8,7.6 9.5,11.3 6,9.4 2.5,11.3 3.2,7.6 0.5,5 4.2,4.4"
            fill={i <= Math.round(rating) ? `url(#star-${i}-${rating})` : "rgba(255,255,255,0.12)"} />
        </svg>
      ))}
      <span className="text-[var(--color-muted)] ml-1 font-mono text-xs">{rating.toFixed(1)}</span>
    </span>
  );
}

/* ═══════════════════════════════════════════════════════
   CATEGORY BADGE
═══════════════════════════════════════════════════════ */
const CAT_COLORS: Record<string, string> = {
  Fiction:    "rgba(157,124,248,.18) border-[rgba(157,124,248,.4)] text-[#c4b1ff]",
  "Sci-Fi":   "rgba(34,211,238,.18) border-[rgba(34,211,238,.4)] text-[#a3f3ff]",
  Tech:       "rgba(52,211,153,.18) border-[rgba(52,211,153,.4)] text-[#6ffdd4]",
  History:    "rgba(245,200,66,.18) border-[rgba(245,200,66,.4)] text-[#fce583]",
  "Self-Help":"rgba(240,96,122,.18) border-[rgba(240,96,122,.4)] text-[#ffaac8]",
};
function CatBadge({ cat }: { cat: string }) {
  return (
    <span className={`tag border ${CAT_COLORS[cat] ?? "bg-white/10 border-white/20 text-white/60"}`}>
      {cat}
    </span>
  );
}

/* ═══════════════════════════════════════════════════════
   TOAST
═══════════════════════════════════════════════════════ */
function Toast() {
  const { toast } = useStore();
  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          key={toast}
          initial={{ y: 80, opacity: 0, scale: .9 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 80, opacity: 0, scale: .9 }}
          transition={{ type: "spring", stiffness: 350, damping: 28 }}
          className="fixed bottom-6 right-6 z-[200] glass-dark px-5 py-3.5 rounded-2xl
                     flex items-center gap-3 text-sm font-medium shadow-2xl max-w-xs"
          style={{ border: "1px solid rgba(245,200,66,.25)", color: "var(--color-bright)" }}>
          <span className="w-2 h-2 rounded-full bg-[var(--color-emerald)] animate-pulse shrink-0" />
          {toast}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ═══════════════════════════════════════════════════════
   BOOK COVER — 3-D tilt + gloss + spine
═══════════════════════════════════════════════════════ */
function Cover({ b, size = "normal" }: { b: any; size?: "normal" | "large" }) {
  const [bg, fg] = PAL[b.id % PAL.length];
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 200, damping: 24 });
  const sy = useSpring(my, { stiffness: 200, damping: 24 });
  const rx = useTransform(sy, [-0.5, 0.5], [18, -18]);
  const ry = useTransform(sx, [-0.5, 0.5], [-22, 22]);
  const gx = useTransform(sx, [-0.5, 0.5], ["20%", "80%"]);
  const gy = useTransform(sy, [-0.5, 0.5], ["20%", "80%"]);
  const gloss = useMotionTemplate`radial-gradient(circle at ${gx} ${gy}, rgba(255,255,255,0.22) 0%, transparent 55%)`;
  const shadow = useMotionTemplate`${useTransform(sx, [-0.5, 0.5], [-12, 12])}px 24px 60px rgba(0,0,0,0.75)`;

  const cls = size === "large" ? "aspect-[3/4] min-h-[320px]" : "aspect-[3/4]";

  return (
    <motion.div
      onMouseMove={e => {
        const r = e.currentTarget.getBoundingClientRect();
        mx.set((e.clientX - r.left) / r.width - .5);
        my.set((e.clientY - r.top) / r.height - .5);
      }}
      onMouseLeave={() => { mx.set(0); my.set(0); }}
      style={{ rotateX: rx, rotateY: ry, transformPerspective: 1000,
               background: bg, color: fg, boxShadow: shadow }}
      className={`relative ${cls} rounded-r-2xl rounded-l-[3px] flex flex-col
                  justify-between overflow-hidden select-none cursor-none`}>
      {/* Spine shadow */}
      <span className="absolute left-0 inset-y-0 w-5" style={{ background: "rgba(0,0,0,0.3)" }} />
      {/* Spine highlight */}
      <span className="absolute left-5 inset-y-0 w-[1px]" style={{ background: "rgba(255,255,255,0.08)" }} />
      {/* Gloss */}
      <motion.span className="absolute inset-0" style={{ background: gloss }} />
      {/* Top-right circle */}
      <span className="absolute -top-8 -right-8 w-24 h-24 rounded-full opacity-15"
            style={{ background: fg }} />
      <span className="absolute -bottom-6 -left-6 w-16 h-16 rounded-full opacity-10"
            style={{ background: fg }} />
      {/* Content */}
      <div className="relative z-10 p-5 pl-8 flex flex-col h-full justify-between">
        <div>
          {b.category && (
            <span className="text-[9px] uppercase tracking-[.2em] opacity-50 font-mono block mb-1">
              {b.category}
            </span>
          )}
          <h3 className="font-display font-bold leading-tight"
              style={{ fontSize: size === "large" ? "1.6rem" : "1.1rem" }}>
            {b.title}
          </h3>
        </div>
        <div>
          <div className="w-8 h-[1px] mb-3 opacity-30" style={{ background: fg }} />
          <p className="text-sm opacity-65 font-medium">{b.author ?? b.authorName}</p>
        </div>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════
   BOOK CARD
═══════════════════════════════════════════════════════ */
function BookCard({ b, index = 0 }: { b: any; index?: number }) {
  const { add } = useStore();
  const [hovered, setHovered] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 36 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.055, type: "spring", stiffness: 110, damping: 20 }}
      onHoverStart={() => setHovered(true)} onHoverEnd={() => setHovered(false)}
      className="group flex flex-col gap-4">
      {/* Cover wrapper with shadow bloom */}
      <div className="relative">
        <Link to={"/book/" + b.id}>
          <motion.div
            animate={{ y: hovered ? -10 : 0, scale: hovered ? 1.02 : 1 }}
            transition={{ type: "spring", stiffness: 220, damping: 22 }}>
            <Cover b={b} />
            {/* Glow bloom on hover */}
            <motion.div
              animate={{ opacity: hovered ? 1 : 0 }}
              className="absolute -bottom-4 inset-x-4 h-8 blur-xl rounded-full pointer-events-none"
              style={{ background: PAL[b.id % PAL.length][0] }} />
          </motion.div>
        </Link>
        {/* Quick-add overlay */}
        <motion.div
          animate={{ opacity: hovered ? 1 : 0, y: hovered ? 0 : 8 }}
          transition={{ type: "spring", stiffness: 300, damping: 26 }}
          className="absolute bottom-3 inset-x-3 pointer-events-none">
          <motion.button
            onClick={e => { e.preventDefault(); add(b.id); }}
            whileTap={{ scale: 0.95 }}
            className="btn btn-primary w-full text-sm pointer-events-auto shadow-lg"
            aria-label={"Add " + b.title + " to cart"}>
            + Add to cart
          </motion.button>
        </motion.div>
      </div>
      {/* Meta */}
      <div className="px-1 space-y-2">
        <Stars rating={b.rating} />
        <div className="flex items-end justify-between gap-2">
          <div className="min-w-0">
            <p className="font-semibold text-[var(--color-bright)] text-sm leading-tight truncate">
              {b.title}
            </p>
            <p className="text-xs text-[var(--color-muted)] truncate mt-0.5">
              {b.author ?? b.authorName}
            </p>
          </div>
          <span className="font-display font-bold text-[var(--color-gold)] text-lg shrink-0">
            {$(b.price)}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════
   MARQUEE STRIP
═══════════════════════════════════════════════════════ */
function MarqueeStrip() {
  const items = ["Fiction", "Sci-Fi", "History", "Technology", "Self-Help",
                 "Philosophy", "Romance", "Mystery", "Biography", "Poetry"];
  const doubled = [...items, ...items];
  return (
    <div className="overflow-hidden py-4 border-y border-[var(--color-border)] relative z-10">
      <div className="marquee-track flex gap-8 w-max">
        {doubled.map((s, i) => (
          <span key={i} className="shrink-0 flex items-center gap-3 text-[var(--color-muted)] text-sm font-medium tracking-widest uppercase">
            <span className="w-1 h-1 rounded-full bg-[var(--color-gold)]" />
            {s}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   NAV
═══════════════════════════════════════════════════════ */
function NavPill({ to, children }: { to: string; children: ReactNode }) {
  return (
    <NavLink to={to} className={({ isActive }) =>
      "relative px-4 py-2 rounded-full text-sm font-medium transition-colors " +
      (isActive ? "text-[var(--color-bright)]" : "text-[var(--color-muted)] hover:text-[var(--color-text)]")
    }>
      {({ isActive }) => (
        <>
          {isActive && (
            <motion.span layoutId="nav-pill"
              className="absolute inset-0 rounded-full"
              style={{ background: "rgba(157,124,248,.12)", border: "1px solid rgba(157,124,248,.2)" }}
              transition={{ type: "spring", stiffness: 380, damping: 32 }} />
          )}
          <span className="relative z-10">{children}</span>
        </>
      )}
    </NavLink>
  );
}

function Nav() {
  const { count, setOpen, user, logout } = useStore();
  const { scrollY } = useScroll();
  const bg  = useTransform(scrollY, [0, 80], ["rgba(7,7,14,0)", "rgba(7,7,14,0.92)"]);
  const blur = useTransform(scrollY, [0, 80], ["blur(0px)", "blur(24px)"]);
  const bord = useTransform(scrollY, [0, 80], ["rgba(255,255,255,0)", "rgba(255,255,255,0.07)"]);
  const shadow = useTransform(scrollY, [0, 80], ["none", "0 8px 32px rgba(0,0,0,0.4)"]);

  return (
    <motion.header
      style={{ backgroundColor: bg, backdropFilter: blur, borderBottomColor: bord, boxShadow: shadow }}
      className="fixed top-0 inset-x-0 z-40 border-b">
      <div className="max-w-7xl mx-auto px-5 h-16 flex items-center gap-2">
        {/* Logo */}
        <Link to="/" className="mr-auto flex items-center gap-2.5 group">
          <motion.div
            whileHover={{ rotate: [0, -10, 12, 0], scale: 1.1 }}
            transition={{ duration: .4 }}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-lg"
            style={{ background: "linear-gradient(135deg, #f5c842, #9d7cf8)", boxShadow: "0 4px 16px rgba(157,124,248,.4)" }}>
            📖
          </motion.div>
          <span className="font-display font-bold text-xl tracking-tight">
            Page<span className="gradient-text">wise</span>
          </span>
        </Link>

        {/* Nav links */}
        <nav className="hidden sm:flex items-center gap-1">
          <NavPill to="/shop">Shop</NavPill>
          {user && <NavPill to="/orders">Orders</NavPill>}
          {user?.role === "Admin" && <NavPill to="/admin">Admin</NavPill>}
        </nav>

        <div className="flex items-center gap-2 ml-3">
          {user ? (
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={logout} className="btn btn-ghost text-sm px-4 py-2">
              Log out
            </motion.button>
          ) : (
            <Link to="/login">
              <motion.span whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                className="btn btn-ghost text-sm px-4 py-2 cursor-pointer">
                Log in
              </motion.span>
            </Link>
          )}

          {/* Cart button */}
          <motion.button
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => setOpen(true)}
            className="relative flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-sm"
            style={{ background: "linear-gradient(135deg,#f5c842,#e8980a)",
                     color: "#07070e", boxShadow: "0 4px 20px rgba(245,200,66,.35)" }}
            aria-label={`Cart, ${count} items`}>
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 01-8 0"/>
            </svg>
            <span className="hidden sm:inline">Cart</span>
            {count > 0 && (
              <motion.span
                key={count}
                initial={{ scale: 1.8, rotate: 15 }} animate={{ scale: 1, rotate: 0 }}
                className="bg-[var(--color-void)] text-[var(--color-gold)] rounded-full text-xs
                           w-5 h-5 grid place-items-center font-mono font-bold">
                <Counter value={count} />
              </motion.span>
            )}
          </motion.button>
        </div>
      </div>
    </motion.header>
  );
}

/* ═══════════════════════════════════════════════════════
   TYPEWRITER
═══════════════════════════════════════════════════════ */
function Typewriter({ words }: { words: string[] }) {
  const [wi, setWi] = useState(0);
  const [ci, setCi] = useState(0);
  const [del, setDel] = useState(false);

  useEffect(() => {
    const word = words[wi];
    const timer = setTimeout(() => {
      if (!del) {
        if (ci < word.length) {
          setCi(c => c + 1);
        } else {
          setTimeout(() => setDel(true), 1800);
        }
      } else {
        if (ci > 0) {
          setCi(c => c - 1);
        } else {
          setDel(false);
          setWi(w => (w + 1) % words.length);
        }
      }
    }, del ? 55 : 90);
    return () => clearTimeout(timer);
  }, [ci, del, wi, words]);

  return (
    <span className="gradient-text relative">
      {words[wi].slice(0, ci)}
      <motion.span
        animate={{ opacity: [1, 0, 1] }}
        transition={{ duration: .8, repeat: Infinity }}
        className="inline-block w-[3px] h-[.9em] bg-[var(--color-gold)] ml-1 rounded-sm align-middle" />
    </span>
  );
}

/* ═══════════════════════════════════════════════════════
   HOME
═══════════════════════════════════════════════════════ */
function Home() {
  const { books } = useStore();
  const nav = useNavigate();
  const [q, setQ] = useState("");
  const top = [...books].sort((a: any, b: any) => b.rating - a.rating).slice(0, 4);
  const shelf = books.slice(0, 12);
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "35%"]);
  const heroO = useTransform(scrollYProgress, [0, .7], [1, 0]);

  const stats = [
    { v: "14K+", l: "Titles in stock", c: "var(--color-gold)" },
    { v: "4.9★", l: "Average rating",  c: "var(--color-violet)" },
    { v: "24h",  l: "Fast delivery",   c: "var(--color-cyan)" },
    { v: "98%",  l: "Happy readers",   c: "var(--color-emerald)" },
  ];

  return (
    <div className="aurora-bg min-h-screen relative">
      <FloatingOrbs />
      <ParticleCanvas />

      {/* ── HERO ─────────────────────────── */}
      <motion.section ref={heroRef}
        style={{ y: heroY, opacity: heroO }}
        className="relative z-10 max-w-7xl mx-auto px-5 pt-36 pb-28">

        <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: .9, ease: [.4, 0, .2, 1] }}>

          {/* Eyebrow badge */}
          <motion.div initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: .25 }}
            className="inline-flex items-center gap-2 glass px-5 py-2.5 rounded-full text-sm mb-8">
            <motion.span animate={{ scale: [1, 1.4, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
              className="w-2 h-2 rounded-full bg-[var(--color-emerald)]" />
            <span className="text-[var(--color-muted)]">New arrivals every week</span>
          </motion.div>

          {/* Headline */}
          <h1 className="font-display font-black text-[clamp(3rem,9vw,7rem)] leading-[.92] max-w-5xl mb-4">
            Your next<br />
            <Typewriter words={["great read", "adventure", "obsession", "inspiration"]} />
            <br />is here.
          </h1>
          <p className="text-[var(--color-muted)] text-xl max-w-xl mb-10 leading-relaxed mt-4"
             style={{ opacity: 0.8 }}>
            Discover, collect & order from thousands of beautifully curated titles.
          </p>

          {/* Search bar */}
          <form onSubmit={e => { e.preventDefault(); nav("/shop?q=" + encodeURIComponent(q)); }}
            className="flex gap-3 max-w-xl">
            <div className="relative flex-1">
              <svg viewBox="0 0 24 24"
                className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-muted)]"
                fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
              </svg>
              <input className="field pl-11 py-4 text-base"
                placeholder="Search by title or author…" value={q}
                onChange={e => setQ(e.target.value)} aria-label="Search books" />
            </div>
            <motion.button whileTap={{ scale: 0.96 }} className="btn btn-primary px-7 py-4 text-base">
              Search
            </motion.button>
          </form>

          {/* CTA row */}
          <div className="flex flex-wrap items-center gap-4 mt-6">
            <Link to="/shop">
              <motion.span whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                className="btn btn-ghost text-sm cursor-pointer">
                Browse all books →
              </motion.span>
            </Link>
            <div className="flex items-center gap-2 text-xs text-[var(--color-muted)]">
              <span>✓ Free returns</span>
              <span className="w-1 h-1 rounded-full bg-[var(--color-border)]" />
              <span>✓ Secure checkout</span>
            </div>
          </div>
        </motion.div>
      </motion.section>

      {/* ── MARQUEE ───────────────────────── */}
      <div className="relative z-10">
        <MarqueeStrip />
      </div>

      {/* ── BOOKSHELF ─────────────────────── */}
      <section className="relative z-10 max-w-7xl mx-auto px-5 py-20">
        <motion.div className="flex items-end justify-between mb-6"
          initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: .6 }}>
          <div>
            <p className="text-[var(--color-muted)] text-xs uppercase tracking-widest font-mono mb-2">
              Our shelf
            </p>
            <h2 className="font-display font-bold text-4xl">
              Browse <span className="gradient-text">the collection</span>
            </h2>
          </div>
          <Link to="/shop" className="btn btn-ghost text-sm hidden sm:inline-flex">
            View all →
          </Link>
        </motion.div>

        {/* Shelf */}
        <div className="relative">
          {/* Shelf board */}
          <div className="absolute bottom-0 inset-x-0 h-5 rounded"
               style={{ background: "rgba(255,255,255,.04)", boxShadow: "0 -3px 0 rgba(255,255,255,.025)" }} />
          {/* Shelf shadow */}
          <div className="absolute bottom-0 inset-x-0 h-12 opacity-50 blur-sm"
               style={{ background: "linear-gradient(to top, rgba(0,0,0,.5), transparent)" }} />

          <div className="flex items-end gap-2 overflow-x-auto pb-5 min-h-[280px]"
               style={{ scrollbarWidth: "none" }}>
            {shelf.map((b: any, i: number) => {
              const [bg, fg] = PAL[b.id % PAL.length];
              const h = 165 + ((b.id * 37) % 90);
              const w = 46 + ((b.id * 13) % 20);
              return (
                <motion.button key={b.id} aria-label={b.title}
                  onClick={() => nav("/book/" + b.id)}
                  initial={{ y: 220, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.05 + i * 0.065, type: "spring", stiffness: 90, damping: 15 }}
                  style={{ background: bg, color: fg, height: h, width: w,
                           boxShadow: "4px 0 16px rgba(0,0,0,.55)" }}
                  className="spine-btn shrink-0 rounded-t-sm font-display text-[10px] py-3
                             [writing-mode:vertical-rl] text-left cursor-pointer whitespace-nowrap
                             overflow-hidden relative">
                  <span className="absolute left-0 inset-y-0 w-2.5" style={{ background: "rgba(0,0,0,0.28)" }} />
                  <span className="absolute left-2.5 inset-y-0 w-[1px]"
                        style={{ background: "rgba(255,255,255,0.08)" }} />
                  <span className="pl-4">{b.title}</span>
                </motion.button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── STATS STRIP ───────────────────── */}
      <section className="relative z-10 max-w-7xl mx-auto px-5 pb-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map(({ v, l, c }, i) => (
            <motion.div key={l}
              initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * .1, duration: .6 }}
              className="glass p-6 text-center rounded-2xl relative overflow-hidden group">
              {/* Hover shimmer */}
              <motion.div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ background: `radial-gradient(circle at 50% 50%, ${c}15, transparent 70%)` }} />
              <p className="font-display font-black text-4xl mb-1 relative" style={{ color: c }}>{v}</p>
              <p className="text-xs text-[var(--color-muted)] relative">{l}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── TOP RATED ─────────────────────── */}
      <section className="relative z-10 max-w-7xl mx-auto px-5 py-16">
        <motion.div className="flex items-center justify-between mb-10"
          initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}>
          <div>
            <p className="text-[var(--color-muted)] text-xs uppercase tracking-widest font-mono mb-2">
              Editor's picks
            </p>
            <h2 className="font-display font-bold text-4xl">Top <span className="gradient-text">Rated</span></h2>
          </div>
          <Link to="/shop" className="btn btn-ghost text-sm hidden sm:inline-flex">View all →</Link>
        </motion.div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {top.map((b: any, i) => <BookCard key={b.id} b={b} index={i} />)}
        </div>
      </section>

      {/* ── FOOTER CTA ────────────────────── */}
      <section className="relative z-10 max-w-7xl mx-auto px-5 py-24 text-center">
        <motion.div
          initial={{ opacity: 0, scale: .95 }} whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }} transition={{ duration: .7 }}
          className="glass-dark rounded-3xl p-16 relative overflow-hidden">
          <div className="absolute inset-0 opacity-20"
               style={{ background: "radial-gradient(ellipse at 50% 0%, #9d7cf8, transparent 60%)" }} />
          <div className="relative z-10">
            <p className="text-[var(--color-muted)] text-xs uppercase tracking-[.3em] font-mono mb-6">
              Start your journey
            </p>
            <h2 className="font-display font-black text-5xl md:text-6xl mb-6">
              Ready to find your<br />
              <span className="gradient-text">next obsession?</span>
            </h2>
            <p className="text-[var(--color-muted)] text-lg mb-10 max-w-md mx-auto">
              Join thousands of readers discovering new worlds every day.
            </p>
            <Link to="/shop">
              <motion.span whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                className="btn btn-primary text-base px-10 py-4 cursor-pointer glow-gold">
                Explore the Collection →
              </motion.span>
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   SHOP
═══════════════════════════════════════════════════════ */
function Shop() {
  const { books } = useStore();
  const [sp, setSp] = useSearchParams();
  const q = sp.get("q") || "";
  const [cat, setCat] = useState("All");
  const [sort, setSort] = useState("top");
  const [view, setView] = useState<"grid" | "list">("grid");

  const list = books
    .filter((b: any) =>
      (cat === "All" || b.category === cat) &&
      (b.title + " " + (b.author ?? b.authorName)).toLowerCase().includes(q.toLowerCase()))
    .sort((a: any, b: any) =>
      sort === "low" ? a.price - b.price : sort === "high" ? b.price - a.price : b.rating - a.rating);

  return (
    <div className="min-h-screen pt-24 pb-24 max-w-7xl mx-auto px-5">
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>

        {/* Page header */}
        <div className="mb-10">
          <p className="text-[var(--color-muted)] text-xs uppercase tracking-[.25em] font-mono mb-3">
            {list.length} titles
          </p>
          <h1 className="font-display font-black text-5xl md:text-6xl">
            The <span className="gradient-text">Collection</span>
          </h1>
        </div>

        {/* Filters row */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <svg viewBox="0 0 24 24"
              className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-muted)]"
              fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
            </svg>
            <input className="field pl-10"
              placeholder="Search…" value={q}
              onChange={e => setSp(e.target.value ? { q: e.target.value } : {})} />
          </div>
          <select className="field max-w-[180px]" value={sort}
            onChange={e => setSort(e.target.value)} aria-label="Sort">
            <option value="top">⭐ Top rated</option>
            <option value="low">↑ Price: Low</option>
            <option value="high">↓ Price: High</option>
          </select>
          {/* View toggle */}
          <div className="flex glass rounded-xl overflow-hidden">
            {(["grid", "list"] as const).map(v => (
              <button key={v} onClick={() => setView(v)}
                className="px-3 py-2 text-sm transition-all relative">
                {v === cat && (
                  <motion.span layoutId="view-bg" className="absolute inset-0"
                    style={{ background: "rgba(157,124,248,.2)" }}
                    transition={{ type: "spring", stiffness: 350, damping: 30 }} />
                )}
                <span className={`relative z-10 ${view === v ? "text-[var(--color-violet)]" : "text-[var(--color-muted)]"}`}>
                  {v === "grid" ? (
                    <svg viewBox="0 0 16 16" className="w-4 h-4" fill="currentColor">
                      <rect x="1" y="1" width="6" height="6" rx="1"/><rect x="9" y="1" width="6" height="6" rx="1"/>
                      <rect x="1" y="9" width="6" height="6" rx="1"/><rect x="9" y="9" width="6" height="6" rx="1"/>
                    </svg>
                  ) : (
                    <svg viewBox="0 0 16 16" className="w-4 h-4" fill="currentColor">
                      <rect x="1" y="2" width="14" height="2" rx="1"/>
                      <rect x="1" y="7" width="14" height="2" rx="1"/>
                      <rect x="1" y="12" width="14" height="2" rx="1"/>
                    </svg>
                  )}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Category chips */}
        <div className="flex flex-wrap gap-2 mb-10">
          {["All", ...CATS].map(c => (
            <button key={c} onClick={() => setCat(c)}
              className="relative px-5 py-2 rounded-full text-sm font-medium border transition-colors"
              style={{
                borderColor: cat === c ? "var(--color-violet)" : "var(--color-border)",
                color: cat === c ? "var(--color-bright)" : "var(--color-muted)",
              }}>
              {cat === c && (
                <motion.span layoutId="cat-pill" className="absolute inset-0 rounded-full"
                  style={{ background: "rgba(157,124,248,.13)" }}
                  transition={{ type: "spring", stiffness: 380, damping: 32 }} />
              )}
              <span className="relative z-10">{c}</span>
            </button>
          ))}
        </div>

        {/* Grid */}
        {view === "grid" ? (
          <motion.div layout className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
            <AnimatePresence mode="popLayout">
              {list.map((b: any, i: number) => (
                <motion.div layout key={b.id}
                  initial={{ opacity: 0, scale: .88 }} animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: .88 }}
                  transition={{ type: "spring", stiffness: 200, damping: 22 }}>
                  <BookCard b={b} index={i} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {list.map((b: any, i: number) => (
                <motion.div key={b.id} layout
                  initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 24 }}
                  transition={{ delay: i * .03 }}
                  className="glass flex gap-5 p-4 rounded-2xl items-center group hover:border-[var(--color-violet)]
                             transition-colors cursor-pointer"
                  onClick={() => {}}>
                  <div className="w-12 h-16 shrink-0 rounded-lg overflow-hidden"
                       style={{ background: PAL[b.id % PAL.length][0] }}>
                    <div className="w-1 h-full" style={{ background: "rgba(0,0,0,.3)" }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link to={"/book/" + b.id}
                      className="font-semibold text-[var(--color-bright)] hover:text-[var(--color-gold)] transition-colors truncate block">
                      {b.title}
                    </Link>
                    <p className="text-sm text-[var(--color-muted)] truncate">
                      {b.author ?? b.authorName}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      <Stars rating={b.rating} />
                      <CatBadge cat={b.category} />
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-display font-bold text-xl text-[var(--color-gold)]">{$(b.price)}</p>
                    <p className="text-xs text-[var(--color-muted)] mt-0.5">{b.stock} left</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {list.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-center py-32">
            <p className="text-7xl mb-6">🔍</p>
            <p className="text-[var(--color-muted)] text-xl mb-8">No books match your search.</p>
            <button className="btn btn-ghost"
              onClick={() => { setCat("All"); setSp({}); }}>
              Clear filters
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   BOOK DETAILS
═══════════════════════════════════════════════════════ */
function Details() {
  const { id } = useParams();
  const { books, add } = useStore();
  const [n, setN] = useState(1);
  const [added, setAdded] = useState(false);
  const b = books.find((x: any) => x.id === Number(id));
  const [bg, fg] = b ? PAL[b.id % PAL.length] : ["#1e1e2e", "#fff"];
  const related = books.filter((x: any) => x.id !== b?.id && x.category === b?.category).slice(0, 4);

  if (!b) return (
    <div className="min-h-screen pt-32 max-w-xl mx-auto px-5 text-center">
      <p className="text-7xl mb-6">📭</p>
      <p className="text-[var(--color-muted)] text-xl mb-6">We couldn't find that book.</p>
      <Link className="btn btn-primary" to="/shop">Back to shop</Link>
    </div>
  );

  const handleAdd = () => {
    add(b.id, n); setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="min-h-screen pt-24 relative overflow-hidden">
      {/* Book-color BG gradient */}
      <div className="absolute inset-0 opacity-[0.07] pointer-events-none"
           style={{ background: `radial-gradient(ellipse at 25% 40%, ${bg}, transparent 65%)` }} />
      <div className="absolute top-0 inset-x-0 h-96 opacity-[0.04] pointer-events-none"
           style={{ background: `linear-gradient(to bottom, ${bg}, transparent)` }} />

      <div className="relative z-10 max-w-6xl mx-auto px-5 py-12">
        {/* Breadcrumb */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 text-sm text-[var(--color-muted)] mb-10">
          <Link to="/shop" className="hover:text-[var(--color-text)] transition-colors">Shop</Link>
          <span>/</span>
          <span className="text-[var(--color-text)]">{b.title}</span>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-16 items-start">
          {/* Cover */}
          <motion.div initial={{ opacity: 0, x: -48 }} animate={{ opacity: 1, x: 0 }}
            transition={{ type: "spring", stiffness: 90, damping: 18 }}
            className="max-w-sm mx-auto w-full sticky top-24">
            <Cover b={b} size="large" />
            {/* Book glow */}
            <div className="h-12 mx-8 blur-2xl rounded-full mt-2 opacity-40"
                 style={{ background: bg }} />
          </motion.div>

          {/* Info */}
          <motion.div initial={{ opacity: 0, x: 48 }} animate={{ opacity: 1, x: 0 }}
            transition={{ type: "spring", stiffness: 90, damping: 18, delay: .1 }}
            className="space-y-6">
            <div className="flex items-center gap-3">
              <CatBadge cat={b.category} />
              {b.stock > 0 ? (
                <span className="flex items-center gap-1.5 text-xs text-[var(--color-emerald)]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-emerald)] animate-pulse" />
                  {b.stock} in stock
                </span>
              ) : (
                <span className="text-xs text-[var(--color-rose)]">Out of stock</span>
              )}
            </div>

            <h1 className="font-display font-black text-4xl md:text-5xl leading-tight">{b.title}</h1>
            <p className="text-[var(--color-muted)] text-lg">
              by <span className="text-[var(--color-text)] font-medium">{b.author ?? b.authorName}</span>
            </p>
            <Stars rating={b.rating} size="md" />
            <p className="text-[var(--color-muted)] leading-relaxed text-base">{b.description}</p>

            {/* Price row */}
            <div className="flex items-baseline gap-4 py-5 border-t border-b border-[var(--color-border)]">
              <span className="font-display font-black text-5xl text-[var(--color-gold)] text-glow">
                {$(b.price)}
              </span>
              <span className="text-sm text-[var(--color-muted)]">per copy</span>
            </div>

            {/* Quantity + Add */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-0 glass rounded-full overflow-hidden border border-[var(--color-border)]">
                <button onClick={() => setN(Math.max(1, n - 1))} aria-label="Decrease"
                  className="w-12 h-12 flex items-center justify-center hover:bg-white/10
                             transition-colors text-xl font-light">−</button>
                <span className="w-10 text-center font-mono font-semibold text-lg">{n}</span>
                <button onClick={() => setN(Math.min(b.stock, n + 1))} aria-label="Increase"
                  className="w-12 h-12 flex items-center justify-center hover:bg-white/10
                             transition-colors text-xl font-light">+</button>
              </div>
              <motion.button whileTap={{ scale: 0.96 }} disabled={b.stock < 1}
                onClick={handleAdd}
                className="btn btn-primary flex-1 disabled:opacity-40 py-3.5 text-base"
                animate={added ? { scale: [1, 1.04, 1] } : {}}>
                {added ? "✓ Added!" : "Add to cart"}
              </motion.button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              {[
                { icon: "🚚", label: "Free delivery" },
                { icon: "↩️", label: "30-day returns" },
                { icon: "🔒", label: "Secure payment" },
              ].map(({ icon, label }) => (
                <div key={label} className="glass rounded-xl p-3 text-center">
                  <span className="text-xl block mb-1">{icon}</span>
                  <p className="text-xs text-[var(--color-muted)]">{label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div className="mt-24">
            <h2 className="font-display font-bold text-3xl mb-8">
              You may also <span className="gradient-text">like</span>
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {related.map((rb: any, i) => <BookCard key={rb.id} b={rb} index={i} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   CART DRAWER
═══════════════════════════════════════════════════════ */
function Drawer() {
  const { open, setOpen, lines, total, setQty, placeOrder, user } = useStore();
  const nav = useNavigate();
  const [done, setDone] = useState(false);
  const close = () => { setOpen(false); setTimeout(() => setDone(false), 400); };
  const checkout = () => { if (!user) { close(); nav("/login"); return; } placeOrder(); setDone(true); };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div key="bd" className="fixed inset-0 z-50"
            style={{ background: "rgba(7,7,14,0.8)", backdropFilter: "blur(6px)" }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={close} />

          {/* Panel */}
          <motion.aside key="panel" role="dialog" aria-label="Cart"
            className="fixed right-0 top-0 h-full w-full max-w-[440px] z-50 flex flex-col"
            style={{ background: "var(--color-deep)", borderLeft: "1px solid var(--color-border)" }}
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}>

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--color-border)]">
              <div>
                <h2 className="font-display font-bold text-2xl">Your Cart</h2>
                <p className="text-xs text-[var(--color-muted)] mt-0.5">
                  {lines.length} {lines.length === 1 ? "item" : "items"}
                </p>
              </div>
              <motion.button whileHover={{ rotate: 90, scale: 1.1 }} whileTap={{ scale: .9 }}
                onClick={close}
                className="w-9 h-9 rounded-full glass flex items-center justify-center text-xl
                           text-[var(--color-muted)] hover:text-[var(--color-bright)] transition-colors">
                ×
              </motion.button>
            </div>

            {done ? (
              /* Success */
              <div className="flex-1 grid place-content-center text-center gap-6 p-8">
                <motion.div initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 180, delay: .1 }}>
                  <svg viewBox="0 0 80 80" className="w-28 h-28 mx-auto">
                    <circle cx="40" cy="40" r="38"
                      fill="rgba(52,211,153,0.12)" stroke="#34d399" strokeWidth="1.5" />
                    <motion.path d="M24 40l12 12 20-24"
                      fill="none" stroke="#34d399" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
                      initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                      transition={{ delay: .3, duration: .5 }} />
                  </svg>
                </motion.div>
                <div>
                  <h3 className="font-display font-bold text-2xl mb-2">Order Placed! 🎉</h3>
                  <p className="text-[var(--color-muted)]">Track it on your orders page.</p>
                </div>
                <motion.button whileTap={{ scale: .96 }} className="btn btn-primary"
                  onClick={() => { close(); nav("/orders"); }}>
                  View Orders
                </motion.button>
              </div>
            ) : lines.length === 0 ? (
              /* Empty */
              <div className="flex-1 grid place-content-center text-center gap-5 p-8">
                <motion.div
                  animate={{ rotate: [0,-12,12,-6,0], y: [0, -8, 0] }}
                  transition={{ repeat: Infinity, repeatDelay: 2.5, duration: .8 }}>
                  <span className="text-8xl block">🛒</span>
                </motion.div>
                <div>
                  <p className="text-[var(--color-bright)] font-semibold text-lg mb-2">
                    Your cart is empty
                  </p>
                  <p className="text-[var(--color-muted)] text-sm">
                    Add some books to get started
                  </p>
                </div>
                <motion.button whileTap={{ scale: .96 }} className="btn btn-primary"
                  onClick={() => { close(); nav("/shop"); }}>
                  Browse Books
                </motion.button>
              </div>
            ) : (
              <>
                {/* Items */}
                <ul className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
                  <AnimatePresence initial={false}>
                    {lines.map((l: any) => {
                      const [cbg] = PAL[l.book.id % PAL.length];
                      return (
                        <motion.li key={l.book.id} layout
                          initial={{ opacity: 0, x: 36 }} animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 60, height: 0, marginBottom: 0 }}
                          className="glass flex gap-4 p-3.5 rounded-2xl items-center">
                          {/* Mini cover */}
                          <Link to={"/book/" + l.book.id} onClick={close}
                            className="w-11 shrink-0 relative overflow-hidden rounded-lg"
                            style={{ background: cbg, minHeight: 60 }}>
                            <span className="absolute left-0 inset-y-0 w-1.5"
                                  style={{ background: "rgba(0,0,0,0.3)" }} />
                          </Link>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm truncate">{l.book.title}</p>
                            <p className="text-xs text-[var(--color-muted)]">{$(l.book.price)} each</p>
                          </div>
                          {/* Stepper */}
                          <div className="flex items-center gap-1 glass rounded-full px-1
                                          border border-[var(--color-border)]">
                            <button onClick={() => setQty(l.book.id, l.qty - 1)}
                              className="w-7 h-7 flex items-center justify-center rounded-full
                                         hover:bg-white/10 text-sm transition-colors">−</button>
                            <span className="w-6 text-center text-sm font-mono">{l.qty}</span>
                            <button onClick={() => setQty(l.book.id, Math.min(l.book.stock, l.qty + 1))}
                              className="w-7 h-7 flex items-center justify-center rounded-full
                                         hover:bg-white/10 text-sm transition-colors">+</button>
                          </div>
                          <p className="text-sm font-semibold text-[var(--color-gold)] shrink-0 w-14 text-right">
                            {$(l.book.price * l.qty)}
                          </p>
                        </motion.li>
                      );
                    })}
                  </AnimatePresence>
                </ul>

                {/* Footer */}
                <div className="px-5 py-5 border-t border-[var(--color-border)] space-y-4"
                     style={{ background: "rgba(10,10,16,.8)" }}>
                  <div className="flex justify-between items-baseline">
                    <span className="text-[var(--color-muted)]">Subtotal</span>
                    <span className="font-display font-black text-3xl text-[var(--color-gold)]">
                      {$(total)}
                    </span>
                  </div>
                  <motion.button whileTap={{ scale: .97 }} onClick={checkout}
                    className="btn btn-primary w-full text-base py-4">
                    {user ? "Place Order" : "Log in to Checkout"}
                  </motion.button>
                  <button onClick={() => { close(); nav("/shop"); }}
                    className="btn btn-ghost w-full text-sm">
                    Continue shopping
                  </button>
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

/* ═══════════════════════════════════════════════════════
   AUTH
═══════════════════════════════════════════════════════ */
function Auth() {
  const { login } = useStore();
  const nav = useNavigate();
  const [reg, setReg] = useState(false);
  const [f, setF] = useState({ name: "", email: "", pw: "" });
  const [loading, setLoading] = useState(false);
  const set = (k: string) => (e: any) => setF({ ...f, [k]: e.target.value });

  const submit = async (e: any) => {
    e.preventDefault(); setLoading(true);
    await login(f.email, f.name, f.pw, reg);
    setLoading(false); nav("/");
  };

  return (
    <div className="min-h-screen pt-24 flex items-center justify-center px-5 relative">
      {/* BG orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div className="orb" style={{ left: "15%", top: "25%", width: 400, height: 400,
          background: "#7c3aed", opacity: 0.07 }}
          animate={{ y: [0,-30,0], x: [0,20,0] }} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }} />
        <motion.div className="orb" style={{ left: "65%", top: "55%", width: 300, height: 300,
          background: "#f5c842", opacity: 0.06 }}
          animate={{ y: [0,25,0], x: [0,-15,0] }} transition={{ duration: 13, repeat: Infinity, ease: "easeInOut" }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 36, scale: .97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 120, damping: 20 }}
        className="glass-dark w-full max-w-md p-8 relative z-10 rounded-3xl"
        style={{ boxShadow: "0 32px 80px rgba(0,0,0,.5), 0 0 0 1px rgba(255,255,255,.07)" }}>

        {/* Logo mini */}
        <div className="flex justify-center mb-8">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
               style={{ background: "linear-gradient(135deg, #f5c842, #9d7cf8)",
                        boxShadow: "0 8px 24px rgba(157,124,248,.4)" }}>
            📖
          </div>
        </div>

        {/* Tab toggle */}
        <div className="flex gap-1 p-1 rounded-2xl mb-8" style={{ background: "rgba(255,255,255,.04)" }}>
          {["Log In", "Register"].map((label, i) => (
            <button key={label} onClick={() => setReg(i === 1)}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all relative">
              {((i === 0 && !reg) || (i === 1 && reg)) && (
                <motion.span layoutId="auth-tab" className="absolute inset-0 rounded-xl"
                  style={{ background: "var(--color-panel)", border: "1px solid var(--color-border)" }}
                  transition={{ type: "spring", stiffness: 380, damping: 32 }} />
              )}
              <span className="relative z-10" style={{ color: ((i === 0 && !reg) || (i === 1 && reg)) ? "var(--color-bright)" : "var(--color-muted)" }}>
                {label}
              </span>
            </button>
          ))}
        </div>

        <h1 className="font-display font-bold text-3xl mb-6">
          {reg ? "Create account" : "Welcome back"}
        </h1>

        <form onSubmit={submit} className="space-y-4">
          <AnimatePresence initial={false}>
            {reg && (
              <motion.div key="name"
                initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <label className="block text-sm text-[var(--color-muted)] mb-1.5">Full name</label>
                <input className="field" required value={f.name} onChange={set("name")} placeholder="Jane Smith" />
              </motion.div>
            )}
          </AnimatePresence>
          <div>
            <label className="block text-sm text-[var(--color-muted)] mb-1.5">Email</label>
            <input type="email" className="field" required value={f.email} onChange={set("email")} placeholder="you@example.com" />
          </div>
          <div>
            <label className="block text-sm text-[var(--color-muted)] mb-1.5">Password</label>
            <input type="password" className="field" required minLength={6}
              value={f.pw} onChange={set("pw")} placeholder="••••••••" />
          </div>
          <motion.button whileTap={{ scale: .97 }} disabled={loading}
            className="btn btn-primary w-full py-3.5 text-base mt-2 disabled:opacity-60">
            {loading ? (
              <motion.span animate={{ rotate: 360 }}
                transition={{ duration: .7, repeat: Infinity, ease: "linear" }}
                className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
            ) : reg ? "Create account" : "Log in"}
          </motion.button>
        </form>

        <p className="mt-6 text-xs text-[var(--color-muted)] text-center leading-relaxed">
          Demo: any email works. Use an email containing "admin" to unlock the Admin panel.
        </p>
      </motion.div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   ORDERS
═══════════════════════════════════════════════════════ */
const STATUS_CFG: Record<string, { color: string; bg: string; icon: string }> = {
  Processing: { color: "#22d3ee", bg: "rgba(34,211,238,.1)",  icon: "⚙️" },
  Pending:    { color: "#f5c842", bg: "rgba(245,200,66,.1)",  icon: "⏳" },
  Shipped:    { color: "#9d7cf8", bg: "rgba(157,124,248,.1)", icon: "🚢" },
  Delivered:  { color: "#34d399", bg: "rgba(52,211,153,.1)",  icon: "✅" },
  Cancelled:  { color: "#f0607a", bg: "rgba(240,96,122,.1)",  icon: "❌" },
};

function Orders() {
  const { orders, user } = useStore();
  if (!user) return (
    <div className="min-h-screen pt-32 max-w-xl mx-auto px-5 text-center">
      <span className="text-8xl block mb-6">🔐</span>
      <h2 className="font-display font-bold text-2xl mb-3">Members only</h2>
      <p className="text-[var(--color-muted)] mb-8">Log in to view your order history.</p>
      <Link className="btn btn-primary" to="/login">Log in</Link>
    </div>
  );

  return (
    <div className="min-h-screen pt-24 pb-24 max-w-3xl mx-auto px-5">
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-[var(--color-muted)] text-xs uppercase tracking-[.25em] font-mono mb-3">
          {orders.length} orders
        </p>
        <h1 className="font-display font-black text-5xl mb-10">
          My <span className="gradient-text">Orders</span>
        </h1>
      </motion.div>

      {orders.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="glass rounded-3xl p-20 text-center">
          <span className="text-7xl block mb-6">📦</span>
          <h3 className="font-display font-bold text-xl mb-3">No orders yet</h3>
          <p className="text-[var(--color-muted)] mb-8">Start shopping to place your first order.</p>
          <Link className="btn btn-primary" to="/shop">Browse Books</Link>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {orders.map((o: any, i: number) => {
            const cfg = STATUS_CFG[o.status] ?? { color: "#fff", bg: "rgba(255,255,255,.05)", icon: "📋" };
            return (
              <motion.div key={o.id}
                initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * .07 }}
                className="glass rounded-2xl p-6 space-y-4 relative overflow-hidden"
                style={{ borderColor: `${cfg.color}25` }}>
                {/* Status glow strip */}
                <div className="absolute top-0 inset-x-0 h-[2px]"
                     style={{ background: `linear-gradient(90deg, transparent, ${cfg.color}, transparent)` }} />
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <p className="font-mono text-xs text-[var(--color-muted)]">Order ID</p>
                    <p className="font-semibold font-mono">#{String(o.id).slice(-8).toUpperCase()}</p>
                  </div>
                  <span className="tag border text-xs font-mono"
                        style={{ background: cfg.bg, color: cfg.color,
                                 borderColor: `${cfg.color}40` }}>
                    {cfg.icon} {o.status}
                  </span>
                </div>
                <p className="text-xs text-[var(--color-muted)]">
                  {new Date(o.date).toLocaleDateString("en-US",
                    { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                </p>
                <ul className="space-y-2 border-t border-[var(--color-border)] pt-3">
                  {o.items.map((it: any, k: number) => (
                    <li key={k} className="flex justify-between text-sm">
                      <span className="text-[var(--color-text)]">{it.qty} × {it.title}</span>
                      <span className="text-[var(--color-muted)] font-mono">{$(it.price * it.qty)}</span>
                    </li>
                  ))}
                </ul>
                <div className="pt-3 border-t border-[var(--color-border)] flex justify-between items-center">
                  <span className="text-sm text-[var(--color-muted)]">Order Total</span>
                  <span className="font-display font-bold text-xl text-[var(--color-gold)]">{$(o.total)}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   ADMIN
═══════════════════════════════════════════════════════ */
function Admin() {
  const { user, books, orders, addBook, removeBook } = useStore();
  const [f, setF] = useState({ title: "", author: "", category: CATS[0], price: "", stock: "" });
  const [tab, setTab] = useState<"inventory" | "orders">("inventory");
  const set = (k: string) => (e: any) => setF({ ...f, [k]: e.target.value });

  if (user?.role !== "Admin") return (
    <div className="min-h-screen pt-32 max-w-xl mx-auto px-5 text-center">
      <span className="text-7xl block mb-6">🚫</span>
      <h2 className="font-display font-bold text-2xl mb-3">Access Denied</h2>
      <p className="text-[var(--color-muted)] mb-8">This area is for administrators only.</p>
      <Link className="btn btn-primary" to="/login">Log in as Admin</Link>
    </div>
  );

  const revenue = orders.reduce((s: number, o: any) => s + o.total, 0);
  const statCards = [
    { label: "Total Books",  value: books.length,  icon: "📚", c: "var(--color-violet)" },
    { label: "Total Orders", value: orders.length, icon: "📦", c: "var(--color-cyan)" },
    { label: "Revenue",      value: $(revenue),    icon: "💰", c: "var(--color-gold)" },
    { label: "Avg. Rating",  value: "4.8★",        icon: "⭐", c: "var(--color-emerald)" },
  ];

  return (
    <div className="min-h-screen pt-24 pb-24 max-w-7xl mx-auto px-5">
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-[var(--color-muted)] text-xs uppercase tracking-[.25em] font-mono mb-3">
          Control panel
        </p>
        <h1 className="font-display font-black text-5xl mb-10">
          Admin <span className="gradient-text">Dashboard</span>
        </h1>
      </motion.div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {statCards.map(({ label, value, icon, c }, i) => (
          <motion.div key={label}
            initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * .08 }}
            className="glass rounded-2xl p-6 relative overflow-hidden group">
            <motion.div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{ background: `radial-gradient(circle at 80% 20%, ${c}18, transparent 60%)` }} />
            <div className="absolute right-4 top-4 text-3xl opacity-20">{icon}</div>
            <p className="text-xs text-[var(--color-muted)] mb-1 relative">{label}</p>
            <p className="font-display font-black text-3xl relative" style={{ color: c }}>{value}</p>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {(["inventory", "orders"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className="relative px-5 py-2 rounded-full text-sm font-medium border capitalize">
            {tab === t && (
              <motion.span layoutId="admin-tab" className="absolute inset-0 rounded-full"
                style={{ background: "rgba(157,124,248,.13)", border: "1px solid rgba(157,124,248,.25)" }}
                transition={{ type: "spring", stiffness: 350, damping: 30 }} />
            )}
            <span className="relative z-10"
                  style={{ color: tab === t ? "var(--color-bright)" : "var(--color-muted)" }}>
              {t}
            </span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {tab === "inventory" ? (
          <motion.div key="inv"
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
            {/* Add form */}
            <div className="glass rounded-2xl p-6 mb-6">
              <h2 className="font-display font-bold text-xl mb-5">Add New Book</h2>
              <form onSubmit={e => {
                e.preventDefault();
                addBook({ ...f, price: +f.price, stock: +f.stock });
                setF({ title: "", author: "", category: CATS[0], price: "", stock: "" });
              }} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <input className="field" required placeholder="Title" value={f.title} onChange={set("title")} />
                <input className="field" required placeholder="Author" value={f.author} onChange={set("author")} />
                <select className="field" value={f.category} onChange={set("category")}>
                  {CATS.map(c => <option key={c}>{c}</option>)}
                </select>
                <input type="number" step=".01" min="0" className="field"
                  required placeholder="Price (USD)" value={f.price} onChange={set("price")} />
                <input type="number" min="0" className="field"
                  required placeholder="Stock" value={f.stock} onChange={set("stock")} />
                <motion.button whileTap={{ scale: .97 }} className="btn btn-primary">
                  + Add Book
                </motion.button>
              </form>
            </div>

            {/* Table */}
            <div className="glass rounded-2xl overflow-hidden">
              <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 px-5 py-3
                              text-xs uppercase tracking-widest font-mono text-[var(--color-muted)]
                              border-b border-[var(--color-border)]">
                <span>Title</span><span>Cat</span><span>Price</span><span>Stock</span><span />
              </div>
              <ul>
                <AnimatePresence initial={false}>
                  {books.map((b: any) => (
                    <motion.li key={b.id} layout
                      initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, height: 0, overflow: "hidden" }}
                      className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 items-center
                                 px-5 py-3.5 border-b border-[var(--color-border)] last:border-0
                                 hover:bg-white/[.025] transition-colors">
                      <span className="text-sm font-medium truncate">{b.title}</span>
                      <CatBadge cat={b.category} />
                      <span className="text-sm font-mono text-[var(--color-gold)]">{$(b.price)}</span>
                      <span className="text-sm font-mono text-[var(--color-muted)]">{b.stock}</span>
                      <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: .9 }}
                        onClick={() => removeBook(b.id)}
                        className="btn btn-danger text-xs px-3 py-1.5">
                        Remove
                      </motion.button>
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>
            </div>
          </motion.div>
        ) : (
          <motion.div key="ord"
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
            className="space-y-3">
            {orders.length === 0 ? (
              <div className="glass rounded-2xl p-16 text-center">
                <p className="text-5xl mb-4">📭</p>
                <p className="text-[var(--color-muted)]">No orders yet.</p>
              </div>
            ) : orders.map((o: any, i: number) => {
              const cfg = STATUS_CFG[o.status] ?? { color: "#fff", bg: "rgba(255,255,255,.05)", icon: "📋" };
              return (
                <motion.div key={o.id}
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * .05 }}
                  className="glass rounded-2xl p-5 flex flex-wrap gap-4 items-center justify-between">
                  <div>
                    <p className="font-mono text-xs text-[var(--color-muted)]">
                      #{String(o.id).slice(-8).toUpperCase()}
                    </p>
                    <p className="text-sm mt-0.5">{o.items.length} item(s)</p>
                  </div>
                  <span className="tag border"
                    style={{ background: cfg.bg, color: cfg.color, borderColor: `${cfg.color}40` }}>
                    {cfg.icon} {o.status}
                  </span>
                  <span className="font-display font-bold text-xl text-[var(--color-gold)]">
                    {$(o.total)}
                  </span>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   PAGE TRANSITION WRAPPER
═══════════════════════════════════════════════════════ */
const pageVariants = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -16 },
};
const pageTransition = { duration: .4, ease: [.4, 0, .2, 1] as const };

function PageWrapper({ children }: { children: ReactNode }) {
  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit"
      transition={pageTransition}>
      {children}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════
   APP ROOT
═══════════════════════════════════════════════════════ */
export default function App() {
  const location = useLocation();

  // Track mouse for button ripple
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const btn = target.closest(".btn") as HTMLElement | null;
      if (btn) {
        const r = btn.getBoundingClientRect();
        btn.style.setProperty("--bx", ((e.clientX - r.left) / r.width * 100) + "%");
        btn.style.setProperty("--by", ((e.clientY - r.top)  / r.height * 100) + "%");
      }
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <>
      <CustomCursor />
      <Nav />
      <Drawer />
      <Toast />

      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<PageWrapper><Home /></PageWrapper>} />
          <Route path="/shop" element={<PageWrapper><Shop /></PageWrapper>} />
          <Route path="/book/:id" element={<PageWrapper><Details /></PageWrapper>} />
          <Route path="/login" element={<PageWrapper><Auth /></PageWrapper>} />
          <Route path="/orders" element={<PageWrapper><Orders /></PageWrapper>} />
          <Route path="/admin" element={<PageWrapper><Admin /></PageWrapper>} />
        </Routes>
      </AnimatePresence>
    </>
  );
}
