"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import {
  GraduationCap, Sparkles, Calendar, Trophy, BrainCircuit,
  Code2, Rocket, BadgeCheck, School, BookOpen, Star,
  Zap, Globe, Atom, FlaskConical, Layers, Shield,
  Award, Cpu, Binary, Network, Database, CloudLightning,
  Smartphone, PanelTop, GitBranch, Infinity, Minus, Square, X,
  ChevronLeft, ChevronRight, ExternalLink, ZoomIn, ZoomOut, RotateCcw,
} from "lucide-react";

import { education, profile } from "@/data/portfolio";

// ─── DATA ─────────────────────────────────────────────────────────────────────

const highlights = [
  {
    icon: Rocket, planet: "🪐", title: "Innovation Focus", subtitle: "SECTOR ALPHA", color: "#22d3ee",
    description: "Architecting next-gen software systems with distributed, scalable design patterns and edge frameworks.",
  },
  {
    icon: Cpu, planet: "⭐", title: "Technical Mastery", subtitle: "SECTOR BETA", color: "#a78bfa",
    description: "Deep expertise across the full stack-frontend, backend, databases, and mobile development",
  },
  {
    icon: BadgeCheck, planet: "🌌", title: "Growth Mindset", subtitle: "SECTOR GAMMA", color: "#34d399",
    description: "Continuous evolution through research papers, open-source contributions, and collaborative engineering.",
  },
];

const courses = [
  { icon: Binary, name: "Data Structures & Algorithms", grade: "A", credits: 4, color: "#22d3ee" },
  { icon: Layers, name: "Software Project Management", grade: "A-", credits: 3, color: "#a78bfa" },
  { icon: PanelTop, name: "Software Process Modeling", grade: "A-", credits: 3, color: "#34d399" },
  { icon: Database, name: "Database Management Systems", grade: "A-", credits: 4, color: "#f59e0b" },
  { icon: Globe, name: "Internet & Web Technologies", grade: "A", credits: 4, color: "#f472b6" },
  { icon: Network, name: "Computer Networks", grade: "A", credits: 4, color: "#22d3ee" },
  { icon: Smartphone, name: "Mobile Application Development", grade: "B+", credits: 4, color: "#a78bfa" },
  { icon: Atom, name: "Information Systems & Data Modeling", grade: "A", credits: 4, color: "#34d399" },
  { icon: GitBranch, name: "Software Engineering", grade: "A", credits: 4, color: "#f472b6" },
  { icon: BookOpen, name: "Object Oriented Programming", grade: "A", credits: 4, color: "#a78bfa" },
  { icon: Network, name: "Distributed Systems", grade: "A-", credits: 4, color: "#7ef8a3ff" },
  { icon: Code2, name: "Software Archtecture", grade: "A-", credits: 4, color: "#77bdecff" },
];

const certificates = [
  {
    title: "Dean's List",
    issuer: "SLIIT",
    year: "2024",
    badge: "🏆",
    color: "#f59e0b",
    border: "from-amber-400 via-orange-500 to-yellow-400",
    glow: "#f59e0b",
    category: "Academic Excellence",
    verified: true,
    images: ["/images/dean/Dean.jpeg"],
  },
  {
    title: "MongoDB Associate Atlas Administrator",
    issuer: "MongoDB University",
    year: "2025",
    badge: "🗄️",
    color: "#22d3ee",
    border: "from-cyan-400 via-blue-500 to-indigo-400",
    glow: "#22d3ee",
    category: "Database",
    verified: true,
    images: [
      "/images/mongo/DB1.png",
      "/images/mongo/DB2.png",
      "/images/mongo/DB3.png",
      "/images/mongo/DB4.png",
      "/images/mongo/DB5.png",
      "/images/mongo/DB6.png",
      "/images/mongo/DB7.png",
      "/images/mongo/DB8.png",
      "/images/mongo/DB9.png",
      "/images/mongo/DB10.png",
    ],
  },
  // {
  //   title: "Postman Student Expert",
  //   issuer: "Postman",
  //   year: "2026",
  //   badge: "🚀",
  //   color: "#34d399",
  //   border: "from-emerald-400 via-teal-500 to-green-400",
  //   glow: "#34d399",
  //   category: "API Testing",
  //   verified: true,
  //   images: ["/images/postman-expert.jpg"],
  // },
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * Math.max(0, Math.min(1, t));
}

function hash(x: number, y: number) {
  const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return n - Math.floor(n);
}

function smoothNoise(x: number, y: number) {
  const ix = Math.floor(x), iy = Math.floor(y);
  const fx = x - ix, fy = y - iy;
  const ux = fx * fx * (3 - 2 * fx), uy = fy * fy * (3 - 2 * fy);
  return (
    hash(ix, iy) * (1 - ux) * (1 - uy) +
    hash(ix + 1, iy) * ux * (1 - uy) +
    hash(ix, iy + 1) * (1 - ux) * uy +
    hash(ix + 1, iy + 1) * ux * uy
  );
}

function fbm(x: number, y: number, oct: number) {
  let v = 0, a = 0.5, s = 0;
  for (let i = 0; i < oct; i++) {
    v += smoothNoise(x, y) * a; s += a; x *= 2.1; y *= 2.1; a *= 0.5;
  }
  return v / s;
}

function makeTex(size: number, fn: (ctx: CanvasRenderingContext2D, S: number) => void) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d")!;
  fn(ctx, size);
  return new THREE.CanvasTexture(c);
}

// ─── CERTIFICATE MODAL ────────────────────────────────────────────────────────

