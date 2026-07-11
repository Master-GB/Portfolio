"use client";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { profile } from "@/data/portfolio";
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

const STAGE_META: { label: string; text: string; labelDx: number; labelDy: number; anchor: Anchor }[] = [
  { label: "KERNEL", text: "Loading kernel modules", labelDx: 0, labelDy: -20, anchor: "middle" },
  { label: "FILESYSTEM", text: "Mounting portfolio filesystem", labelDx: 20, labelDy: -4, anchor: "start" },
  { label: "RENDERER", text: "Initializing 3D renderer", labelDx: 20, labelDy: 24, anchor: "start" },
  { label: "SHADERS", text: "Calibrating shader pipeline", labelDx: 0, labelDy: 32, anchor: "middle" },
  { label: "WINDOW MGR", text: "Starting window manager", labelDx: -20, labelDy: 24, anchor: "end" },
  { label: `AUTH`, text: `Welcome, ${profile.name}`, labelDx: -20, labelDy: -4, anchor: "end" },
];

const STAGES = STAGE_META.map((meta, i) => ({ ...meta, ...nodePoint(ANGLES[i]) }));

export default function BootScreen() {
  const { booted, setBooted, settings } = useOS();
  const [stepIndex, setStepIndex] = useState(0);
  const rainRef = useRef<HTMLCanvasElement>(null);
  const barSeed = useRef(Array.from({ length: 32 }, () => Math.random()));
  const hasStartedRef = useRef(false);

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
    let i = 0;
    const interval = setInterval(() => {
      if (i < STAGES.length) {
        i++;
        setStepIndex(i);
      } else {
        clearInterval(interval);
        setTimeout(() => setBooted(true), 700);
      }
    }, 480);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // hex data-rain backdrop
  useEffect(() => {
    if (booted) return;
    const canvas = rainRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    let raf = 0;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    const fontSize = 13;
    const chars = "0123456789ABCDEF";
    let columns = Math.floor(width / 16);
    let drops = Array.from({ length: columns }, () => Math.floor(Math.random() * -60));

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      columns = Math.floor(width / 16);
      drops = Array.from({ length: columns }, () => Math.floor(Math.random() * -60));
    };
    window.addEventListener("resize", handleResize);

    const draw = () => {
      ctx.fillStyle = "rgba(3,6,12,0.14)";
      ctx.fillRect(0, 0, width, height);
      ctx.font = `${fontSize}px monospace`;
      ctx.fillStyle = "rgba(56,189,248,0.32)";
      for (let i = 0; i < drops.length; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)];
        const x = i * 16;
        const y = drops[i] * fontSize;
        ctx.fillText(char, x, y);
        if (y > height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      }
      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", handleResize);
    };
  }, [booted]);

  const progress = Math.round((stepIndex / STAGES.length) * 100);
  const done = stepIndex === STAGES.length;
  const currentStage = STAGES[Math.min(stepIndex, STAGES.length - 1)];

  return (
    <AnimatePresence>
      {!booted && (
        <motion.div
          className="fixed inset-0 z-[9999] flex flex-col overflow-hidden bg-[#03050a] font-mono text-slate-200"
          exit={{ opacity: 0, scale: 1.03, filter: "blur(6px)" }}
          transition={{ duration: 0.7, ease: [0.65, 0, 0.35, 1] }}
        >
          <style>{`
            @keyframes traceDash {
              from { stroke-dashoffset: 0; }
              to { stroke-dashoffset: -32; }
            }
            @keyframes traceFadeOut {
              0% { opacity: 1; }
              30% { opacity: 1; }
              100% { opacity: 0; }
            }
          `}</style>

          {/* backdrop layers */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.10),transparent_60%)]" />
          <canvas ref={rainRef} className="pointer-events-none absolute inset-0 opacity-70" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(0,0,0,0.8)_100%)]" />

          {/* power-surge sweep on completion */}
          {done && (
            <motion.div
              initial={{ x: "-120%", opacity: 0 }}
              animate={{ x: "120%", opacity: [0, 1, 0] }}
              transition={{ duration: 0.7, ease: "easeInOut" }}
              className="pointer-events-none absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-cyan-300/40 to-transparent blur-md"
            />
          )}

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

          {/* main circuit diagram */}
          <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6">
            <div className="relative h-64 w-64 sm:h-80 sm:w-80">
              <svg viewBox="0 0 300 300" className="h-full w-full">
                {/* traces — plain CSS @keyframes (defined below), not Framer Motion.
                   A fresh DOM node's CSS animation always starts at frame zero, so every
                   node behaves identically instead of depending on React/Framer remount timing. */}
                {STAGES.map((s, i) => {
                  const completed = i < stepIndex;
                  const active = i === stepIndex && !done;
                  const phase = completed ? "completed" : active ? "active" : "pending";

                  if (phase === "pending") {
                    return (
                      <line
                        key={`line-${i}-pending`}
                        x1={CENTER}
                        y1={CENTER}
                        x2={s.x}
                        y2={s.y}
                        stroke="rgba(100,116,139,0.25)"
                        strokeWidth={1.5}
                      />
                    );
                  }

                  if (phase === "active") {
                    return (
                      <line
                        key={`line-${i}-active`}
                        x1={CENTER}
                        y1={CENTER}
                        x2={s.x}
                        y2={s.y}
                        stroke="#fbbf24"
                        strokeWidth={2}
                        strokeDasharray="6 10"
                        style={{ animation: "traceDash 0.4s linear infinite" }}
                      />
                    );
                  }

                  // completed: flash solid to confirm the connection, then retract to nothing
                  return (
                    <line
                      key={`line-${i}-completed`}
                      x1={CENTER}
                      y1={CENTER}
                      x2={s.x}
                      y2={s.y}
                      stroke="url(#traceGradient)"
                      strokeWidth={2}
                      style={{
                        filter: "drop-shadow(0 0 4px rgba(34,211,238,0.55))",
                        animation: "traceFadeOut 0.65s ease-out forwards",
                      }}
                    />
                  );
                })}

                <defs>
                  <linearGradient id="traceGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#22d3ee" />
                  </linearGradient>
                  <radialGradient id="coreGradient">
                    <stop offset="0%" stopColor="#1e293b" />
                    <stop offset="100%" stopColor="#0b1120" />
                  </radialGradient>
                </defs>

                {/* core */}
                <motion.polygon
                  points={hexPoints(CENTER, CENTER, CORE_R + 9)}
                  fill="none"
                  stroke="rgba(56,189,248,0.25)"
                  strokeWidth={1}
                  strokeDasharray="3 5"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
                  style={{ transformOrigin: `${CENTER}px ${CENTER}px` }}
                />
                <polygon points={hexPoints(CENTER, CENTER, CORE_R)} fill="url(#coreGradient)" stroke="#22d3ee" strokeWidth={2} />

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

              <div className="absolute inset-0 flex flex-col items-center justify-center">
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

          {/* data-spectrum footer */}
          <div className="relative z-10 flex h-14 items-end justify-center gap-1 px-8 pb-5">
            {barSeed.current.map((seed, i) => {
              const active = i < Math.round((progress / 100) * barSeed.current.length);
              return (
                <motion.div
                  key={i}
                  className={`w-1 rounded-full ${active ? "bg-gradient-to-t from-indigo-400 via-cyan-400 to-pink-400" : "bg-slate-800"}`}
                  animate={active ? { scaleY: [0.3, 1, 0.4, 0.85, 0.3] } : { scaleY: 0.2 }}
                  transition={active ? { duration: 1 + seed * 0.8, repeat: Infinity, ease: "easeInOut", delay: seed * 0.4 } : undefined}
                  style={{ height: 24, transformOrigin: "bottom" }}
                />
              );
            })}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}