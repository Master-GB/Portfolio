"use client";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useOS } from "@/contexts/OSContext";

type Anchor = "start" | "middle" | "end";

const CENTER = 150;
const NODE_R = 104;
const CORE_R = 32;
const NODE_HEX_R = 15;
const ANGLES = [-90, -30, 30, 90, 150, 210]; // top, upper-right, lower-right, bottom, lower-left, upper-left

function hexPoints(cx: number, cy: number, r: number): string {
  return Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 180) * (60 * i - 90);
    return `${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`;
  }).join(" ");
}

function nodePoint(angleDeg: number) {
  const rad = (Math.PI / 180) * angleDeg;
  return { x: CENTER + NODE_R * Math.cos(rad), y: CENTER + NODE_R * Math.sin(rad) };
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

const STAGE_META: { label: string; text: string; code: string; labelDx: number; labelDy: number; anchor: Anchor }[] = [
  { label: "KERNEL", text: "Loading kernel modules", code: "kern", labelDx: 0, labelDy: -20, anchor: "middle" },
  { label: "FILESYSTEM", text: "Mounting portfolio filesystem", code: "vfs", labelDx: 20, labelDy: -4, anchor: "start" },
  { label: "RENDERER", text: "Initializing 3D renderer", code: "gfx", labelDx: 20, labelDy: 24, anchor: "start" },
  { label: "SHADERS", text: "Calibrating shader pipeline", code: "shdr", labelDx: 0, labelDy: 32, anchor: "middle" },
  { label: "WINDOW MGR", text: "Starting window manager", code: "wm", labelDx: -20, labelDy: 24, anchor: "end" },
  { label: "AUTH", text: `Welcome...`, code: "auth", labelDx: -20, labelDy: -4, anchor: "end" },
];

const STAGES = STAGE_META.map((meta, i) => ({ ...meta, ...nodePoint(ANGLES[i]) }));

type LogLine = { id: number; time: string; code: string; text: string };
type Stats = { cpu: number; mem: number; net: number; netHistory: number[] };

export default function BootScreen() {
  const { booted, setBooted, settings } = useOS();
  const [stepIndex, setStepIndex] = useState(0);
  const [logLines, setLogLines] = useState<LogLine[]>([]);
  const [stats, setStats] = useState<Stats>({ cpu: 14, mem: 2.1, net: 12, netHistory: Array(10).fill(4) });

  const fieldRef = useRef<HTMLCanvasElement>(null);
  const coreRef = useRef<HTMLCanvasElement>(null);
  const hasStartedRef = useRef(false);
  const startTimeRef = useRef(0);
  const logIdRef = useRef(0);
  const stepIndexRef = useRef(0);
  const burstsRef = useRef<{ x: number; y: number; t0: number }[]>([]);
  const shockRef = useRef<{ t0: number }[]>([]);

  const progress = Math.round((stepIndex / STAGES.length) * 100);
  const done = stepIndex === STAGES.length;
  const currentStage = STAGES[Math.min(stepIndex, STAGES.length - 1)];

  // boot sequence timing — guarded to run exactly once. OSContext re-renders
  // frequently (window drag, focus changes, etc.), and if that ever gives us a
  // new `setBooted`/`settings` reference, an effect keyed on those would restart
  // the interval from scratch — which is exactly what was interrupting every
  // node after the first before its animation could finish.
  useEffect(() => {
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;

    if (booted || !settings.bootAnimation || settings.reduceMotion) {
      setBooted(true);
      return;
    }

    startTimeRef.current = performance.now();
    setLogLines([{ id: logIdRef.current++, time: "0.00", code: "boot", text: "GihanOS kernel booting…" }]);

    let i = 0;
    const interval = setInterval(() => {
      if (i < STAGES.length) {
        const stage = STAGES[i];
        i++;
        setStepIndex(i);
        const elapsed = ((performance.now() - startTimeRef.current) / 1000).toFixed(2);
        setLogLines((prev) =>
          [...prev, { id: logIdRef.current++, time: elapsed, code: stage.code, text: `${stage.text} … OK` }].slice(-7)
        );
      } else {
        clearInterval(interval);
        const elapsed = ((performance.now() - startTimeRef.current) / 1000).toFixed(2);
        setLogLines((prev) => [...prev, { id: logIdRef.current++, time: elapsed, code: "sys", text: "System ready." }].slice(-7));
        setTimeout(() => setBooted(true), 1000);
      }
    }, 680);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    stepIndexRef.current = stepIndex;
    if (stepIndex > 0 && stepIndex <= STAGES.length) {
      const s = STAGES[stepIndex - 1];
      burstsRef.current.push({ x: s.x, y: s.y, t0: performance.now() });
    }
  }, [stepIndex]);

  useEffect(() => {
    if (done) shockRef.current.push({ t0: performance.now() });
  }, [done]);

  // decorative system-load readout
  useEffect(() => {
    if (booted) return;
    const id = setInterval(() => {
      setStats((s) => {
        const net = clamp(s.net + (Math.random() - 0.4) * 40, 2, 220);
        return {
          cpu: clamp(s.cpu + (Math.random() - 0.45) * 14, 8, 82),
          mem: clamp(s.mem + (Math.random() - 0.5) * 0.15, 1.8, 3.6),
          net,
          netHistory: [...s.netHistory.slice(-9), net],
        };
      });
    }, 220);
    return () => clearInterval(id);
  }, [booted]);

  // ambient constellation backdrop — a network of drifting, linking motes.
  useEffect(() => {
    if (booted) return;
    const canvas = fieldRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    let raf = 0;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    type Mote = { x: number; y: number; vx: number; vy: number; r: number; phase: number };
    let motes: Mote[] = [];
    const seed = () => {
      const count = Math.min(90, Math.floor((width * height) / 16000));
      motes = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.15,
        r: Math.random() * 1.3 + 0.6,
        phase: Math.random() * Math.PI * 2,
      }));
    };
    seed();

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      seed();
    };
    window.addEventListener("resize", handleResize);

    const LINK_DIST = 130;
    const draw = (t: number) => {
      ctx.clearRect(0, 0, width, height);
      for (const m of motes) {
        m.x += m.vx;
        m.y += m.vy;
        if (m.x < 0) m.x = width;
        if (m.x > width) m.x = 0;
        if (m.y < 0) m.y = height;
        if (m.y > height) m.y = 0;
      }
      for (let i = 0; i < motes.length; i++) {
        for (let j = i + 1; j < motes.length; j++) {
          const a = motes[i];
          const b = motes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < LINK_DIST) {
            ctx.strokeStyle = `rgba(99,102,241,${0.12 * (1 - dist / LINK_DIST)})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }
      for (const m of motes) {
        const tw = 0.5 + 0.5 * Math.sin(t / 900 + m.phase);
        ctx.fillStyle = `rgba(56,189,248,${0.22 + 0.35 * tw})`;
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", handleResize);
    };
  }, [booted]);

  // core diagram overlay — data packets travelling the active spoke, energy
  // bursts collected into the core on stage completion, and a shockwave
  // once the boot sequence finishes.
  useEffect(() => {
    if (booted) return;
    const canvas = coreRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    let raf = 0;
    const resize = () => {
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = (t: number) => {
      const scale = canvas.width / 300;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const cx = CENTER * scale;
      const cy = CENTER * scale;
      const curStep = stepIndexRef.current;

      if (curStep < STAGES.length) {
        const s = STAGES[curStep];
        const nx = s.x * scale;
        const ny = s.y * scale;
        const packets = 3;
        for (let k = 0; k < packets; k++) {
          const tt = (t / 620 + k / packets) % 1;
          const px = cx + (nx - cx) * tt;
          const py = cy + (ny - cy) * tt;
          const alpha = Math.sin(tt * Math.PI);
          ctx.fillStyle = `rgba(251,191,36,${0.8 * alpha})`;
          ctx.beginPath();
          ctx.arc(px, py, 2.3 * scale, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      burstsRef.current = burstsRef.current.filter((b) => t - b.t0 < 700);
      for (const b of burstsRef.current) {
        const life = (t - b.t0) / 700;
        const nx = b.x * scale;
        const ny = b.y * scale;
        ctx.strokeStyle = `rgba(34,211,238,${0.6 * (1 - life)})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(nx, ny, (6 + life * 22) * scale, 0, Math.PI * 2);
        ctx.stroke();
        const px = nx + (cx - nx) * life;
        const py = ny + (cy - ny) * life;
        ctx.fillStyle = `rgba(103,232,249,${0.9 * (1 - life)})`;
        ctx.beginPath();
        ctx.arc(px, py, 2.1 * scale, 0, Math.PI * 2);
        ctx.fill();
      }

      shockRef.current = shockRef.current.filter((s) => t - s.t0 < 900);
      for (const s of shockRef.current) {
        const life = Math.max(0, (t - s.t0) / 900);
        ctx.strokeStyle = `rgba(34,211,238,${0.5 * (1 - life)})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cx, cy, life * 170 * scale, 0, Math.PI * 2);
        ctx.stroke();
        const life2 = Math.max(0, life - 0.15);
        ctx.strokeStyle = `rgba(244,114,182,${0.35 * (1 - life)})`;
        ctx.beginPath();
        ctx.arc(cx, cy, life2 * 190 * scale, 0, Math.PI * 2);
        ctx.stroke();
      }

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [booted]);

  return (
    <AnimatePresence>
      {!booted && (
        <motion.div
          className="fixed inset-0 z-[9999] flex flex-col overflow-hidden bg-[#03050a] font-mono text-slate-200"
          initial={{ clipPath: "circle(0% at 50% 50%)" }}
          animate={{ clipPath: "circle(150% at 50% 50%)" }}
          exit={{ clipPath: "circle(0% at 50% 50%)", opacity: 0 }}
          transition={{ duration: 0.8, ease: [0.65, 0, 0.35, 1] }}
        >
          {/* backdrop layers */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.10),transparent_60%)]" />
          <canvas ref={fieldRef} className="pointer-events-none absolute inset-0 opacity-80" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(0,0,0,0.82)_100%)]" />
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage: "repeating-linear-gradient(0deg, rgba(255,255,255,0.6) 0px, transparent 1px, transparent 3px)",
            }}
          />

          {/* stage-completion power flicker */}
          <motion.div
            key={`flicker-${stepIndex}`}
            initial={{ opacity: stepIndex > 0 ? 0.16 : 0 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="pointer-events-none absolute inset-0 bg-cyan-200 mix-blend-overlay"
          />

          {/* top chrome bar */}
          <div className="relative z-10 flex h-12 items-center justify-between border-b border-white/5 px-5 sm:px-8">
            <div className="flex items-center gap-2.5">
              <svg viewBox="0 0 30 30" className="h-4 w-4">
                <polygon
                  points={hexPoints(15, 15, 13)}
                  fill="url(#logoGradient)"
                  stroke="rgba(255,255,255,0.4)"
                  strokeWidth={1}
                />
                <defs>
                  <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#22d3ee" />
                  </linearGradient>
                </defs>
              </svg>
              <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-300">GihanOS</span>
            </div>

            <div className="hidden items-center gap-1.5 text-[10px] uppercase tracking-[0.25em] text-slate-500 sm:flex">
              <span>Compiling portfolio</span>
              <span className="flex gap-0.5">
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    className="h-1 w-1 rounded-full bg-cyan-400"
                    animate={{ opacity: [0.2, 1, 0.2] }}
                    transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.2 }}
                  />
                ))}
              </span>
            </div>

            <div className="flex items-center gap-2 text-[11px] tabular-nums text-slate-300">
              <span className={`h-1.5 w-1.5 rounded-full ${done ? "bg-emerald-400" : "bg-amber-400 animate-pulse"}`} />
              {progress}%
            </div>
          </div>

          {/* segmented stage progress */}
          <div className="relative z-10 flex gap-1 px-5 py-2.5 sm:px-8">
            {STAGES.map((s, i) => {
              const state = i < stepIndex ? "done" : i === stepIndex && !done ? "active" : "pending";
              return (
                <div key={s.label} className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/5">
                  <motion.div
                    className={`h-full rounded-full ${
                      state === "done" ? "bg-cyan-400" : state === "active" ? "bg-amber-400" : "bg-transparent"
                    }`}
                    initial={{ scaleX: 0 }}
                    animate={{
                      scaleX: state === "pending" ? 0 : 1,
                      opacity: state === "active" ? [0.5, 1] : 1,
                    }}
                    style={{ transformOrigin: "left" }}
                    transition={
                      state === "active"
                        ? { scaleX: { duration: 0.35 }, opacity: { duration: 0.9, repeat: Infinity } }
                        : { duration: 0.35 }
                    }
                  />
                </div>
              );
            })}
          </div>

          {/* main circuit diagram */}
          <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6">
            <div className="relative h-64 w-64 sm:h-80 sm:w-80">
              <svg viewBox="0 0 300 300" className="absolute inset-0 h-full w-full">
                {STAGES.map((s, i) => (
                  <line
                    key={`base-${i}`}
                    x1={CENTER}
                    y1={CENTER}
                    x2={s.x}
                    y2={s.y}
                    stroke={i < stepIndex ? "rgba(34,211,238,0.35)" : "rgba(100,116,139,0.22)"}
                    strokeWidth={1.2}
                  />
                ))}

                <defs>
                  <radialGradient id="coreGradient">
                    <stop offset="0%" stopColor="#1e293b" />
                    <stop offset="100%" stopColor="#0b1120" />
                  </radialGradient>
                </defs>

                {/* core */}
                <motion.polygon
                  points={hexPoints(CENTER, CENTER, CORE_R + 9)}
                  fill="none"
                  stroke="rgba(56,189,248,0.3)"
                  strokeWidth={1}
                  strokeDasharray="3 5"
                  animate={{ rotate: 360 }}
                  transition={{ duration: done ? 3 : 14, repeat: Infinity, ease: "linear" }}
                  style={{ transformOrigin: `${CENTER}px ${CENTER}px` }}
                />
                <polygon
                  points={hexPoints(CENTER, CENTER, CORE_R)}
                  fill="url(#coreGradient)"
                  stroke={done ? "#67e8f9" : "#22d3ee"}
                  strokeWidth={2}
                />

                {/* nodes */}
                {STAGES.map((s, i) => {
                  const completed = i < stepIndex;
                  const active = i === stepIndex && !done;
                  const fill = completed ? "rgba(34,211,238,0.15)" : active ? "rgba(251,191,36,0.12)" : "rgba(15,23,42,0.6)";
                  const stroke = completed ? "#22d3ee" : active ? "#fbbf24" : "rgba(100,116,139,0.4)";
                  const labelColor = completed ? "#67e8f9" : active ? "#fbbf24" : "#475569";
                  return (
                    <g key={`node-${i}`}>
                      {active && (
                        <motion.polygon
                          points={hexPoints(s.x, s.y, NODE_HEX_R)}
                          fill="none"
                          stroke="#fbbf24"
                          initial={{ opacity: 0.7, scale: 1 }}
                          animate={{ opacity: 0, scale: 1.7 }}
                          transition={{ duration: 1.1, repeat: Infinity, ease: "easeOut" }}
                          style={{ transformOrigin: `${s.x}px ${s.y}px` }}
                        />
                      )}
                      <polygon points={hexPoints(s.x, s.y, NODE_HEX_R)} fill={fill} stroke={stroke} strokeWidth={1.5} />
                      {completed && (
                        <text x={s.x} y={s.y + 3} textAnchor="middle" fontSize="10" fill="#22d3ee" fontWeight={700}>
                          ✓
                        </text>
                      )}
                      <text
                        x={s.x + s.labelDx}
                        y={s.y + s.labelDy}
                        textAnchor={s.anchor}
                        fontSize="7"
                        letterSpacing="1.2"
                        fontFamily="ui-monospace, monospace"
                        fill={labelColor}
                      >
                        {s.label}
                      </text>
                    </g>
                  );
                })}
              </svg>

              {/* particle overlay: flowing packets, completion bursts, shockwave */}
              <canvas ref={coreRef} className="pointer-events-none absolute inset-0 h-full w-full" />

              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-semibold tracking-tight text-white tabular-nums">{progress}%</span>
                <span className="mt-0.5 text-[8px] uppercase tracking-[0.2em] text-slate-500">{done ? "online" : "core"}</span>
              </div>
            </div>

            {/* single-line status readout */}
            <div className="mt-6 h-4 text-[11px] text-slate-400">
              <AnimatePresence mode="wait">
                <motion.span
                  key={stepIndex}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center gap-2"
                >
                  <span className="text-cyan-500">❯</span>
                  {currentStage.text}
                  {done ? " — complete" : "..."}
                </motion.span>
              </AnimatePresence>
            </div>
          </div>

          {/* footer HUD: boot log (left) + system readout (right) */}
          <div className="relative z-10 flex items-end justify-between gap-4 px-5 py-4 sm:px-8">
            <div className="flex h-28 w-full max-w-[300px] flex-col justify-end gap-0.5 overflow-hidden text-[9.5px] leading-relaxed text-slate-500 sm:max-w-[340px] sm:text-[10px]">
              <AnimatePresence initial={false}>
                {logLines.map((line, idx) => (
                  <motion.div
                    key={line.id}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: idx === logLines.length - 1 ? 1 : 0.45, x: 0 }}
                    transition={{ duration: 0.25 }}
                    className="flex shrink-0 gap-2 truncate"
                  >
                    <span className="shrink-0 text-slate-600">[{line.time}s]</span>
                    <span className="shrink-0 text-indigo-400/80">{line.code}</span>
                    <span className="truncate text-slate-400">{line.text}</span>
                  </motion.div>
                ))}
              </AnimatePresence>
              {!done && (
                <motion.span
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ duration: 0.9, repeat: Infinity }}
                  className="shrink-0 text-cyan-400"
                >
                  ❯ _
                </motion.span>
              )}
            </div>

            <div className="hidden shrink-0 flex-col items-end gap-1 text-[9.5px] tabular-nums text-slate-500 sm:flex">
              <div className="flex items-center gap-2">
                <span className="w-7 text-right text-slate-600">CPU</span>
                <span className="text-slate-300">{stats.cpu.toFixed(0)}%</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-7 text-right text-slate-600">MEM</span>
                <span className="text-slate-300">{stats.mem.toFixed(1)}G</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-7 text-right text-slate-600">NET</span>
                <span className="text-slate-300">{stats.net.toFixed(0)}k/s</span>
                <span className="flex h-3 items-end gap-[1.5px]">
                  {stats.netHistory.map((v, i) => (
                    <span
                      key={i}
                      className="w-[2px] rounded-full bg-cyan-400/70"
                      style={{ height: `${clamp((v / 220) * 100, 12, 100)}%` }}
                    />
                  ))}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}