function CertModal({ cert, onClose }: { cert: typeof certificates[0]; onClose: () => void }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [dragging, setDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imgOffset, setImgOffset] = useState({ x: 0, y: 0 });
  const imgRef = useRef<HTMLDivElement>(null);
  const total = cert.images.length;

  // Close on Escape
  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") setActiveIdx(i => Math.min(i + 1, total - 1));
      if (e.key === "ArrowLeft") setActiveIdx(i => Math.max(i - 1, 0));
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [onClose, total]);

  // Reset pan when switching images
  useEffect(() => { setImgOffset({ x: 0, y: 0 }); setZoom(1); }, [activeIdx]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom <= 1) return;
    setDragging(true);
    setDragStart({ x: e.clientX - imgOffset.x, y: e.clientY - imgOffset.y });
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging) return;
    setImgOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };
  const handleMouseUp = () => setDragging(false);

  const prev = () => setActiveIdx(i => Math.max(i - 1, 0));
  const next = () => setActiveIdx(i => Math.min(i + 1, total - 1));
  const zoomIn = () => setZoom(z => Math.min(z + 0.4, 3));
  const zoomOut = () => { setZoom(z => Math.max(z - 0.4, 1)); setImgOffset({ x: 0, y: 0 }); };
  const reset = () => { setZoom(1); setImgOffset({ x: 0, y: 0 }); };

  return (
    <div
      className="absolute inset-0 z-[9999] flex items-center justify-center overflow-auto p-4"
      style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(16px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} className="absolute rounded-full opacity-20 animate-pulse"
            style={{
              width: Math.random() * 4 + 1,
              height: Math.random() * 4 + 1,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: cert.color,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
            }} />
        ))}
      </div>

      {/* Modal panel */}
      <div
        className="relative flex flex-col rounded-[28px] overflow-hidden shadow-2xl"
        style={{
          width: "min(92%, 1100px)",
          maxHeight: "92%",
          flexShrink: 0,
          background: "linear-gradient(145deg, #07101f 0%, #050c1a 60%, #020810 100%)",
          border: `1px solid ${cert.color}33`,
          boxShadow: `0 0 80px ${cert.color}22, 0 40px 80px rgba(0,0,0,0.8)`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top accent line */}
        <div className="absolute top-0 left-0 right-0 h-[2px]"
          style={{ background: `linear-gradient(90deg, transparent, ${cert.color}, transparent)` }} />

        {/* ── Header ── */}
        <div className="flex items-center gap-4 px-6 py-4 border-b"
          style={{ borderColor: `${cert.color}18`, background: `${cert.color}08` }}>
          {/* Badge */}
          <div className="flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center text-2xl relative"
            style={{ background: `linear-gradient(135deg, ${cert.color}22, ${cert.color}11)`, border: `1px solid ${cert.color}44` }}>
            <div className="absolute inset-0 rounded-2xl animate-pulse opacity-30"
              style={{ background: cert.color, filter: "blur(8px)" }} />
            <span className="relative z-10">{cert.badge}</span>
          </div>
          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[9px] tracking-[.3em] uppercase font-bold" style={{ color: cert.color }}>
                {cert.category}
              </span>
              {cert.verified && (
                <span className="flex items-center gap-1 text-[9px] font-semibold px-2 py-0.5 rounded-full"
                  style={{ background: cert.color + "22", color: cert.color, border: `1px solid ${cert.color}44` }}>
                  <BadgeCheck size={9} /> Verified
                </span>
              )}
              {total > 1 && (
                <span className="text-[9px] px-2 py-0.5 rounded-full font-semibold"
                  style={{ background: "rgba(255,255,255,0.06)", color: "#94a3b8" }}>
                  {total} certificates
                </span>
              )}
            </div>
            <h2 className="text-lg font-black text-white mt-0.5 truncate">{cert.title}</h2>
            <p className="text-sm text-slate-400">{cert.issuer} · {cert.year}</p>
          </div>
          {/* Close */}
          <button onClick={onClose}
            className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-90"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
            <X size={16} className="text-slate-400" />
          </button>
        </div>

        {/* ── Thumbnail strip (only if multiple) ── */}
        {total > 1 && (
          <div className="flex gap-3 px-6 py-3 border-b overflow-x-auto"
            style={{ borderColor: `${cert.color}12`, background: "rgba(0,0,0,0.3)", scrollbarWidth: "none" }}>
            {cert.images.map((img, i) => (
              <button key={i} onClick={() => setActiveIdx(i)}
                className="flex-shrink-0 relative rounded-xl overflow-hidden transition-all duration-300"
                style={{
                  width: 80, height: 56,
                  border: i === activeIdx ? `2px solid ${cert.color}` : "2px solid rgba(255,255,255,0.08)",
                  boxShadow: i === activeIdx ? `0 0 12px ${cert.color}66` : "none",
                  transform: i === activeIdx ? "scale(1.05)" : "scale(1)",
                }}>
                <img src={img} alt={`Certificate ${i + 1}`}
                  className="w-full h-full object-cover"
                  style={{ filter: i === activeIdx ? "none" : "brightness(0.5) grayscale(0.3)" }} />
                <div className="absolute bottom-1 right-1 text-[8px] font-bold px-1 rounded"
                  style={{ background: i === activeIdx ? cert.color : "rgba(0,0,0,0.6)", color: i === activeIdx ? "#000" : "#fff" }}>
                  {i + 1}
                </div>
              </button>
            ))}
          </div>
        )}

        {/* ── Main image viewer ── */}
        <div className="relative flex-1 overflow-hidden bg-[#020810] flex items-center justify-center"
          style={{ minHeight: 360, cursor: zoom > 1 ? (dragging ? "grabbing" : "grab") : "default" }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Subtle grid background */}
          <div className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `linear-gradient(${cert.color} 1px, transparent 1px), linear-gradient(90deg, ${cert.color} 1px, transparent 1px)`,
              backgroundSize: "40px 40px",
            }} />

          {/* Corner accents */}
          {[["top-3 left-3 border-t border-l", ""], ["top-3 right-3 border-t border-r", ""], ["bottom-3 left-3 border-b border-l", ""], ["bottom-3 right-3 border-b border-r", ""]].map(([cls], i) => (
            <div key={i} className={`absolute w-6 h-6 ${cls}`}
              style={{ borderColor: `${cert.color}44`, borderRadius: 2 }} />
          ))}

          {/* Image */}
          <div ref={imgRef} className="relative select-none transition-transform duration-200"
            style={{
              transform: `scale(${zoom}) translate(${imgOffset.x / zoom}px, ${imgOffset.y / zoom}px)`,
              transformOrigin: "center",
            }}>
            <img
              src={cert.images[activeIdx]}
              alt={cert.title}
              draggable={false}
              className="max-w-full rounded-xl shadow-2xl"
              style={{
                maxHeight: "55vh",
                boxShadow: `0 0 40px ${cert.color}33, 0 20px 40px rgba(0,0,0,0.6)`,
                border: `1px solid ${cert.color}22`,
              }}
            />
          </div>

          {/* Prev / Next arrows */}
          {total > 1 && (
            <>
              <button onClick={prev} disabled={activeIdx === 0}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-90 disabled:opacity-20 disabled:cursor-not-allowed"
                style={{ background: `${cert.color}22`, border: `1px solid ${cert.color}44`, backdropFilter: "blur(8px)" }}>
                <ChevronLeft size={20} style={{ color: cert.color }} />
              </button>
              <button onClick={next} disabled={activeIdx === total - 1}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-90 disabled:opacity-20 disabled:cursor-not-allowed"
                style={{ background: `${cert.color}22`, border: `1px solid ${cert.color}44`, backdropFilter: "blur(8px)" }}>
                <ChevronRight size={20} style={{ color: cert.color }} />
              </button>
            </>
          )}

          {/* Page indicator */}
          {total > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {cert.images.map((_, i) => (
                <button key={i} onClick={() => setActiveIdx(i)}
                  className="rounded-full transition-all duration-300"
                  style={{
                    width: i === activeIdx ? 20 : 6,
                    height: 6,
                    background: i === activeIdx ? cert.color : `${cert.color}44`,
                    boxShadow: i === activeIdx ? `0 0 8px ${cert.color}` : "none",
                  }} />
              ))}
            </div>
          )}
        </div>

        {/* ── Footer toolbar ── */}
        <div className="flex items-center justify-between px-6 py-3 border-t"
          style={{ borderColor: `${cert.color}18`, background: `${cert.color}06` }}>
          {/* Zoom controls */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-500 uppercase tracking-widest mr-1">Zoom</span>
            <button onClick={zoomOut}
              className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:scale-110 active:scale-90 disabled:opacity-30"
              disabled={zoom <= 1}
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
              <ZoomOut size={13} className="text-slate-300" />
            </button>
            <span className="text-xs font-mono text-slate-400 w-10 text-center">{Math.round(zoom * 100)}%</span>
            <button onClick={zoomIn}
              className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:scale-110 active:scale-90 disabled:opacity-30"
              disabled={zoom >= 3}
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
              <ZoomIn size={13} className="text-slate-300" />
            </button>
            <button onClick={reset}
              className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:scale-110 active:scale-90 ml-1"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
              <RotateCcw size={12} className="text-slate-400" />
            </button>
          </div>

          {/* Right: counter + open */}
          <div className="flex items-center gap-3">
            {total > 1 && (
              <span className="text-xs text-slate-500 font-mono">
                {activeIdx + 1} / {total}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── SCROLL REVEAL ANIMATION ──────────────────────────────────────────────────

function ScrollReveal({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) { setIsVisible(true); observer.unobserve(entry.target); }
      },
      { threshold: 0.05 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={className}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(30px)",
        transition: `opacity 0.8s cubic-bezier(0.16,1,0.3,1), transform 0.8s cubic-bezier(0.16,1,0.3,1)`,
        transitionDelay: `${delay}ms`,
        willChange: "transform, opacity",
      }}>
      {children}
    </div>
  );
}

// ─── AURORA CANVAS ────────────────────────────────────────────────────────────

