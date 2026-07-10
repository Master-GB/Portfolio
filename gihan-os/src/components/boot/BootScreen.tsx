"use client";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { profile } from "@/data/portfolio";
import { useOS } from "@/contexts/OSContext";

const BOOT_LINES = [
  "Loading kernel modules",
  "Mounting portfolio filesystem",
  "Initializing 3D renderer",
  "Calibrating shader pipeline",
  "Starting window manager",
  `Welcome, ${profile.name}`,
];

const RING_RADIUS = 54;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;
const SEGMENTS = 24;

export default function BootScreen() {
  const { booted, setBooted, settings } = useOS();
  const [lines, setLines] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // boot sequence timing
  useEffect(() => {
    if (booted || !settings.bootAnimation || settings.reduceMotion) {
      setBooted(true);
      return;
    }
    let lineIndex = 0;
    const lineInterval = setInterval(() => {
      if (lineIndex < BOOT_LINES.length) {
        setLines((prev) => [...prev, BOOT_LINES[lineIndex]]);
        lineIndex++;
        setProgress(Math.round((lineIndex / BOOT_LINES.length) * 100));
      } else {
        clearInterval(lineInterval);
        setTimeout(() => setBooted(true), 700);
      }
    }, 380);
    return () => clearInterval(lineInterval);
  }, [booted, setBooted, settings.bootAnimation, settings.reduceMotion]);

  // ambient starfield behind the console
  useEffect(() => {
    if (booted) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    let raf = 0;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const stars = Array.from({ length: 110 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 1.2 + 0.3,
      phase: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.015 + 0.006,
    }));

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    let t = 0;
    const draw = () => {
      t += 1;
      ctx.clearRect(0, 0, width, height);
      for (const s of stars) {
        const twinkle = 0.5 + 0.5 * Math.sin(t * s.speed + s.phase);
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(148, 197, 255, ${0.15 + twinkle * 0.55})`;
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", handleResize);
    };
  }, [booted]);

  const ringOffset = RING_CIRCUMFERENCE * (1 - progress / 100);
  const lastIndex = BOOT_LINES.length - 1;

  return (
    <AnimatePresence>
      {!booted && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden bg-[#03050b] font-mono text-slate-200"
          exit={{ opacity: 0, scale: 1.04, filter: "blur(6px)" }}
          transition={{ duration: 0.7, ease: [0.65, 0, 0.35, 1] }}
        >
          {/* atmosphere layers */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(56,189,248,0.10),transparent_65%)]" />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.05)_1px,transparent_1px)] bg-[size:42px_42px]" />
          <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 opacity-80" />
          <div className="pointer-events-none absolute inset-0 opacity-[0.06] mix-blend-overlay bg-[repeating-linear-gradient(0deg,#fff_0px,#fff_1px,transparent_1px,transparent_3px)]" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.78)_100%)]" />

          {/* HUD corner brackets */}
          {[
            "top-6 left-6 border-t border-l",
            "top-6 right-6 border-t border-r",
            "bottom-6 left-6 border-b border-l",
            "bottom-6 right-6 border-b border-r",
          ].map((pos) => (
            <div key={pos} className={`pointer-events-none absolute ${pos} h-8 w-8 border-cyan-400/30`} />
          ))}

          <div className="pointer-events-none absolute left-10 top-10 hidden text-[10px] uppercase tracking-[0.3em] text-slate-500 sm:block">
            GihanOS // Boot
          </div>
          <div className="pointer-events-none absolute right-10 top-10 hidden items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-slate-500 sm:flex">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-400" />
            init
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="relative z-10 flex w-full max-w-md flex-col items-center px-6"
          >
            {/* reactor ring */}
            <div className="relative mb-8 h-40 w-40">
              <motion.svg
                viewBox="0 0 120 120"
                className="absolute inset-0 h-full w-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              >
                {Array.from({ length: 36 }).map((_, i) => (
                  <line
                    key={i}
                    x1={60}
                    y1={4}
                    x2={60}
                    y2={i % 3 === 0 ? 10 : 8}
                    stroke="rgba(56,189,248,0.35)"
                    strokeWidth={1}
                    transform={`rotate(${i * 10} 60 60)`}
                  />
                ))}
              </motion.svg>

              <svg viewBox="0 0 120 120" className="absolute inset-0 h-full w-full -rotate-90">
                <circle cx={60} cy={60} r={RING_RADIUS} fill="none" stroke="rgba(148,163,184,0.12)" strokeWidth={3} />
                <motion.circle
                  cx={60}
                  cy={60}
                  r={RING_RADIUS}
                  fill="none"
                  stroke="url(#ringGradient)"
                  strokeWidth={3}
                  strokeLinecap="round"
                  strokeDasharray={RING_CIRCUMFERENCE}
                  initial={{ strokeDashoffset: RING_CIRCUMFERENCE }}
                  animate={{ strokeDashoffset: ringOffset }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                />
                <defs>
                  <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="50%" stopColor="#22d3ee" />
                    <stop offset="100%" stopColor="#f472b6" />
                  </linearGradient>
                </defs>
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-semibold tracking-tight text-white tabular-nums">{progress}%</span>
                <span className="mt-0.5 text-[9px] uppercase tracking-[0.25em] text-slate-500">booting</span>
              </div>

              {progress >= 100 && (
                <motion.div
                  initial={{ opacity: 0.9, scale: 0.8 }}
                  animate={{ opacity: 0, scale: 1.6 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="absolute inset-0 rounded-full bg-cyan-400/40 blur-xl"
                />
              )}
            </div>

            {/* wordmark */}
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-400 text-sm font-bold text-white shadow-lg shadow-indigo-500/30">
                G
              </div>
              <div className="text-left">
                <h1 className="text-lg font-semibold tracking-tight text-white">GihanOS</h1>
                <p className="text-[10px] uppercase tracking-[0.25em] text-slate-500">v1.0 · developer OS</p>
              </div>
            </div>

            {/* boot log */}
            <div className="mb-6 h-32 w-full space-y-1.5 overflow-hidden text-xs">
              {lines.map((line, i) => {
                const isLast = i === lastIndex;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.25 }}
                    className="flex items-center justify-between gap-3"
                  >
                    <span className={`flex items-center gap-2 ${isLast ? "font-medium text-cyan-300" : "text-slate-400"}`}>
                      <span className="text-cyan-500">❯</span>
                      {line}
                    </span>
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.18, duration: 0.2 }}
                      className="shrink-0 font-semibold text-emerald-400"
                    >
                      {isLast ? "✓ READY" : "[ OK ]"}
                    </motion.span>
                  </motion.div>
                );
              })}
              <span className="inline-block h-3.5 w-1.5 animate-pulse bg-cyan-400/70" />
            </div>

            {/* segmented load bar */}
            <div className="flex w-full gap-1">
              {Array.from({ length: SEGMENTS }).map((_, i) => {
                const filled = i < Math.round((progress / 100) * SEGMENTS);
                return (
                  <div
                    key={i}
                    className={`h-1.5 flex-1 rounded-sm transition-colors duration-300 ${
                      filled
                        ? "bg-gradient-to-r from-indigo-400 via-cyan-400 to-pink-400 shadow-[0_0_6px_rgba(34,211,238,0.6)]"
                        : "bg-slate-800"
                    }`}
                  />
                );
              })}
            </div>
          </motion.div>

          <div className="pointer-events-none absolute bottom-10 left-1/2 -translate-x-1/2 text-center text-[9px] uppercase tracking-[0.3em] text-slate-600">
            build 2026.07 · next.js · three.js renderer
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}