// Draws a craggy, highly realistic 3D stone/rock
function drawRock(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number,
  radius: number, sides: number,
  angle: number, color: string, alpha: number
) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(cx, cy);
  ctx.rotate(angle);

  // Generate highly craggy, irregular rock vertices using multi-layered noise (fractal)
  const vertices: { x: number; y: number }[] = [];
  for (let k = 0; k < sides; k++) {
    const a = (Math.PI * 2 / sides) * k;
    // Base shape + primary cragginess + micro-roughness
    const primaryCrag = hash(k * 13.3 + radius, sides) * 0.22;
    const microRough = hash(k * 37.7 - radius, sides + 5) * 0.08;
    const r = radius * (0.72 + primaryCrag + microRough);
    vertices.push({ x: Math.cos(a) * r, y: Math.sin(a) * r });
  }

  // 1. Drop shadow for depth (rock floating in space)
  ctx.shadowColor = "rgba(0, 0, 0, 0.75)";
  ctx.shadowBlur = radius * 0.55;
  ctx.shadowOffsetX = radius * 0.2;
  ctx.shadowOffsetY = radius * 0.25;

  // 2. Base path & Base rock gradient (stone grey/slate tones)
  ctx.beginPath();
  ctx.moveTo(vertices[0].x, vertices[0].y);
  for (let k = 1; k < sides; k++) {
    ctx.lineTo(vertices[k].x, vertices[k].y);
  }
  ctx.closePath();

  // Create a rock-like directional color gradient
  const grad = ctx.createLinearGradient(-radius * 0.5, -radius * 0.5, radius * 0.5, radius * 0.5);
  grad.addColorStop(0, "#4b5563"); // medium grey (lit side)
  grad.addColorStop(0.5, "#374151"); // dark grey
  grad.addColorStop(1, "#1f2937"); // deep charcoal (shadow side)
  ctx.fillStyle = grad;
  ctx.fill();

  // Reset shadow so inner details don't blur out
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;

  // 3. Faceted 3D shading (rock faces)
  const lightDir = { x: -0.8, y: -0.6 }; // light from top-left
  for (let k = 0; k < sides; k++) {
    const p1 = vertices[k];
    const p2 = vertices[(k + 1) % sides];

    // Face normal
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    const nx = -dy / len;
    const ny = dx / len;

    const dot = nx * lightDir.x + ny * lightDir.y;

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.closePath();

    if (dot > 0.15) {
      // Lit facet (highly reflective slate reflection)
      ctx.fillStyle = `rgba(209, 213, 219, ${0.12 + dot * 0.25})`; // light grey overlay
    } else {
      // Dark/occluded facet
      ctx.fillStyle = `rgba(17, 24, 39, ${0.35 + Math.abs(dot) * 0.4})`; // dark charcoal overlay
    }
    ctx.fill();
  }

  // 4. Fine rock grain & speckle texture (adds real gritty feeling)
  const specklesCount = Math.floor(radius * radius * 0.35);
  for (let s = 0; s < specklesCount; s++) {
    const seed = s * 7.9 + radius;
    // Random position inside the bounding circle
    const sa = hash(seed, 23) * Math.PI * 2;
    const sd = hash(seed + 1.2, 29) * radius * 0.85;
    const sx = Math.cos(sa) * sd;
    const sy = Math.sin(sa) * sd;

    // Make sure speckle is inside the polygon
    // (A simple bounding check: sd should be smaller than radius * 0.72)
    if (sd < radius * 0.65) {
      ctx.beginPath();
      ctx.arc(sx, sy, 0.4 + hash(seed * 2, 5) * 0.7, 0, Math.PI * 2);
      // Half light-speckles, half dark-speckles
      ctx.fillStyle = hash(seed + 3.1, 7) > 0.5 ? "rgba(255, 255, 255, 0.15)" : "rgba(0, 0, 0, 0.45)";
      ctx.fill();
    }
  }

  // 5. Rocky ridges and deep crack lines
  const crackCount = 3 + Math.floor(hash(radius, 5) * 3);
  for (let i = 0; i < crackCount; i++) {
    const seed = i * 41.7 + radius;
    const startIdx = Math.floor(hash(seed, 11) * sides);
    const endIdx = Math.floor(hash(seed + 13, 17) * sides);
    if (startIdx === endIdx) continue;

    const p1 = vertices[startIdx];
    const p2 = vertices[endIdx];

    ctx.beginPath();
    ctx.moveTo(p1.x * 0.25, p1.y * 0.25);
    // Draw a jagged/crooked line for natural cracks
    const midX = (p1.x + p2.x) * 0.4 + (hash(seed * 1.5, 9) - 0.5) * radius * 0.22;
    const midY = (p1.y + p2.y) * 0.4 + (hash(seed * 2.5, 7) - 0.5) * radius * 0.22;
    ctx.lineTo(midX, midY);
    ctx.lineTo(p2.x * 0.75, p2.y * 0.75);

    // Dark crevice line
    ctx.strokeStyle = "rgba(10, 15, 30, 0.75)";
    ctx.lineWidth = 1.0;
    ctx.stroke();

    // Secondary highlighted ridge right next to it to give it 3D relief
    ctx.beginPath();
    ctx.moveTo(p1.x * 0.25 - 0.5, p1.y * 0.25 - 0.5);
    ctx.lineTo(midX - 0.5, midY - 0.5);
    ctx.lineTo(p2.x * 0.75 - 0.5, p2.y * 0.75 - 0.5);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.18)";
    ctx.lineWidth = 0.6;
    ctx.stroke();
  }

  // 6. Draw outer sharp rock outline with light direction highlight
  for (let k = 0; k < sides; k++) {
    const p1 = vertices[k];
    const p2 = vertices[(k + 1) % sides];

    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    const nx = -dy / len;
    const ny = dx / len;

    const dot = nx * lightDir.x + ny * lightDir.y;

    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);

    if (dot > 0.2) {
      // Top-left outer edges get a bright rock highlight
      ctx.strokeStyle = `rgba(243, 244, 246, ${0.4 + dot * 0.4})`;
      ctx.lineWidth = 1.6;
    } else {
      // Shadow outer edges get a dark rim
      ctx.strokeStyle = `rgba(31, 41, 55, ${0.4 + Math.abs(dot) * 0.3})`;
      ctx.lineWidth = 1.0;
    }
    ctx.stroke();
  }

  // 7. Subtle atmospheric rim glow reflecting the cosmic environment (cyan/purple/magenta)
  ctx.beginPath();
  ctx.moveTo(vertices[0].x, vertices[0].y);
  for (let k = 1; k < sides; k++) {
    ctx.lineTo(vertices[k].x, vertices[k].y);
  }
  ctx.closePath();
  ctx.strokeStyle = color + "26"; // Very soft ambient rim reflections
  ctx.lineWidth = 2.0;
  ctx.stroke();

  ctx.restore();
}

function AuroraCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scrollYRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    let animId: number;

    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    // Track scroll of the scrollable parent (closest overflow-y-auto)
    const scrollEl = canvas.closest(".overflow-y-auto") as HTMLElement | null;
    const onScroll = () => { scrollYRef.current = scrollEl ? scrollEl.scrollTop : window.scrollY; };
    (scrollEl ?? window).addEventListener("scroll", onScroll, { passive: true });

    // Background stars (small, dim)
    const stars = Array.from({ length: 140 }, () => ({
      x: Math.random(), y: Math.random(),
      r: Math.random() * 1.2 + 0.2,
      a: Math.random() * 0.7 + 0.2,
      sp: Math.random() * 0.003 + 0.0008,
      c: ["#fff", "#22d3ee", "#a78bfa", "#f472b6"][Math.floor(Math.random() * 4)],
    }));

    // Floating rock asteroids — varied sizes, speeds, colours, layer depths
    const rocks = Array.from({ length: 22 }, (_, i) => ({
      x: Math.random(),          // normalised 0-1
      y: Math.random(),
      r: 6 + Math.random() * 28, // radius px
      sides: 7 + Math.floor(Math.random() * 5),
      rot: Math.random() * Math.PI * 2,
      rotSpd: (Math.random() - 0.5) * 0.0025,
      vx: (Math.random() - 0.5) * 0.00088,  // drift speed (normalised/frame)
      vy: (Math.random() - 0.35) * 0.00012,
      depth: 0.3 + Math.random() * 0.7,     // parallax depth (0=fixed,1=full)
      c: ["#22d3ee", "#a78bfa", "#34d399", "#f472b6", "#f59e0b", "#60a5fa"][
        Math.floor(Math.random() * 6)],
      alpha: 0.12 + Math.random() * 0.25,
      seed: i,
    }));

    const auroras = [
      { x: 0.2, y: 0.15, ry: 90, rx: 400, c: "rgba(34,211,238,0.045)", sp: 0.0004, off: 0 },
      { x: 0.7, y: 0.1, ry: 70, rx: 350, c: "rgba(167,139,250,0.05)", sp: 0.0006, off: 1 },
      { x: 0.5, y: 0.6, ry: 80, rx: 500, c: "rgba(244,114,182,0.035)", sp: 0.0003, off: 2 },
      { x: 0.1, y: 0.75, ry: 60, rx: 320, c: "rgba(52,211,153,0.04)", sp: 0.0005, off: 0.5 },
      { x: 0.85, y: 0.5, ry: 75, rx: 370, c: "rgba(251,191,36,0.035)", sp: 0.0007, off: 1.5 },
    ];

    let t = 0;

    const draw = () => {
      const W = canvas.width, H = canvas.height;
      const scrollY = scrollYRef.current;
      ctx.clearRect(0, 0, W, H);

      // ── Aurora glows ──
      auroras.forEach(a => {
        const cx = (a.x + Math.sin(t * a.sp + a.off) * 0.06) * W;
        const cy = (a.y + Math.cos(t * a.sp * 0.7 + a.off) * 0.04) * H;
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(a.rx, a.ry));
        grad.addColorStop(0, a.c);
        grad.addColorStop(0.5, a.c.replace(/[\d.]+\)$/, "0.02)"));
        grad.addColorStop(1, "transparent");
        ctx.save(); ctx.scale(1, a.ry / a.rx);
        ctx.fillStyle = grad; ctx.fillRect(0, 0, W, H * (a.rx / a.ry));
        ctx.restore();
      });

      // ── Background stars ──
      stars.forEach(s => {
        const px = ((s.x + t * s.sp * 0.01) % 1) * W;
        // subtle parallax: slower stars shift less
        const py = ((s.y + t * s.sp * 0.005) % 1) * H - scrollY * s.sp * 0.18;
        const pulse = 0.35 + 0.65 * Math.abs(Math.sin(t * s.sp * 35));
        ctx.beginPath(); ctx.arc(px, ((py % H) + H) % H, s.r, 0, Math.PI * 2);
        ctx.fillStyle = s.c; ctx.globalAlpha = s.a * pulse; ctx.fill(); ctx.globalAlpha = 1;
      });

      // ── Floating rocks with scroll parallax ──
      rocks.forEach(rock => {
        // drift position
        rock.x = ((rock.x + rock.vx) % 1 + 1) % 1;
        rock.y = ((rock.y + rock.vy) % 1 + 1) % 1;
        rock.rot += rock.rotSpd;

        // parallax: deeper rocks shift more with scroll
        const px = rock.x * W;
        const py = rock.y * H - scrollY * rock.depth * 0.22;
        const screenY = ((py % (H + rock.r * 2)) + H + rock.r * 2) % (H + rock.r * 2) - rock.r;

        // pulse glow
        const glowPulse = 0.7 + 0.3 * Math.sin(t * 0.018 + rock.seed);
        drawRock(ctx, px, screenY, rock.r, rock.sides, rock.rot, rock.c, rock.alpha * glowPulse);

        // glow halo around larger rocks
        if (rock.r > 16) {
          ctx.save();
          ctx.globalAlpha = 0.06 * glowPulse;
          const halo = ctx.createRadialGradient(px, screenY, rock.r * 0.4, px, screenY, rock.r * 2.5);
          halo.addColorStop(0, rock.c);
          halo.addColorStop(1, "transparent");
          ctx.fillStyle = halo;
          ctx.beginPath();
          ctx.arc(px, screenY, rock.r * 2.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      });

      // ── Hex grid overlay ──
      ctx.globalAlpha = 0.018; ctx.strokeStyle = "#22d3ee"; ctx.lineWidth = 0.5;
      const hex = 70;
      for (let hx = -hex; hx < W + hex; hx += hex * 1.5) {
        for (let hy = -hex; hy < H + hex; hy += hex * Math.sqrt(3)) {
          const ox = (Math.floor(hy / hex / Math.sqrt(3)) % 2) * hex * 0.75;
          ctx.beginPath();
          for (let k = 0; k < 6; k++) {
            const ang = (Math.PI / 3) * k;
            const px2 = hx + ox + hex * 0.45 * Math.cos(ang);
            const py2 = hy + hex * 0.45 * Math.sin(ang);
            k === 0 ? ctx.moveTo(px2, py2) : ctx.lineTo(px2, py2);
          }
          ctx.closePath(); ctx.stroke();
        }
      }
      ctx.globalAlpha = 1;
      t++;
      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
      (scrollEl ?? window).removeEventListener("scroll", onScroll);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" style={{ pointerEvents: "none" }} />;
}

// ─── THREE.JS 3D PLANET ───────────────────────────────────────────────────────

function Planet3D() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current!;
    let frameId: number;
    let cleanupFn: (() => void) | null = null;

    // ── Defer heavy scene setup so the app shell paints immediately ──
    const timerId = setTimeout(() => {
      const W = mount.clientWidth, H = mount.clientHeight;

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(W, H);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.1;
      mount.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 200);
      camera.position.set(0, 0.1, 4.2);

      scene.add(new THREE.AmbientLight(0x223355, 2.8));
      const sun = new THREE.DirectionalLight(0xffe4a0, 3.0);
      sun.position.set(-4, 2, 4); scene.add(sun);
      const rim = new THREE.DirectionalLight(0x3388ff, 1.8);
      rim.position.set(4, -1, -3); scene.add(rim);
      const darkSide = new THREE.DirectionalLight(0x1a3a6a, 1.4);
      darkSide.position.set(5, 0, -5); scene.add(darkSide);
      const fill = new THREE.PointLight(0x44aaff, 1.2, 20);
      fill.position.set(2, 3, -4); scene.add(fill);
      const top = new THREE.DirectionalLight(0x004466, 0.9);
      top.position.set(0, 6, 0); scene.add(top);

      // Async generator to prevent UI freeze
      const genTexAsync = (size: number, renderChunk: (startY: number, endY: number, S: number, d: Uint8ClampedArray) => void, postProcess?: (ctx: CanvasRenderingContext2D, S: number) => void): Promise<THREE.CanvasTexture> => {
        return new Promise(resolve => {
          const c = document.createElement("canvas");
          c.width = c.height = size;
          const ctx = c.getContext("2d")!;
          const img = ctx.createImageData(size, size);
          const d = img.data;
          let py = 0;
          const CHUNK = 16;
          const next = () => {
            const endY = Math.min(py + CHUNK, size);
            renderChunk(py, endY, size, d);
            py = endY;
            if (py < size) {
              requestAnimationFrame(next);
            } else {
              ctx.putImageData(img, 0, 0);
              if (postProcess) postProcess(ctx, size);
              resolve(new THREE.CanvasTexture(c));
            }
          };
          requestAnimationFrame(next);
        });
      };

      const planetMat = new THREE.MeshPhongMaterial({ color: 0x225588, specular: new THREE.Color(0x55aadd), shininess: 55, emissive: new THREE.Color(0x030d1a), emissiveIntensity: 0.22 });
      const planet = new THREE.Mesh(new THREE.SphereGeometry(1, 128, 128), planetMat);
      scene.add(planet);

      const cloudsMat = new THREE.MeshPhongMaterial({ color: 0xffffff, transparent: true, opacity: 0.1, depthWrite: false });
      const clouds = new THREE.Mesh(new THREE.SphereGeometry(1.013, 128, 128), cloudsMat);
      scene.add(clouds);
      
      const moonMat = new THREE.MeshPhongMaterial({ color: 0x888888, shininess: 4 });

      genTexAsync(512, (startY, endY, S, d) => {
        for (let py = startY; py < endY; py++) {
          for (let px = 0; px < S; px++) {
            const u = px / S, v = py / S;
            const lon = (u - 0.5) * 6.2832, lat = (v - 0.5) * 3.1416;
            const sx = Math.cos(lat) * Math.cos(lon); const sy = Math.sin(lat); const sz = Math.cos(lat) * Math.sin(lon);
            const elev = fbm(sx * 2.8 + 2, sy * 2.8 + 3, 8) + fbm(sx * 5 + 7, sz * 5 + 9, 5) * 0.25;
            const absLat = Math.abs(v - 0.5) * 2;
            const tropical = Math.max(0, 1 - absLat / 0.35);
            const temperate = Math.max(0, 1 - Math.abs(absLat - 0.45) / 0.2);
            const polar = Math.max(0, (absLat - 0.78) / 0.12);
            const moist = fbm(sx * 1.5 + 11, sz * 1.5 + 13, 4);
            let r = 0, g = 0, b = 0;
            if (polar > 0) { const t = Math.min(1, polar * 2); r = Math.round(lerp(140, 200, t)); g = Math.round(lerp(185, 225, t)); b = Math.round(lerp(210, 245, t)); }
            else if (elev > 0.62) { const snowT = Math.max(0, (elev - 0.66) / 0.06) * Math.max(0, 1 - tropical * 1.5); r = Math.round(lerp(60, 190, snowT)); g = Math.round(lerp(75, 205, snowT)); b = Math.round(lerp(90, 220, snowT)); }
            else if (elev > 0.54) { const t = (elev - 0.54) / 0.08; r = Math.round(lerp(55, 80, t)); g = Math.round(lerp(100, 130, t)); b = Math.round(lerp(45, 65, t)); }
            else if (elev > 0.48) {
              const t = (elev - 0.48) / 0.06;
              if (tropical > 0.5 && moist > 0.52) { r = Math.round(lerp(10, 22, t)); g = Math.round(lerp(120, 160, t)); b = Math.round(lerp(25, 40, t)); }
              else if (tropical > 0.4 && moist < 0.46) { r = Math.round(lerp(110, 150, t)); g = Math.round(lerp(160, 185, t)); b = Math.round(lerp(30, 50, t)); }
              else if (tropical > 0.3 && moist < 0.40) { r = Math.round(lerp(80, 115, t)); g = Math.round(lerp(130, 155, t)); b = Math.round(lerp(80, 100, t)); }
              else if (temperate > 0.3 && moist > 0.5) { r = Math.round(lerp(15, 35, t)); g = Math.round(lerp(90, 125, t)); b = Math.round(lerp(20, 35, t)); }
              else if (temperate > 0.2) { r = Math.round(lerp(70, 110, t)); g = Math.round(lerp(140, 170, t)); b = Math.round(lerp(30, 50, t)); }
              else { r = Math.round(lerp(55, 80, t)); g = Math.round(lerp(110, 135, t)); b = Math.round(lerp(90, 110, t)); }
            }
            else if (elev > 0.455) { const t = (elev - 0.455) / 0.025; r = Math.round(lerp(8, 40, t)); g = Math.round(lerp(110, 155, t)); b = Math.round(lerp(90, 70, t)); }
            else if (elev > 0.42) { const t = (elev - 0.42) / 0.035; r = Math.round(lerp(5, 15, t)); g = Math.round(lerp(120, 170, t)); b = Math.round(lerp(160, 195, t)); }
            else if (elev > 0.35) { const t = (elev - 0.35) / 0.07; r = Math.round(lerp(5, 10, t)); g = Math.round(lerp(60, 120, t)); b = Math.round(lerp(130, 175, t)); }
            else { const t = elev / 0.35; r = Math.round(lerp(2, 8, t)); g = Math.round(lerp(20, 60, t)); b = Math.round(lerp(70, 130, t)); }
            const idx = (py * S + px) * 4;
            d[idx] = r; d[idx + 1] = g; d[idx + 2] = b; d[idx + 3] = 255;
          }
        }
      }, (ctx, S) => {
        for (let i = 0; i < 18; i++) {
          const cx = Math.random() * S, cy = S * 0.12 + Math.random() * S * 0.76;
          const sz = 10 + Math.random() * 18;
          const gr = ctx.createRadialGradient(cx, cy, 0, cx, cy, sz);
          gr.addColorStop(0, "rgba(180,220,255,0.18)"); gr.addColorStop(1, "rgba(80,160,255,0)");
          ctx.fillStyle = gr; ctx.fillRect(0, 0, S, S);
        }
      }).then(tex => { planetMat.map = tex; planetMat.color.setHex(0xffffff); planetMat.needsUpdate = true; });

      genTexAsync(256, (startY, endY, S, d) => {
        for (let py = startY; py < endY; py++) {
          for (let px = 0; px < S; px++) {
            const u = px / S, v = py / S;
            const lon = (u - 0.5) * 6.2832, lat = (v - 0.5) * 3.1416;
            const sx = Math.cos(lat) * Math.cos(lon); const sy = Math.sin(lat); const sz = Math.cos(lat) * Math.sin(lon);
            const h = fbm(sx * 2.8 + 2, sy * 2.8 + 3, 6) + fbm(sx * 5 + 7, sz * 5 + 9, 4) * 0.25;
            const val = h < 0.46 ? 220 : 0;
            const i = (py * S + px) * 4; d[i] = val; d[i + 1] = val; d[i + 2] = val; d[i + 3] = 255;
          }
        }
      }).then(tex => { planetMat.specularMap = tex; planetMat.needsUpdate = true; });

      genTexAsync(512, (startY, endY, S, d) => {
        for (let py = startY; py < endY; py++) {
          for (let px = 0; px < S; px++) {
            const u = px / S, v = py / S;
            const lon = (u - 0.5) * 6.2832, lat = (v - 0.5) * 3.1416;
            const cx = Math.cos(lat) * Math.cos(lon) * 1.8; const cy = Math.sin(lat) * 1.8 + 1.2; const cz = Math.cos(lat) * Math.sin(lon) * 1.8;
            const n = fbm(cx + 10, cy, 6) * fbm(cz + 10, cy * 0.8, 5);
            const cloud = Math.max(0, (n - 0.26) / 0.18);
            const alpha = Math.round(Math.min(1, cloud * 1.6) * 160);
            const i = (py * S + px) * 4; d[i] = 255; d[i + 1] = 255; d[i + 2] = 255; d[i + 3] = alpha;
          }
        }
      }).then(tex => { cloudsMat.map = tex; cloudsMat.color.setHex(0xffffff); cloudsMat.opacity = 0.72; cloudsMat.needsUpdate = true; });

      genTexAsync(128, (startY, endY, S, d) => {
        for (let py = startY; py < endY; py++) {
          for (let px = 0; px < S; px++) {
            const n = fbm(px / S * 4, py / S * 4, 5);
            const val = Math.round(lerp(85, 165, n));
            const i = (py * S + px) * 4; d[i] = val; d[i + 1] = val - 4; d[i + 2] = val - 8; d[i + 3] = 255;
          }
        }
      }, (ctx, S) => {
        for (let k = 0; k < 12; k++) {
          const cx = Math.random() * S, cy = Math.random() * S, r = 5 + Math.random() * 16;
          const gr = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
          gr.addColorStop(0, "rgba(45,45,50,0.65)"); gr.addColorStop(1, "rgba(80,80,85,0)");
          ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
        }
      }).then(tex => { moonMat.map = tex; moonMat.color.setHex(0xffffff); moonMat.needsUpdate = true; });

      const atmMat = new THREE.ShaderMaterial({
        uniforms: { c: { value: new THREE.Color(0x00eeff) } },
        vertexShader: `varying vec3 vN,vV; void main(){vN=normalize(normalMatrix*normal);vec4 mv=modelViewMatrix*vec4(position,1.0);vV=normalize(-mv.xyz);gl_Position=projectionMatrix*mv;}`,
        fragmentShader: `uniform vec3 c;varying vec3 vN,vV;void main(){float rim=1.0-abs(dot(vN,vV));gl_FragColor=vec4(c,pow(rim,2.8)*1.3);}`,
        side: THREE.FrontSide, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false,
      });
      scene.add(new THREE.Mesh(new THREE.SphereGeometry(1.08, 64, 64), atmMat));

      const haloMat = new THREE.ShaderMaterial({
        uniforms: { c: { value: new THREE.Color(0x1100cc) } },
        vertexShader: `varying vec3 vN,vV; void main(){vN=normalize(normalMatrix*normal);vec4 mv=modelViewMatrix*vec4(position,1.0);vV=normalize(-mv.xyz);gl_Position=projectionMatrix*mv;}`,
        fragmentShader: `uniform vec3 c;varying vec3 vN,vV;void main(){float rim=1.0-abs(dot(vN,vV));gl_FragColor=vec4(c,pow(rim,5.0)*0.85);}`,
        side: THREE.FrontSide, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false,
      });
      scene.add(new THREE.Mesh(new THREE.SphereGeometry(1.22, 32, 32), haloMat));

      const ring1 = new THREE.Mesh(new THREE.TorusGeometry(1.68, 0.014, 4, 200), new THREE.MeshBasicMaterial({ color: 0x44aaff, transparent: true, opacity: 0.28 }));
      ring1.rotation.x = Math.PI * 0.40; ring1.rotation.z = Math.PI * 0.05; scene.add(ring1);
      const ring2 = new THREE.Mesh(new THREE.TorusGeometry(1.92, 0.008, 4, 200), new THREE.MeshBasicMaterial({ color: 0x00ddcc, transparent: true, opacity: 0.16 }));
      ring2.rotation.x = Math.PI * 0.38; ring2.rotation.z = -Math.PI * 0.04; scene.add(ring2);
      const ring3 = new THREE.Mesh(new THREE.TorusGeometry(2.12, 0.005, 4, 200), new THREE.MeshBasicMaterial({ color: 0x4466ff, transparent: true, opacity: 0.10 }));
      ring3.rotation.x = Math.PI * 0.39; ring3.rotation.z = Math.PI * 0.02; scene.add(ring3);

      const moon = new THREE.Mesh(new THREE.SphereGeometry(0.12, 32, 32), moonMat);
      scene.add(moon);



      const starCount = 3500;
      const sPos = new Float32Array(starCount * 3); const sCol = new Float32Array(starCount * 3);
      const starPalette: [number, number, number][] = [[1, 0.9, 0.7], [0.7, 0.85, 1], [1, 0.95, 0.95], [0.8, 1, 0.8], [1, 0.8, 0.6]];
      for (let i = 0; i < starCount; i++) {
        const th = Math.random() * Math.PI * 2; const ph = Math.acos(2 * Math.random() - 1); const r = 55 + Math.random() * 25;
        sPos[i * 3] = r * Math.sin(ph) * Math.cos(th); sPos[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th); sPos[i * 3 + 2] = r * Math.cos(ph);
        const sc = starPalette[Math.floor(Math.random() * starPalette.length)];
        sCol[i * 3] = sc[0]; sCol[i * 3 + 1] = sc[1]; sCol[i * 3 + 2] = sc[2];
      }
      const sg = new THREE.BufferGeometry();
      sg.setAttribute("position", new THREE.BufferAttribute(sPos, 3));
      sg.setAttribute("color", new THREE.BufferAttribute(sCol, 3));
      scene.add(new THREE.Points(sg, new THREE.PointsMaterial({ size: 0.09, sizeAttenuation: true, vertexColors: true, transparent: true, opacity: 0.88 })));

      const flare = new THREE.Sprite(new THREE.SpriteMaterial({
        map: new THREE.CanvasTexture((() => {
          const c = document.createElement("canvas"); c.width = c.height = 128;
          const ctx2 = c.getContext("2d")!;
          const gr = ctx2.createRadialGradient(64, 64, 0, 64, 64, 64);
          gr.addColorStop(0, "rgba(255,230,150,0.95)"); gr.addColorStop(0.3, "rgba(255,180,60,0.4)"); gr.addColorStop(1, "rgba(255,100,20,0)");
          ctx2.fillStyle = gr; ctx2.fillRect(0, 0, 128, 128); return c;
        })()),
        blending: THREE.AdditiveBlending, transparent: true, opacity: 0.5, depthWrite: false,
      }));
      flare.scale.set(1.2, 1.2, 1); flare.position.set(-3.5, 1.5, 3); scene.add(flare);

      let isDragging = false, prevX = 0, prevY = 0;
      let targetRotX = 0.12, targetRotY = 0, curRotX = 0.12, curRotY = 0;
      let zoom = 4.8;

      const el = renderer.domElement;
      const onDown = (e: MouseEvent) => { isDragging = true; prevX = e.clientX; prevY = e.clientY; };
      const onMove = (e: MouseEvent) => {
        if (!isDragging) return;
        targetRotY += (e.clientX - prevX) * 0.007; targetRotX += (e.clientY - prevY) * 0.007;
        targetRotX = Math.max(-1.1, Math.min(1.1, targetRotX)); prevX = e.clientX; prevY = e.clientY;
      };
      const onUp = () => { isDragging = false; };
      const onWheel = (e: WheelEvent) => { e.preventDefault(); zoom = Math.max(2.5, Math.min(7, zoom + e.deltaY * 0.006)); };
      const onTStart = (e: TouchEvent) => { isDragging = true; prevX = e.touches[0].clientX; prevY = e.touches[0].clientY; };
      const onTMove = (e: TouchEvent) => {
        if (!isDragging) return;
        targetRotY += (e.touches[0].clientX - prevX) * 0.007; targetRotX += (e.touches[0].clientY - prevY) * 0.007;
        prevX = e.touches[0].clientX; prevY = e.touches[0].clientY;
      };

      el.addEventListener("mousedown", onDown); window.addEventListener("mousemove", onMove); window.addEventListener("mouseup", onUp);
      el.addEventListener("wheel", onWheel, { passive: false }); el.addEventListener("touchstart", onTStart, { passive: true });
      window.addEventListener("touchmove", onTMove); window.addEventListener("touchend", onUp);

      let tAnim = 0;
      const animate = () => {
        frameId = requestAnimationFrame(animate); tAnim += 0.005;
        if (!isDragging) targetRotY += 0.0022;
        curRotX += (targetRotX - curRotX) * 0.07; curRotY += (targetRotY - curRotY) * 0.07;
        camera.position.z += (zoom - camera.position.z) * 0.07;
        planet.rotation.x = curRotX; planet.rotation.y = curRotY;
        clouds.rotation.x = curRotX; clouds.rotation.y = curRotY + tAnim * 0.014;
        const ma = tAnim * 0.52;
        moon.position.set(Math.cos(ma) * 1.9, Math.sin(ma) * 0.22, Math.sin(ma) * 0.95);
        moon.rotation.y = ma;
        renderer.render(scene, camera);
      };
      animate();

      cleanupFn = () => {
        cancelAnimationFrame(frameId);
        el.removeEventListener("mousedown", onDown); window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp);
        el.removeEventListener("wheel", onWheel); el.removeEventListener("touchstart", onTStart);
        window.removeEventListener("touchmove", onTMove); window.removeEventListener("touchend", onUp);
        renderer.dispose();
        if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
      };
    }, 0); // end setTimeout — deferred so app shell renders immediately

    return () => {
      clearTimeout(timerId);
      cancelAnimationFrame(frameId);
      cleanupFn?.();
    };
  }, []);

  return (
    <div ref={mountRef} className="relative flex-shrink-0 cursor-grab active:cursor-grabbing  lg:w-[580px] lg:h-[480px]"
      style={{ width: 580, height: 480 }} title="Drag to rotate · Scroll to zoom" />
  );
}

// ─── CERTIFICATE CARD ─────────────────────────────────────────────────────────

function CertCard({ cert, index, onOpen }: { cert: typeof certificates[0]; index: number; onOpen: () => void }) {
  const [hovered, setHovered] = useState(false);
  const swing = index % 2 === 0 ? -2 : 2;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onOpen}
      style={{
        position: "relative", flexShrink: 0, cursor: "pointer",
        transform: hovered ? "rotate(0deg) translateY(-14px) scale(1.05)" : `rotate(${swing}deg)`,
        transition: "transform 0.35s cubic-bezier(0.34,1.56,0.64,1)",
        transformOrigin: "top center",
        display: "flex", flexDirection: "column", alignItems: "center",
      }}
    >
      {/* Pin */}
      <div style={{ width: 10, height: 10, borderRadius: "50%", background: cert.color, boxShadow: `0 0 10px ${cert.glow}, 0 0 20px ${cert.glow}66`, zIndex: 10 }} />
      {/* Thread */}
      <div style={{ width: 1, height: 24, background: `linear-gradient(to bottom,${cert.color}88,rgba(255,255,255,.05))` }} />
      {/* Card */}
      <div className={`rounded-[18px] p-[2px] bg-gradient-to-br ${cert.border}`}
        style={{ boxShadow: hovered ? `0 0 40px ${cert.glow}88, 0 20px 40px rgba(0,0,0,0.5)` : `0 0 12px ${cert.glow}33` }}>
        <div className="rounded-[16px] bg-[#080d1f] p-5 flex flex-col items-center gap-2 w-[165px] relative overflow-hidden">
          {/* Corner brackets */}
          {(["top-2 left-2 border-t border-l", "top-2 right-2 border-t border-r", "bottom-2 left-2 border-b border-l", "bottom-2 right-2 border-b border-r"] as const).map((cls, i) => (
            <div key={i} className={`absolute w-3 h-3 ${cls}`} style={{ borderColor: cert.color + "55" }} />
          ))}
          {/* Hover shimmer */}
          {hovered && (
            <div className="absolute inset-0 opacity-10 pointer-events-none"
              style={{ background: `linear-gradient(135deg, ${cert.color}, transparent 60%)` }} />
          )}
          <div className="text-3xl relative z-10">{cert.badge}</div>
          <div className="text-[9px] tracking-[.25em] uppercase font-bold" style={{ color: cert.color }}>{cert.category}</div>
          <div className="text-xs font-bold text-white text-center leading-tight">{cert.title}</div>
          <div className="text-[11px] text-slate-400 text-center">{cert.issuer}</div>
          <div className="flex justify-between items-center w-full mt-1">
            <span className="text-[9px] text-slate-500">{cert.year}</span>
            {cert.verified && (
              <span className="flex items-center gap-1 text-[9px] font-semibold px-2 py-0.5 rounded-full"
                style={{ background: cert.color + "22", color: cert.color }}>
                <BadgeCheck size={10} /> Verified
              </span>
            )}
          </div>
          {/* "Click to view" hint */}
          <div className="flex items-center gap-1 text-[9px] mt-0.5 transition-opacity duration-300"
            style={{ color: cert.color, opacity: hovered ? 1 : 0.4 }}>
            <ZoomIn size={9} /> View certificate{cert.images.length > 1 ? `s (${cert.images.length})` : ""}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── HIGHLIGHT CARD ───────────────────────────────────────────────────────────

function HighlightCard({ h }: { h: typeof highlights[0] }) {
  const [hovered, setHovered] = useState(false);
  const Icon = h.icon;
  return (
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      className="relative overflow-hidden rounded-[28px] border transition-all duration-500 p-6 backdrop-blur-xl"
      style={{
        borderColor: hovered ? `${h.color}55` : "rgba(255,255,255,0.08)",
        background: hovered ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.02)",
        transform: hovered ? "translateY(-6px) scale(1.02)" : "translateY(0) scale(1)",
        boxShadow: hovered ? `0 20px 40px -15px ${h.color}33, inset 0 0 30px ${h.color}22` : `inset 0 0 40px ${h.color}08`,
      }}>
      <div className="absolute -bottom-8 -right-8 h-32 w-32 rounded-full blur-3xl transition-opacity duration-500"
        style={{ background: h.color, opacity: hovered ? 0.45 : 0.2 }} />
      <div className="absolute top-0 left-0 right-0 h-[2px] transition-opacity duration-500"
        style={{ background: `linear-gradient(90deg, transparent, ${h.color}, transparent)`, opacity: hovered ? 1 : 0 }} />
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl transition-transform duration-500"
            style={{ background: hovered ? `${h.color}22` : `${h.color}11`, border: `1px solid ${hovered ? `${h.color}55` : `${h.color}22`}`, transform: hovered ? "rotate(10deg)" : "none" }}>
            <Icon size={28} style={{ color: h.color }} />
          </div>
          <div className="text-3xl filter drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">{h.planet}</div>
        </div>
        <div className="text-[10px] tracking-[.35em] uppercase mb-2 font-semibold" style={{ color: hovered ? h.color : `${h.color}aa` }}>{h.subtitle}</div>
        <h3 className="text-xl font-extrabold text-white tracking-tight">{h.title}</h3>
        <p className="mt-3 text-sm leading-relaxed transition-colors duration-300" style={{ color: hovered ? "#f1f5f9" : "#cbd5e1" }}>{h.description}</p>
      </div>
    </div>
  );
}

// ─── TIMELINE ITEM ────────────────────────────────────────────────────────────

function TimelineItem({ title, subtitle, description, period, color = "#22d3ee", align, isActive = false, bullets = [] }:
  { title: string; subtitle: string; description: string; period: string; color?: string; align: "left" | "right"; isActive?: boolean; bullets?: string[] }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      className={`relative flex flex-col lg:flex-row items-center w-full mb-12 last:mb-0 ${align === "left" ? "lg:flex-row-reverse" : ""}`}>
      <div className="absolute left-5 lg:left-1/2 -translate-x-1/2 top-6 z-20 w-8 h-8 rounded-full border bg-[#04080f] flex items-center justify-center transition-all duration-500"
        style={{ borderColor: (hovered || isActive) ? color : `${color}66`, boxShadow: (hovered || isActive) ? `0 0 16px ${color}` : `0 0 8px ${color}33`, transform: (hovered || isActive) ? "scale(1.2)" : "scale(1)" }}>
        {isActive && <div className="absolute inset-0 rounded-full animate-ping opacity-30" style={{ background: color }} />}
        <div className="w-3.5 h-3.5 rounded-full transition-transform duration-500" style={{ background: color, transform: hovered ? "scale(0.8)" : "scale(1)" }} />
      </div>
      <div className={`w-full lg:w-1/2 pl-14 lg:pl-0 ${align === "left" ? "lg:pr-12" : "lg:pl-12"}`}>
        <div className="relative rounded-[26px] border bg-[#080d1f]/40 p-6 backdrop-blur-md transition-all duration-500 cursor-default overflow-hidden"
          style={{ borderColor: hovered ? color : "rgba(255,255,255,0.08)", boxShadow: hovered ? `0 20px 40px -15px ${color}22, inset 0 0 24px ${color}11` : "none", transform: hovered ? "translateY(-4px)" : "translateY(0)" }}>
          <div className="absolute top-0 left-0 right-0 h-[2px] transition-opacity duration-500"
            style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)`, opacity: hovered ? 1 : 0 }} />
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-xl font-bold text-white">{title}</h3>
                {isActive && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" /> Active
                  </span>
                )}
              </div>
              <p className="text-slate-400 mt-1 text-sm font-medium" style={{ color: (hovered || isActive) ? color : "#94a3b8" }}>{subtitle}</p>
            </div>
            <div className="shrink-0 rounded-full border px-4 py-1.5 text-xs font-semibold tracking-wide uppercase transition-all duration-500"
              style={{ borderColor: hovered ? `${color}44` : "rgba(255,255,255,0.1)", background: hovered ? `${color}18` : "rgba(255,255,255,0.03)", color: hovered ? "#fff" : "#94a3b8" }}>
              {period}
            </div>
          </div>
          <p className="mt-4 leading-relaxed text-sm" style={{ color: hovered ? "#e2e8f0" : "#cbd5e1" }}>{description}</p>
          {bullets.length > 0 && (
            <ul className="mt-4 space-y-2 border-t border-white/5 pt-4">
              {bullets.map((b, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-slate-400">
                  <span className="text-[10px] mt-1" style={{ color }}>✦</span>
                  <span className="leading-relaxed">{b}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <div className="hidden lg:block lg:w-1/2" />
    </div>
  );
}

// ─── SECTION TITLE ────────────────────────────────────────────────────────────

function SectionTitle({ label, color = "#818cf8", icon }: { label: string; color?: string; icon?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 my-9">
      <div className="h-px flex-1" style={{ background: `linear-gradient(to right,transparent,${color}44,transparent)` }} />
      <div className="flex items-center gap-2 text-[10px] uppercase tracking-[.3em] whitespace-nowrap" style={{ color }}>
        {icon} {label}
      </div>
      <div className="h-px flex-1" style={{ background: `linear-gradient(to right,transparent,${color}44,transparent)` }} />
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export default function EducationApp() {
  const [windowState, setWindowState] = useState<"normal" | "minimized" | "maximized">("normal");
  const [isVisible, setIsVisible] = useState(true);
  const [openCert, setOpenCert] = useState<typeof certificates[0] | null>(null);

  if (!isVisible) return null;

  return (
    <>
      <div className="flex flex-col overflow-hidden"
        style={{
          position: "relative", width: "100%",
          height: windowState === "minimized" ? 42 : windowState === "maximized" ? "100vh" : "100%",
          maxHeight: windowState === "minimized" ? 42 : undefined,
          background: "#04080f",
          borderTopRightRadius: windowState === "maximized" ? 0 : 12,
        borderBottomRightRadius: windowState === "maximized" ? 0 : 12,
        borderTopLeftRadius: 0,
        borderBottomLeftRadius: 0,
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 32px 80px rgba(0,0,0,0.7)",
          transition: "height 0.3s ease, max-height 0.3s ease, border-radius 0.2s ease",
          overflow: "hidden",
        }}>

        {/* ── App Body ── */}
        <div className="relative flex-1 overflow-y-auto overflow-x-hidden"
          style={{ display: windowState === "minimized" ? "none" : "block" }}>
          <div className="sticky top-0 left-0 right-0 h-0 z-0 pointer-events-none" style={{ overflow: "visible" }}>
            <div className="absolute inset-0" style={{ height: "100vh" }}>
              <AuroraCanvas />
              <div className="absolute inset-0 bg-gradient-to-b from-[#04080f] via-transparent to-[#04080f] opacity-60" />
            </div>
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-5 py-10 space-y-0">

            {/* ══ HERO ══ */}
            <section className="flex flex-col lg:flex-row items-center gap-1 min-h-[500px] -mt-15">
              <Planet3D />
              {/* ── CHANGED: hero text block — added responsive text sizes and padding ── */}
              <div className="flex-1 space-y-5 px-4 sm:px-2 lg:px-0 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-500/10 px-4 py-1.5 text-xs uppercase tracking-[.25em] text-cyan-300">
                  <Sparkles size={12} /> Academic Universe
                </div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl font-black leading-[1.08] tracking-tight">
                  Exploring the{" "}
                  <span className="bg-clip-text text-transparent"
                    style={{ backgroundImage: "linear-gradient(135deg,#22d3ee 0%,#a78bfa 50%,#f472b6 100%)" }}>
                    Knowledge Cosmos
                  </span>
                </h1>
                <p className="text-slate-300 leading-relaxed max-w-lg mx-auto lg:mx-0 text-sm sm:text-base lg:text-[15px]">
                  A software engineering student navigating the infinite expanse of technology-charting new stars in full-stack systems, intelligent software, and AI/ML solution.
                </p>
              </div>
              {/* ── END CHANGE ── */}
            </section>

            {/* ══ PROFILE ══ */}
            <ScrollReveal>
              <div className="relative overflow-hidden rounded-r-[32px] border border-white/10 p-8 mt-5 lg:-mt-10 backdrop-blur-xl"
                style={{ background: "linear-gradient(135deg,rgba(34,211,238,.06) 0%,rgba(8,13,31,.92) 50%,rgba(167,139,250,.06) 100%)", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5),inset 0 1px 1px rgba(255,255,255,0.1)" }}>
                {[["top-0 left-0", "border-t border-l"], ["top-0 right-0", "border-t border-r"], ["bottom-0 left-0", "border-b border-l"], ["bottom-0 right-0", "border-b border-r"]].map(([pos, cls], i) => (
                  <div key={i} className={`absolute ${pos} w-8 h-8 border-cyan-400/30 ${cls}`} style={{ borderRadius: 6 }} />
                ))}
                <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-72 h-72 rounded-full bg-cyan-500/10 blur-[100px] pointer-events-none" />
                <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-72 h-72 rounded-full bg-purple-500/10 blur-[100px] pointer-events-none" />
                <div className="flex flex-col lg:flex-row gap-8 items-stretch relative z-10">
                  <div className="flex-1 flex flex-col justify-between space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl relative overflow-hidden border border-cyan-500/30"
                          style={{ background: "linear-gradient(135deg,rgba(34,211,238,.15),rgba(167,139,250,.15))" }}>
                          <School size={30} className="text-cyan-300" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            <span className="text-[10px] uppercase tracking-[.3em] text-cyan-400 font-bold">Main Academy Station</span>
                          </div>
                          <h2 className="text-2xl font-black text-white tracking-tight mt-1">{profile.university}</h2>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {[
                          { label: profile.degree, color: "#22d3ee", icon: <GraduationCap size={13} /> },
                          { label: profile.year, color: "#a78bfa", icon: <Calendar size={13} /> },
                          { label: "Software Engineering Specialization", color: "#34d399", icon: <Code2 size={13} /> },
                        ].map(b => (
                          <div key={b.label} className="flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold backdrop-blur-md transition-all duration-300 hover:scale-105"
                            style={{ borderColor: b.color + "33", background: b.color + "11", color: b.color }}>
                            {b.icon} {b.label}
                          </div>
                        ))}
                      </div>
                    </div>
                    <ul className="text-slate-300 leading-relaxed text-sm max-w-xl list-disc pl-5">
                      <li>Passionate about building robust software from low-level distributed systems to scalable cloud services.</li>
                      <li>Crafting clean, maintainable code that scales with growing demands.</li>
                      <li>Employing modern development practices to accelerate delivery and ensure quality.</li>
                    </ul>
                  </div>
                  <div className="rounded-[24px] border border-white/10 bg-[#030712]/75 p-6 min-w-[280px] lg:w-[320px] flex flex-col justify-between space-y-4 backdrop-blur-xl relative overflow-hidden"
                    style={{ boxShadow: "inset 0 0 30px rgba(34,211,238,.05)" }}>
                    <div className="flex items-center justify-between border-b border-white/5 pb-3">
                      <div className="text-[10px] uppercase tracking-[.3em] text-slate-400 font-bold flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" /> System Telemetry
                      </div>
                      <div className="text-[9px] text-cyan-500 font-mono tracking-widest bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-800/40">SYS.LOG // OK</div>
                    </div>
                    <div className="space-y-3 font-mono">
                      {[
                        { label: "ACAD_YEAR", val: "4th / Final Year", color: "#22d3ee" },
                        { label: "MISSION_STATUS", val: "ACTIVE", color: "#34d399", isStatus: true },
                        { label: "CUMULATIVE_GPA", val: "3.58 / 4.00", color: "#a78bfa" },
                        { label: "EST_GRADUATION", val: "2027", color: "#f59e0b" },
                      ].map(r => (
                        <div key={r.label} className="flex justify-between items-center text-xs border-b border-white/[0.02] pb-2 last:border-0 last:pb-0">
                          <span className="text-slate-500 tracking-wider text-[10px]">{r.label}</span>
                          <span className="font-semibold flex items-center gap-1.5" style={{ color: r.color }}>
                            {r.isStatus && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />}
                            {r.val}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="pt-3 border-t border-white/5 space-y-2">
                      <div className="flex justify-between items-center text-[10px] font-mono">
                        <span className="text-slate-500">CURRICULUM_COMPLETION</span>
                        <span className="text-cyan-300 font-bold">75%</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-950 border border-white/5 overflow-hidden relative">
                        <div className="h-full rounded-full w-[75%]"
                          style={{ background: "linear-gradient(90deg,#22d3ee,#a78bfa)", boxShadow: "0 0 10px rgba(34,211,238,.5)" }} />
                        <div className="absolute top-0 bottom-0 left-[72%] w-1 bg-white/70 blur-[1px] animate-pulse" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            {/* ══ TIMELINE ══ */}
            <SectionTitle label="Timeline Wormhole" color="#22d3ee" icon={<BookOpen size={14} />} />
            <div className="relative my-12">
              <div className="absolute left-5 lg:left-1/2 top-0 bottom-0 w-[2px] -translate-x-1/2"
                style={{ background: "linear-gradient(to bottom,#22d3ee 0%,#a78bfa 50%,#f472b6 100%)" }} />
              <ScrollReveal>
                <TimelineItem title="BSc (Hons) Software Engineering" subtitle={profile.university}
                  description="Specialising in full-stack development, distributed systems, and AI/ML powered applications. Dean's List recognition across semester."
                  period="2023 - 2027" color="#22d3ee" align="left" isActive={true}
                  bullets={["Academic Track: Advanced Distributed Systems, Machine Learning Foundations, Full Stack Application.", "Academic Achievements: Dean's List recognition, maintaining a cumulative GPA of 3.58.", "Research Focus: Modern Web desktops and containerized deployment topologies."]} />
              </ScrollReveal>
              <ScrollReveal delay={150}>
                <TimelineItem title="Game Development Mini Degree" subtitle="CSGD LK"
                  description="Led the design and development of an indie 2D/3D game using Unity, delivering a polished playable demo showcasing rich mechanics and visual fidelity."
                  period="2021 - 2022" color="#f59e0b" align="right"
                  bullets={["Created 2D/3D game mechanics using Unity engine.", "Implemented gameplay logic with C# scripts.", "Collaborated in a small team to deliver a playable demo."]} />
              </ScrollReveal>
              <ScrollReveal delay={150}>
                <TimelineItem title="G.C.E. Advanced Level Examination" subtitle="Department of Examinations · Sri Lanka"
                  description="Index: 6743821 · Stream: Technology · Pass: B B C"
                  period="2020" color="#a78bfa" align="left"
                  bullets={["Core Subjects: Engineering Technology, Science for Technology, Information & Communication Technology.", "Extra-Curriculars: Active member in the School Computer Club, organizing local hackathons.", "Grade Performance: Achieved BBC grades, securing university entrance in the technology stream."]} />
              </ScrollReveal>
            </div>

            {/* ══ HIGHLIGHTS ══ */}
            <SectionTitle label="Exploration Sectors" color="#a78bfa" icon={<Globe size={14} />} />
            <div className="grid gap-6 lg:grid-cols-3">
              {highlights.map((h, i) => (
                <ScrollReveal key={h.title} delay={i * 150}>
                  <HighlightCard h={h} />
                </ScrollReveal>
              ))}
            </div>

            {/* ══ COURSES ══ */}
            <SectionTitle label="Constellation Modules" color="#34d399" icon={<Atom size={14} />} />
            <ScrollReveal>
              {/* ── CHANGED: courses wrapper padding tightened on mobile ── */}
              <div className="rounded-[30px] border border-white/8 bg-white/[.02] p-4 sm:p-6 backdrop-blur-xl">
                {/* ── CHANGED: grid starts 1-col on mobile, 2-col on sm, 3-col on lg ── */}
                <div className="grid gap-2 sm:gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  {courses.map((c, i) => {
                    const Icon = c.icon;
                    return (
                      <ScrollReveal key={c.name} delay={i * 50}>
                        <div className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[.03] p-3 sm:p-4 hover:-translate-y-1 hover:scale-[1.02] transition-transform duration-200 cursor-default"
                          style={{ boxShadow: `inset 0 0 20px ${c.color}08` }}>
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                            style={{ background: c.color + "18", border: `1px solid ${c.color}33` }}>
                            <Icon size={18} style={{ color: c.color }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-slate-200 truncate">{c.name}</div>
                            <div className="text-xs text-slate-500 mt-0.5">{c.credits} credits</div>
                          </div>
                          <div className="shrink-0 rounded-lg px-2.5 py-1 text-xs font-bold"
                            style={{ background: c.color + "18", color: c.color }}>
                            {c.grade}
                          </div>
                        </div>
                      </ScrollReveal>
                    );
                  })}
                </div>
              </div>
              {/* ── END CHANGE ── */}
            </ScrollReveal>

            {/* ══ CERTIFICATES ══ */}
            <SectionTitle label="Certificate Vault — Gallery Wing" color="#f59e0b" icon={<Award size={14} />} />
            <ScrollReveal>
              <div className="relative overflow-hidden rounded-[32px] border border-white/8 p-8 pt-14"
                style={{ background: "linear-gradient(180deg,rgba(8,13,31,.5) 0%,rgba(4,8,15,.95) 100%)" }}>
                <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-[32px]"
                  style={{ background: "linear-gradient(to right,rgba(245,158,11,.2),rgba(245,158,11,.6),rgba(245,158,11,.2))" }} />
                <div className="absolute top-3 left-1/2 -translate-x-1/2 text-[9px] tracking-[.4em] uppercase whitespace-nowrap"
                  style={{ color: "rgba(245,158,11,.45)" }}>✦ Hall of Credentials ✦</div>
                <div className="flex flex-wrap justify-center gap-10 pt-2">
                  {certificates.map((cert, i) => (
                    <ScrollReveal key={cert.title} delay={i * 100}>
                      <CertCard cert={cert} index={i} onOpen={() => setOpenCert(cert)} />
                    </ScrollReveal>
                  ))}
                </div>
                <div className="mt-10 h-px" style={{ background: "linear-gradient(to right,transparent,rgba(255,255,255,.1),transparent)" }} />
                <p className="text-center text-[10px] text-slate-600 mt-3 tracking-widest uppercase">
                  Click any certificate to view · Drag images to pan when zoomed
                </p>
              </div>
            </ScrollReveal>

            {/* ══ FOOTER ══ */}
            <footer className="pb-4 text-center pt-8 border-t border-cyan-500/10">
              <div className="flex items-center justify-center gap-2 text-[10px] uppercase tracking-[.4em] text-slate-700">
                <Infinity size={12} className="text-cyan-500/40" />
                Knowledge has no boundaries · Universe ID {profile.university?.slice(0, 3).toUpperCase() ?? "UNI"}-2021-SE
                <Infinity size={12} className="text-cyan-500/40" />
              </div>
            </footer>

          </div>
        </div>

        {/* ── Certificate Modal (confined to this app window) ── */}
        {openCert && <CertModal cert={openCert} onClose={() => setOpenCert(null)} />}
      </div>
    </>
  );
}