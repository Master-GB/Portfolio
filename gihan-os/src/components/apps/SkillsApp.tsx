"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";

// ── Real SVG icons via Simple Icons CDN ──────────────────────────────────
interface IconDef {
  slug: string;
  hex: string;
  text: string;
  fallback?: string;
}

const ICON_DEFS: Record<string, IconDef> = {
  JavaScript: { slug: "javascript", hex: "F7DF1E", text: "#000" },
  TypeScript: { slug: "typescript", hex: "3178C6", text: "#fff" },
  Python: { slug: "python", hex: "3776AB", text: "#FFD43B" },
  Java: { slug: "openjdk", hex: "ED8B00", text: "#fff" },
  "C++": { slug: "cplusplus", hex: "00599C", text: "#fff" },
  "C#": { slug: "csharp", hex: "239120", text: "#fff" },
  Go: { slug: "go", hex: "00ADD8", text: "#fff" },
  Rust: { slug: "rust", hex: "CE422B", text: "#fff" },
  Swift: { slug: "swift", hex: "F05138", text: "#fff" },
  Kotlin: { slug: "kotlin", hex: "7F52FF", text: "#fff" },
  PHP: { slug: "php", hex: "777BB4", text: "#fff" },
  Ruby: { slug: "ruby", hex: "CC342D", text: "#fff" },
  Dart: { slug: "dart", hex: "0175C2", text: "#fff" },
  SQL: { slug: "", hex: "336791", text: "#fff", fallback: "SQL" },
  HTML: { slug: "html5", hex: "E34F26", text: "#fff" },
  CSS: { slug: "css3", hex: "1572B6", text: "#fff" },
  Bash: { slug: "gnubash", hex: "4EAA25", text: "#fff" },
  React: { slug: "react", hex: "61DAFB", text: "#20232a" },
  "Next.js": { slug: "nextdotjs", hex: "000000", text: "#fff" },
  "Vue.js": { slug: "vuedotjs", hex: "4FC08D", text: "#fff" },
  Angular: { slug: "angular", hex: "DD0031", text: "#fff" },
  Svelte: { slug: "svelte", hex: "FF3E00", text: "#fff" },
  "Tailwind CSS": { slug: "tailwindcss", hex: "06B6D4", text: "#fff" },
  GSAP: { slug: "greensock", hex: "88CE02", text: "#000" },
  "Three.js": { slug: "threedotjs", hex: "000000", text: "#fff" },
  "Framer Motion": { slug: "framer", hex: "0055FF", text: "#fff" },
  Redux: { slug: "redux", hex: "764ABC", text: "#fff" },
  Vite: { slug: "vite", hex: "646CFF", text: "#fff" },
  Webpack: { slug: "webpack", hex: "8DD6F9", text: "#1C78C0" },
  "Node.js": { slug: "nodedotjs", hex: "339933", text: "#fff" },
  Express: { slug: "express", hex: "000000", text: "#fff" },
  FastAPI: { slug: "fastapi", hex: "009688", text: "#fff" },
  Django: { slug: "django", hex: "092E20", text: "#fff" },
  Flask: { slug: "flask", hex: "000000", text: "#fff" },
  "Spring Boot": { slug: "springboot", hex: "6DB33F", text: "#fff" },
  GraphQL: { slug: "graphql", hex: "E10098", text: "#fff" },
  "REST API": { slug: "", hex: "4CAF50", text: "#fff", fallback: "API" },
  "Socket.io": { slug: "socketdotio", hex: "010101", text: "#fff" },
  NestJS: { slug: "nestjs", hex: "E0234E", text: "#fff" },
  MongoDB: { slug: "mongodb", hex: "47A248", text: "#fff" },
  PostgreSQL: { slug: "postgresql", hex: "336791", text: "#fff" },
  MySQL: { slug: "mysql", hex: "4479A1", text: "#fff" },
  Redis: { slug: "redis", hex: "DC382D", text: "#fff" },
  Firebase: { slug: "firebase", hex: "FFCA28", text: "#000" },
  Supabase: { slug: "supabase", hex: "3ECF8E", text: "#fff" },
  SQLite: { slug: "sqlite", hex: "003B57", text: "#fff" },
  Prisma: { slug: "prisma", hex: "2D3748", text: "#fff" },
  Docker: { slug: "docker", hex: "2496ED", text: "#fff" },
  Kubernetes: { slug: "kubernetes", hex: "326CE5", text: "#fff" },
  Git: { slug: "git", hex: "F05032", text: "#fff" },
  GitHub: { slug: "github", hex: "181717", text: "#fff" },
  GitLab: { slug: "gitlab", hex: "FC6D26", text: "#fff" },
  AWS: { slug: "amazonwebservices", hex: "FF9900", text: "#fff" },
  GCP: { slug: "googlecloud", hex: "4285F4", text: "#fff" },
  Azure: { slug: "microsoftazure", hex: "0078D4", text: "#fff" },
  Vercel: { slug: "vercel", hex: "000000", text: "#fff" },
  Netlify: { slug: "netlify", hex: "00C7B7", text: "#fff" },
  Linux: { slug: "linux", hex: "FCC624", text: "#000" },
  Nginx: { slug: "nginx", hex: "009639", text: "#fff" },
  "CI/CD": { slug: "", hex: "0A0A0A", text: "#fff", fallback: "CI/CD" },
  "React Native": { slug: "react", hex: "61DAFB", text: "#20232a" },
  Flutter: { slug: "flutter", hex: "02569B", text: "#fff" },
  Expo: { slug: "expo", hex: "000020", text: "#fff" },
  Android: { slug: "android", hex: "3DDC84", text: "#000" },
  iOS: { slug: "apple", hex: "000000", text: "#fff" },
  Jest: { slug: "jest", hex: "C21325", text: "#fff" },
  Vitest: { slug: "vitest", hex: "6E9F18", text: "#fff" },
  Cypress: { slug: "cypress", hex: "17202C", text: "#fff" },
  Playwright: { slug: "playwright", hex: "2EAD33", text: "#fff" },
  Selenium: { slug: "selenium", hex: "43B02A", text: "#fff" },
  TensorFlow: { slug: "tensorflow", hex: "FF6F00", text: "#fff" },
  PyTorch: { slug: "pytorch", hex: "EE4C2C", text: "#fff" },
  "scikit-learn": { slug: "scikitlearn", hex: "F7931E", text: "#fff" },
  "OpenAI API": { slug: "openai", hex: "412991", text: "#fff" },
  LangChain: { slug: "langchain", hex: "1C3C3C", text: "#fff" },
  Figma: { slug: "figma", hex: "F24E1E", text: "#fff" },
  "Adobe XD": { slug: "adobexd", hex: "FF61F6", text: "#fff" },
  Blender: { slug: "blender", hex: "E87D0D", text: "#fff" },
  // ── Tools & Platforms extras ───────────────────────────────────────────
  Railway:          { slug: "railway",          hex: "0B0D0E", text: "#fff" },
  Render:           { slug: "render",           hex: "46E3B7", text: "#000" },
  Jira:             { slug: "jira",             hex: "0052CC", text: "#fff" },
  "Android Studio": { slug: "androidstudio",   hex: "3DDC84", text: "#000" },
  "VS Code":        { slug: "visualstudiocode", hex: "007ACC", text: "#fff" },
  "IntelliJ IDEA":  { slug: "intellijidea",    hex: "000000", text: "#fff" },
  "intelliJ IDEA ": { slug: "intellijidea",    hex: "000000", text: "#fff" },
  "Unity Hub":      { slug: "unity",           hex: "000000", text: "#fff" },
  // ── Database extras ────────────────────────────────────────────────────
  SuperBase:        { slug: "supabase",         hex: "3ECF8E", text: "#fff" },
  // ── Testing extras ─────────────────────────────────────────────────────
  Postman:          { slug: "postman",          hex: "FF6C37", text: "#fff" },
  // ── AI / ML extras ─────────────────────────────────────────────────────
  "Hugging Face":   { slug: "huggingface",      hex: "FFD21E", text: "#000" },
  "Huging Face":    { slug: "huggingface",      hex: "FFD21E", text: "#000" },
  "Gemini API":     { slug: "googlegemini",     hex: "8E75B2", text: "#fff" },
};

function getIconDef(name: string): IconDef {
  if (ICON_DEFS[name]) return ICON_DEFS[name];
  const key = Object.keys(ICON_DEFS).find(
    (k) =>
      name.toLowerCase().includes(k.toLowerCase()) ||
      k.toLowerCase().includes(name.toLowerCase()),
  );
  if (key) return ICON_DEFS[key];
  return {
    slug: "",
    hex: "4f46e5",
    text: "#fff",
    fallback: name.slice(0, 2).toUpperCase(),
  };
}

function TechIcon({ name, size = 32 }: { name: string; size?: number }) {
  const def = getIconDef(name);
  const [imgFailed, setImgFailed] = useState(false);
  const bg = `#${def.hex}`;
  const innerSize = size * 0.55;

  if (def.slug && !imgFailed) {
    const cdnUrl = `https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/${def.slug}.svg`;
    return (
      <div
        style={{
          width: size,
          height: size,
          background: bg,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          overflow: "hidden",
        }}
      >
        <img
          src={cdnUrl}
          alt={name}
          width={innerSize}
          height={innerSize}
          onError={() => setImgFailed(true)}
          style={{
            filter: def.text === "#fff" ? "invert(1) brightness(2)" : "none",
            width: innerSize,
            height: innerSize,
            objectFit: "contain",
          }}
        />
      </div>
    );
  }

  const label = def.fallback ?? name.slice(0, 2).toUpperCase();
  return (
    <div
      style={{
        width: size,
        height: size,
        background: bg,
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        color: def.text,
        fontWeight: 900,
        fontFamily: "'JetBrains Mono', monospace",
        fontSize:
          label.length > 3
            ? size * 0.25
            : label.length > 2
              ? size * 0.3
              : size * 0.38,
        letterSpacing: "-0.04em",
      }}
    >
      {label}
    </div>
  );
}

// ── Galaxy + Tech Space Background ───────────────────────────────────────
function GalaxyBackground({ accent }: { accent: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Parse accent color FIRST — needed by paintNebula
    const hex = accent.replace("#", "");
    const ar = parseInt(hex.slice(0, 2), 16) || 160;
    const ag = parseInt(hex.slice(2, 4), 16) || 100;
    const ab = parseInt(hex.slice(4, 6), 16) || 240;

    // ── Nebula clouds — offscreen canvas, repainted on every resize
    const nebulaCanvas = document.createElement("canvas");
    const paintNebula = () => {
      nebulaCanvas.width = canvas.width;
      nebulaCanvas.height = canvas.height;
      const nc = nebulaCanvas.getContext("2d")!;
      const clouds = [
        {
          cx: 0.25,
          cy: 0.3,
          rx: 0.3,
          ry: 0.22,
          c1: `rgba(${ar},${ag},${ab},0.07)`,
          c2: "transparent",
        },
        {
          cx: 0.75,
          cy: 0.65,
          rx: 0.28,
          ry: 0.2,
          c1: `rgba(99,60,180,0.06)`,
          c2: "transparent",
        },
        {
          cx: 0.55,
          cy: 0.15,
          rx: 0.2,
          ry: 0.15,
          c1: `rgba(30,120,200,0.05)`,
          c2: "transparent",
        },
      ];
      clouds.forEach((c) => {
        const grd = nc.createRadialGradient(
          c.cx * canvas.width,
          c.cy * canvas.height,
          0,
          c.cx * canvas.width,
          c.cy * canvas.height,
          c.rx * canvas.width,
        );
        grd.addColorStop(0, c.c1);
        grd.addColorStop(1, c.c2);
        nc.fillStyle = grd;
        nc.beginPath();
        nc.ellipse(
          c.cx * canvas.width,
          c.cy * canvas.height,
          c.rx * canvas.width,
          c.ry * canvas.height,
          0,
          0,
          Math.PI * 2,
        );
        nc.fill();
      });
    };

    // Use ResizeObserver on the canvas element itself — catches maximize,
    // OS-level window resize, and panel expand/collapse reliably
    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      paintNebula();
    };
    resize();
    const ro = new ResizeObserver(() => resize());
    ro.observe(canvas);

    // ── Stars
    const STAR_COUNT = 320;
    const stars = Array.from({ length: STAR_COUNT }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: 0.3 + Math.random() * 1.8,
      twinkleSpeed: 0.5 + Math.random() * 1.5,
      twinkleOffset: Math.random() * Math.PI * 2,
      color:
        Math.random() > 0.85
          ? `rgba(${ar},${ag},${ab},`
          : Math.random() > 0.5
            ? "rgba(180,200,255,"
            : "rgba(255,240,210,",
    }));

    // ── Wormhole / portal vortex
    const ARMS = 5;
    const ARM_STEPS = 120;
    let vortexAngle = 0;

    interface VortexParticle {
      angle: number;
      radius: number;
      speed: number;
      inSpeed: number;
      size: number;
      opacity: number;
    }
    const VPARTICLE_COUNT = 60;
    const vparticles: VortexParticle[] = Array.from(
      { length: VPARTICLE_COUNT },
      () => ({
        angle: Math.random() * Math.PI * 2,
        radius: 0.12 + Math.random() * 0.32,
        speed: 0.008 + Math.random() * 0.018,
        inSpeed: 0.0003 + Math.random() * 0.0006,
        size: 1 + Math.random() * 2.5,
        opacity: 0.3 + Math.random() * 0.6,
      }),
    );

    // ── Tech orbit ring
    const ORBIT_NODES = 7;
    let orbitAngle = 0;

    // ── Grid
    const drawGrid = () => {
      const W = canvas.width, H = canvas.height;
      ctx.save();
      ctx.strokeStyle = `rgba(${ar},${ag},${ab},0.04)`;
      ctx.lineWidth = 0.5;
      const spacing = 52;
      for (let x = 0; x < W; x += spacing) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
      }
      for (let y = 0; y < H; y += spacing) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }
      ctx.restore();
    };

    const startTime = performance.now();
    const draw = () => {
      const t = (performance.now() - startTime) / 1400;
      const W = canvas.width, H = canvas.height;

      ctx.fillStyle = "rgba(4,3,12,1)";
      ctx.fillRect(0, 0, W, H);

      ctx.drawImage(nebulaCanvas, 0, 0);
      drawGrid();

      // Stars
      stars.forEach((s) => {
        const twinkle =
          0.4 + 0.6 * Math.abs(Math.sin(t * s.twinkleSpeed + s.twinkleOffset));
        ctx.beginPath();
        ctx.arc(s.x * W, s.y * H, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `${s.color}${twinkle.toFixed(2)})`;
        ctx.fill();
        if (s.r > 1.2) {
          ctx.beginPath();
          ctx.arc(s.x * W, s.y * H, s.r * 0.35, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255,255,255,${(twinkle * 0.9).toFixed(2)})`;
          ctx.fill();
        }
      });

      // Wormhole vortex
      vortexAngle += 0.0025;
      const vcx = W * 0.5, vcy = H * 0.5;
      const minDim = Math.min(W, H);
      const maxR = minDim * 0.44;

      for (let arm = 0; arm < ARMS; arm++) {
        const armOffset = (arm / ARMS) * Math.PI * 2;
        ctx.beginPath();
        for (let s = 0; s < ARM_STEPS; s++) {
          const frac = s / ARM_STEPS;
          const r = frac * maxR;
          const a = armOffset + frac * Math.PI * 6 + vortexAngle;
          const px = vcx + Math.cos(a) * r;
          const py = vcy + Math.sin(a) * r * 0.45;
          s === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
        }
        ctx.strokeStyle = `rgba(${ar},${ag},${ab},${0.06 + arm * 0.015})`;
        ctx.lineWidth = 1.2 - arm * 0.15;
        ctx.stroke();
      }

      for (let ring = 5; ring >= 0; ring--) {
        const rFrac = ring / 5;
        const radius = maxR * (0.04 + rFrac * 0.18);
        const alpha = (1 - rFrac) * 0.55;
        const grd = ctx.createRadialGradient(vcx, vcy, 0, vcx, vcy, radius);
        grd.addColorStop(0, `rgba(255,255,255,${(alpha * 0.9).toFixed(2)})`);
        grd.addColorStop(0.4, `rgba(${ar},${ag},${ab},${(alpha * 0.8).toFixed(2)})`);
        grd.addColorStop(1, "rgba(0,0,0,0)");
        ctx.beginPath();
        ctx.ellipse(vcx, vcy, radius, radius * 0.45, 0, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();
      }

      ctx.save();
      ctx.translate(vcx, vcy);
      ctx.rotate(-vortexAngle * 0.3);
      for (let seg = 0; seg < 32; seg++) {
        const a1 = (seg / 32) * Math.PI * 2;
        const a2 = ((seg + 0.55) / 32) * Math.PI * 2;
        const ro = maxR * 0.48;
        const pulse = 0.03 + 0.03 * Math.sin(t * 2 + seg);
        ctx.beginPath();
        ctx.arc(0, 0, ro + pulse * minDim, a1, a2);
        ctx.strokeStyle = `rgba(${ar},${ag},${ab},${(0.06 + 0.06 * Math.abs(Math.sin(t * 1.2 + seg * 0.4))).toFixed(2)})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
      ctx.restore();

      vparticles.forEach((p) => {
        p.angle += p.speed;
        p.radius -= p.inSpeed;
        if (p.radius < 0.005) {
          p.radius = 0.12 + Math.random() * 0.32;
          p.angle = Math.random() * Math.PI * 2;
          p.speed = 0.008 + Math.random() * 0.018;
          p.inSpeed = 0.0003 + Math.random() * 0.0006;
        }
        const pr = p.radius * minDim;
        const px = vcx + Math.cos(p.angle) * pr;
        const py = vcy + Math.sin(p.angle) * pr * 0.45;
        const brightFrac = 1 - p.radius / 0.44;
        const grd = ctx.createRadialGradient(px, py, 0, px, py, p.size * 2.5);
        grd.addColorStop(0, `rgba(255,255,255,${(p.opacity * (0.5 + brightFrac * 0.5)).toFixed(2)})`);
        grd.addColorStop(0.5, `rgba(${ar},${ag},${ab},${(p.opacity * 0.6).toFixed(2)})`);
        grd.addColorStop(1, "rgba(0,0,0,0)");
        ctx.beginPath();
        ctx.arc(px, py, p.size * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();
      });

      // Tech orbit ring
      orbitAngle += 0.0018;
      const cx = W * 0.5, cy = H * 0.5;
      const rx = Math.min(W, H) * 0.38, ry = Math.min(W, H) * 0.18;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(orbitAngle * 0.4);
      ctx.beginPath();
      for (let i = 0; i <= 360; i += 2) {
        const rad = (i * Math.PI) / 180;
        const px = Math.cos(rad) * rx;
        const py = Math.sin(rad) * ry;
        i === 0 ? ctx.moveTo(px, py) : i % 12 < 6 ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
      }
      ctx.strokeStyle = `rgba(${ar},${ag},${ab},0.12)`;
      ctx.lineWidth = 1;
      ctx.stroke();
      for (let i = 0; i < ORBIT_NODES; i++) {
        const a = (i / ORBIT_NODES) * Math.PI * 2 + orbitAngle * 2;
        const nx = Math.cos(a) * rx;
        const ny = Math.sin(a) * ry;
        const pulse = 0.5 + 0.5 * Math.sin(t * 1.5 + i);
        ctx.beginPath();
        ctx.arc(nx, ny, 3 + pulse, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${ar},${ag},${ab},${0.4 + pulse * 0.4})`;
        ctx.fill();
        const grd = ctx.createRadialGradient(nx, ny, 0, nx, ny, 10);
        grd.addColorStop(0, `rgba(${ar},${ag},${ab},0.3)`);
        grd.addColorStop(1, "rgba(0,0,0,0)");
        ctx.beginPath();
        ctx.arc(nx, ny, 10, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();
      }
      ctx.restore();

      // Scan line
      const scanY = ((t * 28) % (H + 60)) - 30;
      const scanGrad = ctx.createLinearGradient(0, scanY - 1, 0, scanY + 2);
      scanGrad.addColorStop(0, "rgba(0,0,0,0)");
      scanGrad.addColorStop(0.5, `rgba(${ar},${ag},${ab},0.06)`);
      scanGrad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = scanGrad;
      ctx.fillRect(0, scanY - 1, W, 4);

      rafRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      ro.disconnect();
      cancelAnimationFrame(rafRef.current);
    };
  }, [accent]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
      }}
    />
  );
}

// ── Category config ───────────────────────────────────────────────────────
interface CategoryConfig {
  label: string;
  accent: string;
  glow: string;
  gradient: [string, string];
  icon: string;
}

const CATEGORY_CONFIG: Record<string, CategoryConfig> = {
  "All Skills": {
    label: "All Skills",
    accent: "#a3e635",
    glow: "rgba(163,230,53,0.25)",
    gradient: ["#65a30d", "#a3e635"],
    icon: "⊞",
  },
  "Programming Languages": {
    label: "Languages",
    accent: "#a78bfa",
    glow: "rgba(167,139,250,0.25)",
    gradient: ["#7c3aed", "#a78bfa"],
    icon: "λ",
  },
  "Frontend Frameworks & Libraries": {
    label: "Frontend",
    accent: "#99ddff",
    glow: "rgba(26,189,248,0.25)",
    gradient: ["#9284c9", "#98bdf9"],
    icon: "⬡",
  },
  "Backend Frameworks & APIs": {
    label: "Backend",
    accent: "#34d399",
    glow: "rgba(52,211,153,0.25)",
    gradient: ["#059669", "#34d399"],
    icon: "⚡",
  },
  DevOps: {
    label: "DevOps",
    accent: "#fdc22fff",
    glow: "rgba(251,191,36,0.25)",
    gradient: ["#d97706", "#fbbf24"],
    icon: "🛞",
  },
  "Mobile Development": {
    label: "Mobile",
    accent: "#f472b6",
    glow: "rgba(244,114,182,0.25)",
    gradient: ["#db2777", "#f472b6"],
    icon: "📱",
  },
  Database: {
    label: "Database",
    accent: "#22d3ee",
    glow: "rgba(34,211,238,0.25)",
    gradient: ["#0891b2", "#22d3ee"],
    icon: "🗄",
  },
  Testing: {
    label: "Testing",
    accent: "#fb7185",
    glow: "rgba(251,113,133,0.25)",
    gradient: ["#e11d48", "#fb7185"],
    icon: "✔",
  },
  "AI / ML": {
    label: "AI & ML",
    accent: "#ed2626",
    glow: "rgba(224, 7, 7, 0.25)",
    gradient: ["#eb5252", "#ed2626"],
    icon: "🤖",
  },
  "Tools & Platforms": {
    label: "Tools & Platforms",
    accent: "#f97316",
    glow: "rgba(249,115,22,0.25)",
    gradient: ["#ea580c", "#f97316"],
    icon: "🛠️",
  },
};

function getCfg(cat: string): CategoryConfig {
  return (
    CATEGORY_CONFIG[cat] ?? {
      label: cat,
      accent: "#6366f1",
      glow: "rgba(99,102,241,0.25)",
      gradient: ["#4f46e5", "#6366f1"],
      icon: "◈",
    }
  );
}

// ── 3D Tilt card wrapper ──────────────────────────────────────────────────
function TiltCard({
  children,
  cfg,
  onHover,
}: {
  children: React.ReactNode;
  cfg: CategoryConfig;
  onHover: (v: boolean) => void;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const rotX = useMotionValue(0);
  const rotY = useMotionValue(0);
  const sRotX = useSpring(rotX, { stiffness: 300, damping: 30 });
  const sRotY = useSpring(rotY, { stiffness: 300, damping: 30 });

  const handleMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = cardRef.current?.getBoundingClientRect();
      if (!rect) return;
      rotX.set(-((e.clientY - rect.top) / rect.height - 0.5) * 14);
      rotY.set(((e.clientX - rect.left) / rect.width - 0.5) * 14);
    },
    [rotX, rotY],
  );

  const handleLeave = useCallback(() => {
    rotX.set(0);
    rotY.set(0);
    onHover(false);
  }, [rotX, rotY, onHover]);

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMove}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={handleLeave}
      style={{
        rotateX: sRotX,
        rotateY: sRotY,
        transformStyle: "preserve-3d",
        perspective: 800,
        cursor: "pointer",
      }}
    >
      {children}
    </motion.div>
  );
}

// ── Idle floating particles inside a card ────────────────────────────────
function CardParticles({
  accent,
  active,
}: {
  accent: string;
  active: boolean;
}) {
  const particles = useRef(
    Array.from({ length: 6 }, (_, i) => ({
      id: i,
      x: 15 + Math.random() * 70,
      size: 1.5 + Math.random() * 2,
      dur: 2.5 + Math.random() * 2,
      delay: Math.random() * 3,
    })),
  ).current;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        overflow: "hidden",
      }}
    >
      {particles.map((p) => (
        <motion.div
          key={p.id}
          animate={{ y: ["100%", "-10%"], opacity: [0, active ? 0.9 : 0.4, 0] }}
          transition={{
            duration: p.dur,
            repeat: Infinity,
            ease: "easeOut",
            delay: p.delay,
            repeatDelay: 0.5 + Math.random() * 1.5,
          }}
          style={{
            position: "absolute",
            left: `${p.x}%`,
            bottom: 0,
            width: p.size,
            height: p.size,
            borderRadius: "50%",
            background: accent,
            boxShadow: `0 0 ${p.size * 3}px ${accent}`,
          }}
        />
      ))}
    </div>
  );
}

// ── Animated Skill Card ───────────────────────────────────────────────────
function SkillCard({
  skill,
  index,
  cfg,
  viewMode = "grid",
}: {
  skill: { name: string; level: number };
  index: number;
  cfg: CategoryConfig;
  viewMode?: "grid" | "list";
}) {
  const [hovered, setHovered] = useState(false);
  const [pulseKey, setPulseKey] = useState(0);
  const seed = useRef({
    floatDur: 3.5 + (index % 5) * 0.7,
    floatDel: (index * 0.38) % 2.5,
    glowDur: 2.2 + (index % 4) * 0.6,
    glowDel: (index * 0.55) % 2.0,
    shimDur: 4.0 + (index % 3) * 1.2,
    shimDel: (index * 0.9) % 3.5,
  }).current;

  const pct = skill.level;
  const r = 34;
  const circ = 2 * Math.PI * r;

  useEffect(() => {
    if (hovered) setPulseKey((k) => k + 1);
  }, [hovered]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.7, rotateY: 90 }}
      animate={{ opacity: 1, y: 0, scale: 1, rotateY: 0 }}
      exit={{ opacity: 0, scale: 0.6, rotateY: -60 }}
      transition={{
        delay: index * 0.045,
        duration: 0.55,
        type: "spring",
        stiffness: 200,
        damping: 20,
      }}
      style={{ position: "relative" }}
    >
      <TiltCard cfg={cfg} onHover={setHovered}>
        {/* HOVER: pulse rings */}
        <AnimatePresence>
          {hovered && (
            <>
              <motion.div
                key={`r1-${pulseKey}`}
                initial={{ scale: 0.85, opacity: 0.55 }}
                animate={{ scale: 1.55, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.85, ease: "easeOut" }}
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: 18,
                  border: `1.5px solid ${cfg.accent}`,
                  pointerEvents: "none",
                  zIndex: 0,
                }}
              />
              <motion.div
                key={`r2-${pulseKey}`}
                initial={{ scale: 0.85, opacity: 0.3 }}
                animate={{ scale: 1.9, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.2, ease: "easeOut", delay: 0.15 }}
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: 18,
                  border: `1px solid ${cfg.accent}`,
                  pointerEvents: "none",
                  zIndex: 0,
                }}
              />
            </>
          )}
        </AnimatePresence>

        {/* CARD SHELL */}
        <motion.div
          animate={{
            y: hovered ? 0 : [0, -5, 0],
            background: hovered
              ? `linear-gradient(145deg, ${cfg.accent}22 0%, rgba(15,12,40,0.97) 55%)`
              : "rgba(12,10,32,0.80)",
            boxShadow: hovered
              ? `0 0 0 1px ${cfg.accent}50, 0 12px 40px rgba(0,0,0,0.55), 0 0 70px ${cfg.glow}`
              : `0 0 0 1px rgba(255,255,255,0.05), 0 4px 16px rgba(0,0,0,0.35)`,
          }}
          transition={
            hovered
              ? { duration: 0.3 }
              : {
                  y: {
                    duration: seed.floatDur,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: seed.floatDel,
                  },
                  background: { duration: 0.3 },
                  boxShadow: { duration: 0.3 },
                }
          }
          style={{
            borderRadius: 16,
            padding: "1.2rem 0.9rem 1rem",
            backdropFilter: "blur(24px)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "0.7rem",
            position: "relative",
            overflow: "hidden",
            zIndex: 2,
          }}
        >
          {/* IDLE: diagonal shimmer sweep */}
          <motion.div
            animate={{ x: ["-120%", "220%"] }}
            transition={{
              duration: seed.shimDur,
              repeat: Infinity,
              ease: "linear",
              delay: seed.shimDel,
            }}
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: 0,
              width: "45%",
              background: `linear-gradient(90deg, transparent, ${cfg.accent}${hovered ? "28" : "10"}, transparent)`,
              pointerEvents: "none",
              zIndex: 3,
              transform: "skewX(-15deg)",
            }}
          />

          {/* IDLE: top glow line breathes */}
          <motion.div
            animate={{
              opacity: hovered ? 1 : [0.15, 0.65, 0.15],
              scaleX: hovered ? 1 : [0.4, 1, 0.4],
            }}
            transition={
              hovered
                ? { duration: 0.25 }
                : {
                    duration: seed.glowDur,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: seed.glowDel,
                  }
            }
            style={{
              position: "absolute",
              top: 0,
              left: "10%",
              right: "10%",
              height: 1,
              background: `linear-gradient(90deg, transparent, ${cfg.accent}, transparent)`,
              boxShadow: `0 0 10px ${cfg.accent}`,
            }}
          />

          {/* Rising particles */}
          <CardParticles accent={cfg.accent} active={hovered} />

          {/* PROGRESS RING + ICON */}
          <div style={{ position: "relative", width: 84, height: 84 }}>
            <svg
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
              viewBox="0 0 84 84"
            >
              <circle cx="42" cy="42" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
            </svg>
            <div style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
              <svg style={{ width: "100%", height: "100%", transform: "rotate(-90deg)" }} viewBox="0 0 84 84">
                <defs>
                  <linearGradient id={`g-${skill.name.replace(/[\s.+#]/g, "")}`} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={cfg.gradient[0]} />
                    <stop offset="100%" stopColor={cfg.gradient[1]} />
                  </linearGradient>
                </defs>
                <motion.circle
                  cx="42" cy="42" r={r} fill="none"
                  stroke={`url(#g-${skill.name.replace(/[\s.+#]/g, "")})`}
                  strokeWidth="3" strokeLinecap="round" strokeDasharray={circ}
                  initial={{ strokeDashoffset: circ }}
                  animate={{ strokeDashoffset: circ - (circ * pct) / 100 }}
                  transition={{ delay: index * 0.04 + 0.2, duration: 1.1, ease: "easeOut" }}
                />
              </svg>
            </div>
            <motion.div
              animate={{
                opacity: hovered ? 1 : [0.15, 0.5, 0.15],
                scale: hovered ? 1.08 : [1, 1.04, 1],
              }}
              transition={
                hovered
                  ? { duration: 0.3 }
                  : { duration: seed.glowDur, repeat: Infinity, ease: "easeInOut", delay: seed.glowDel }
              }
              style={{
                position: "absolute", inset: 7, borderRadius: "50%",
                boxShadow: `0 0 20px ${cfg.glow}, 0 0 40px ${cfg.glow}`,
              }}
            />
            <div
              style={{
                position: "absolute", inset: 10, borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden",
              }}
            >
              <TechIcon name={skill.name} size={64} />
            </div>
          </div>

          {/* Skill name */}
          <motion.div
            animate={{ color: hovered ? "#f1f5f9" : "#94a3b8" }}
            style={{
              fontSize: "0.76rem", fontWeight: 700, textAlign: "center",
              lineHeight: 1.2, letterSpacing: "0.01em", maxWidth: "100%", wordBreak: "break-word",
            }}
          >
            {skill.name}
          </motion.div>

          {/* HOVER: expanded details */}
          <motion.div
            animate={{ maxHeight: hovered ? 44 : 0, opacity: hovered ? 1 : 0 }}
            transition={{ duration: 0.25 }}
            style={{ overflow: "hidden", width: "100%" }}
          >
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <div style={{ fontSize: "0.62rem", fontWeight: 700, fontFamily: "monospace", color: cfg.accent }}>
                {pct}% ·{" "}
                {pct >= 90 ? "Expert" : pct >= 75 ? "Advanced" : pct >= 50 ? "Proficient" : "Learning"}
              </div>
              <div style={{ width: "80%", height: 2, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden" }}>
                <motion.div
                  animate={{ width: hovered ? `${pct}%` : "0%" }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  style={{
                    height: "100%",
                    background: `linear-gradient(90deg, ${cfg.gradient[0]}, ${cfg.gradient[1]})`,
                    borderRadius: 2, boxShadow: `0 0 6px ${cfg.accent}`,
                  }}
                />
              </div>
            </div>
          </motion.div>
        </motion.div>
      </TiltCard>
    </motion.div>
  );
}

// ── List row ──────────────────────────────────────────────────────────────
function SkillListRow({
  skill, index, cfg,
}: {
  skill: { name: string; level: number };
  index: number;
  cfg: CategoryConfig;
}) {
  const [hovered, setHovered] = useState(false);
  const pct = skill.level;

  return (
    <motion.div
      initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 30 }}
      transition={{ delay: index * 0.035, duration: 0.35, type: "spring", stiffness: 200 }}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
    >
      <motion.div
        animate={{
          background: hovered ? "rgba(14,12,38,0.92)" : "rgba(10,8,28,0.60)",
          borderColor: hovered ? `${cfg.accent}50` : "rgba(255,255,255,0.06)",
          boxShadow: hovered ? `0 4px 24px ${cfg.glow}, inset 0 1px 0 rgba(255,255,255,0.05)` : "none",
          x: hovered ? 4 : 0,
        }}
        style={{
          border: "1px solid", borderRadius: 12, padding: "0.7rem 1rem",
          display: "flex", alignItems: "center", gap: "0.9rem",
          backdropFilter: "blur(16px)", cursor: "pointer", position: "relative", overflow: "hidden",
        }}
      >
        <motion.div
          initial={{ x: "-100%" }} animate={hovered ? { x: "200%" } : { x: "-100%" }} transition={{ duration: 0.5 }}
          style={{
            position: "absolute", top: 0, bottom: 0, left: 0, width: "40%",
            background: `linear-gradient(90deg, transparent, ${cfg.accent}10, transparent)`, pointerEvents: "none",
          }}
        />
        <TechIcon name={skill.name} size={40} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <motion.div animate={{ color: hovered ? "#f1f5f9" : "#cbd5e1" }} style={{ fontSize: "0.87rem", fontWeight: 700, marginBottom: 2 }}>
            {skill.name}
          </motion.div>
          <div style={{ fontSize: "0.63rem", fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: cfg.accent, opacity: 0.8 }}>
            {pct >= 90 ? "Expert" : pct >= 75 ? "Advanced" : pct >= 50 ? "Proficient" : "Learning"}
          </div>
        </div>
        <div style={{ width: 150, flexShrink: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.63rem", fontWeight: 700, color: "rgba(255,255,255,0.30)", marginBottom: 5 }}>
            <span style={{ color: cfg.accent, fontFamily: "monospace" }}>{pct}%</span>
            <span>100</span>
          </div>
          <div style={{ height: 5, background: "rgba(255,255,255,0.06)", borderRadius: 3, overflow: "hidden" }}>
            <motion.div
              initial={{ width: 0 }} animate={{ width: `${pct}%` }}
              transition={{ delay: index * 0.035 + 0.15, duration: 0.9, ease: "easeOut" }}
              style={{ height: "100%", background: `linear-gradient(90deg, ${cfg.gradient[0]}, ${cfg.gradient[1]})`, borderRadius: 3, boxShadow: `0 0 8px ${cfg.accent}80` }}
            />
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Sidebar tab ───────────────────────────────────────────────────────────
function SideTab({
  cfg, label, count, isActive, onClick, index,
}: {
  cfg: CategoryConfig; label: string; count: number; isActive: boolean; onClick: () => void; index: number;
}) {
  return (
    <motion.button
      initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
      onClick={onClick} whileTap={{ scale: 0.96 }}
      style={{
        width: "100%", textAlign: "left", padding: "0.6rem 0.8rem", borderRadius: 10,
        border: `1px solid ${isActive ? cfg.accent + "50" : "transparent"}`,
        background: isActive ? `linear-gradient(135deg, ${cfg.accent}18, ${cfg.gradient[0]}10)` : "transparent",
        cursor: "pointer", display: "flex", alignItems: "center", gap: "0.6rem",
        position: "relative", overflow: "hidden",
      }}
    >
      {isActive && (
        <motion.div
          layoutId="activeIndicator"
          style={{
            position: "absolute", left: 0, top: "20%", bottom: "20%", width: 3,
            borderRadius: "0 2px 2px 0",
            background: `linear-gradient(180deg, ${cfg.gradient[0]}, ${cfg.gradient[1]})`,
            boxShadow: `0 0 8px ${cfg.accent}`,
          }}
        />
      )}
      <div style={{
        width: 28, height: 28, borderRadius: 7, flexShrink: 0,
        background: isActive ? `linear-gradient(135deg, ${cfg.gradient[0]}, ${cfg.gradient[1]})` : "rgba(255,255,255,0.05)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "0.75rem", color: isActive ? "#fff" : "rgba(255,255,255,0.30)",
        boxShadow: isActive ? `0 2px 10px ${cfg.glow}` : "none", transition: "all 0.2s",
      }}>
        {cfg.icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: "0.75rem", fontWeight: isActive ? 700 : 500,
          color: isActive ? "#f1f5f9" : "#64748b",
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
        }}>
          {label}
        </div>
        <div style={{ fontSize: "0.60rem", color: isActive ? cfg.accent : "#334155", fontFamily: "monospace", fontWeight: 600, marginTop: 1 }}>
          {count} skills
        </div>
      </div>
    </motion.button>
  );
}

// ── Stats strip ───────────────────────────────────────────────────────────
function StatsStrip({ items, cfg }: { items: { name: string; level: number }[]; cfg: CategoryConfig }) {
  const avg = Math.round(items.reduce((a, i) => a + i.level, 0) / Math.max(items.length, 1));
  const experts = items.filter((i) => i.level >= 90).length;
  const advanced = items.filter((i) => i.level >= 75 && i.level < 90).length;
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
      style={{
        display: "flex", gap: "1rem", padding: "0.7rem 1rem",
        background: "rgba(255,255,255,0.025)", borderRadius: 10,
        border: "1px solid rgba(255,255,255,0.06)", backdropFilter: "blur(12px)", flexWrap: "wrap",
      }}
    >
      {[
        { label: "Total", value: items.length, unit: " skills" },
        { label: "Avg Level", value: `${avg}%`, unit: "" },
        { label: "Expert (90%+)", value: experts, unit: "" },
        { label: "Advanced (75%+)", value: advanced, unit: "" },
      ].map((stat) => (
        <div key={stat.label} style={{ display: "flex", flexDirection: "column", gap: 1, minWidth: 60 }}>
          <div style={{ fontSize: "0.60rem", color: "rgba(255,255,255,0.30)", textTransform: "uppercase", letterSpacing: "0.07em", fontWeight: 600 }}>
            {stat.label}
          </div>
          <div style={{
            fontSize: "1.0rem", fontWeight: 800, fontFamily: "monospace",
            background: `linear-gradient(135deg, ${cfg.gradient[0]}, ${cfg.gradient[1]})`,
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>
            {stat.value}{stat.unit}
          </div>
        </div>
      ))}
    </motion.div>
  );
}

// ── Search bar ────────────────────────────────────────────────────────────
function SearchBar({ value, onChange, accent }: { value: string; onChange: (v: string) => void; accent: string }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: "0.6rem",
      background: "rgba(255,255,255,0.04)",
      border: `1px solid ${value ? accent + "60" : "rgba(255,255,255,0.08)"}`,
      borderRadius: 10, padding: "0.5rem 0.85rem", transition: "border-color 0.2s", backdropFilter: "blur(12px)",
    }}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.30)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
        <circle cx="11" cy="11" r="7" />
        <line x1="16.5" y1="16.5" x2="22" y2="22" />
      </svg>
      <input
        value={value} onChange={(e) => onChange(e.target.value)} placeholder="Search skills…"
        style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontSize: "0.82rem", color: "#f1f5f9", fontFamily: "inherit" }}
      />
      {value && (
        <motion.button initial={{ scale: 0 }} animate={{ scale: 1 }} onClick={() => onChange("")}
          style={{ background: "rgba(255,255,255,0.10)", border: "none", borderRadius: 4, padding: "1px 5px", cursor: "pointer", color: "rgba(255,255,255,0.55)", fontSize: "0.7rem" }}>
          ✕
        </motion.button>
      )}
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────
function EmptyState() {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
      style={{ textAlign: "center", padding: "4rem 2rem", color: "rgba(255,255,255,0.2)" }}>
      <div style={{ fontSize: "3rem", marginBottom: "1rem", opacity: 0.4 }}>◎</div>
      <div style={{ fontSize: "0.9rem", fontWeight: 600 }}>No skills match your search</div>
      <div style={{ fontSize: "0.78rem", marginTop: "0.4rem", opacity: 0.6 }}>Try a different keyword</div>
    </motion.div>
  );
}

// ── Skills data ───────────────────────────────────────────────────────────
const MOCK_SKILLS = [
  {
    category: "Programming Languages",
    subcategories: [{
      category: "Programming Languages",
      items: [
        { name: "JavaScript", level: 95 }, { name: "TypeScript", level: 90 }, { name: "Python", level: 80 },
        { name: "Java", level: 90 }, { name: "C++", level: 75 }, { name: "C#", level: 80 },
        { name: "PHP", level: 75 }, { name: "SQL", level: 95 }, { name: "HTML", level: 95 },
        { name: "CSS", level: 90 }, { name: "Kotlin", level: 70 },
      ],
    }],
  },
  {
    category: "Frontend Frameworks & Libraries",
    subcategories: [{
      category: "Frontend Frameworks & Libraries",
      items: [
        { name: "React", level: 95 }, { name: "Next.js", level: 90 }, { name: "Tailwind CSS", level: 90 },
        { name: "Framer Motion", level: 85 }, { name: "Three.js", level: 75 }, { name: "Vite", level: 88 },
        { name: "Angular", level: 60 },
      ],
    }],
  },
  {
    category: "Backend Frameworks & APIs",
    subcategories: [{
      category: "Backend Frameworks & APIs",
      items: [
        { name: "Node.js", level: 95 }, { name: "Express", level: 95 }, { name: "Spring Boot", level: 75 },
        { name: "REST API", level: 95 }, { name: "Socket.io", level: 70 },
      ],
    }],
  },
  {
    category: "Tools & Platforms",
    subcategories: [{
      category: "Tools & Platforms",
      items: [
        { name: "Git", level: 92 }, { name: "GitHub", level: 95 }, { name: "Vercel", level: 88 },
        { name: "Railway", level: 80 }, { name: "Render", level: 70 }, { name: "Jira", level: 85 },
        { name: "Figma", level: 80 }, { name: "Android Studio", level: 70 }, { name: "VS Code", level: 95 },
        { name: "intelliJ IDEA ", level: 80 }, { name: "Unity Hub", level: 75 },
      ],
    }],
  },
  {
    category: "Database",
    subcategories: [{
      category: "Database",
      items: [
        { name: "MongoDB", level: 95 }, { name: "SuperBase", level: 85 },
        { name: "MySQL", level: 78 }, { name: "Firebase", level: 82 },
      ],
    }],
  },
  {
    category: "Mobile Development",
    subcategories: [{
      category: "Mobile Development",
      items: [{ name: "React Native", level: 80 }, { name: "Expo", level: 78 }],
    }],
  },
  {
    category: "DevOps",
    subcategories: [{
      category: "DevOps",
      items: [{ name: "CI/CD", level: 70 }, { name: "Docker", level: 85 }, { name: "kubernetes", level: 80 }],
    }],
  },
  {
    category: "Testing",
    subcategories: [{
      category: "Testing",
      items: [{ name: "Jest", level: 80 }, { name: "Postman", level: 90 }, { name: "Playwright", level: 65 }],
    }],
  },
  {
    category: "AI / ML",
    subcategories: [{
      category: "AI / ML",
      items: [{ name: "Huging Face", level: 72 }, { name: "Gemini API", level: 80 }],
    }],
  },
];

// ── MAIN COMPONENT ────────────────────────────────────────────────────────
export default function SkillsApp() {
  const [mounted, setMounted] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  const allCategories = MOCK_SKILLS.flatMap(
    (s) => s.subcategories?.map((sub) => ({ ...sub, group: s.category })) || [],
  );
  const categoriesWithAll = [
    { category: "All Skills", items: allCategories.flatMap((c) => c.items ?? []) },
    ...allCategories,
  ];
  const current = categoriesWithAll[activeIdx];
  const cfg = getCfg(current?.category ?? "");
  const filteredItems = (current?.items ?? []).filter((sk) =>
    sk.name.toLowerCase().includes(search.toLowerCase()),
  );
  const totalSkills = allCategories.reduce((a, c) => a + (c.items?.length ?? 0), 0);

  return (
    <div style={{
      position: "relative", height: "100%", display: "flex", flexDirection: "column",
      fontFamily: "'Inter', system-ui, sans-serif", overflow: "hidden", background: "#07060f",
    }}>
      <GalaxyBackground accent={cfg.accent} />

      {/* TOPBAR */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
        style={{
          position: "relative", zIndex: 10, padding: "0.85rem 1.2rem 0.7rem",
          borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(7,6,15,0.85)",
          backdropFilter: "blur(24px)", display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.7rem", flex: 1, minWidth: 200 }}>
          <motion.div
            animate={{ boxShadow: [`0 0 0px ${cfg.accent}00`, `0 0 20px ${cfg.accent}70`, `0 0 0px ${cfg.accent}00`] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            style={{
              width: 34, height: 34, borderRadius: 9, flexShrink: 0,
              background: `linear-gradient(135deg, ${cfg.gradient[0]}, ${cfg.gradient[1]})`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
          </motion.div>
          <div>
            <motion.div
              key={current?.category} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}
              style={{ fontSize: "1.0rem", fontWeight: 800, color: "#f1f5f9", letterSpacing: "-0.02em" }}
            >
              Skill Matrix
            </motion.div>
            <div style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.28)", fontFamily: "monospace", fontWeight: 600 }}>
              {categoriesWithAll.length - 1} categories · {totalSkills} skills
            </div>
          </div>
        </div>
        <div style={{ flex: 1, maxWidth: 270 }}>
          <SearchBar value={search} onChange={(v) => { setSearch(v); }} accent={cfg.accent} />
        </div>
        <div style={{ display: "flex", gap: "3px", padding: "3px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 9 }}>
          {(["grid", "list"] as const).map((mode) => (
            <motion.button key={mode} onClick={() => setViewMode(mode)}
              animate={{ background: viewMode === mode ? `${cfg.accent}22` : "transparent", color: viewMode === mode ? cfg.accent : "rgba(255,255,255,0.30)" }}
              whileTap={{ scale: 0.92 }}
              style={{ border: viewMode === mode ? `1px solid ${cfg.accent}40` : "1px solid transparent", borderRadius: 6, padding: "0.32rem 0.65rem", cursor: "pointer", fontSize: "0.70rem", fontWeight: 700 }}>
              {mode === "grid" ? "⊞ Grid" : "☰ List"}
            </motion.button>
          ))}
        </div>
        <motion.button onClick={() => setSidebarOpen((v) => !v)} whileTap={{ scale: 0.9 }}
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: "0.38rem 0.65rem", color: "rgba(255,255,255,0.45)", cursor: "pointer", fontSize: "0.8rem" }}>
          {sidebarOpen ? "◀" : "▶"}
        </motion.button>
      </motion.div>

      {/* BODY */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden", position: "relative", zIndex: 5 }}>
        <AnimatePresence initial={false}>
          {sidebarOpen && (
            <motion.div key="sidebar" initial={{ width: 0, opacity: 0 }} animate={{ width: 196, opacity: 1 }} exit={{ width: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 28 }}
              style={{ flexShrink: 0, overflow: "hidden", borderRight: "1px solid rgba(255,255,255,0.05)", background: "rgba(7,6,15,0.72)", backdropFilter: "blur(24px)" }}>
              <div style={{ width: 196, height: "100%", overflowY: "auto", padding: "0.8rem 0.6rem", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                <div style={{ fontSize: "0.60rem", fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase", color: "rgba(255,255,255,0.18)", padding: "0 0.35rem 0.5rem", borderBottom: "1px solid rgba(255,255,255,0.05)", marginBottom: "0.35rem" }}>
                  Categories
                </div>
                {categoriesWithAll.map((cat, i) => (
                  <SideTab
                    key={cat.category} cfg={getCfg(cat.category)} label={getCfg(cat.category).label}
                    count={cat.items?.length ?? 0} isActive={activeIdx === i}
                    onClick={() => { setActiveIdx(i); setSearch(""); }} index={i}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div style={{ flex: 1, overflowY: "auto", padding: "1.2rem 1.4rem" }}>
          <AnimatePresence mode="wait">
            <motion.div key={current?.category} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }}>
              <div style={{ marginBottom: "1.2rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.85rem", marginBottom: "0.85rem" }}>
                  <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 300 }}
                    style={{ width: 42, height: 42, borderRadius: 11, flexShrink: 0, background: `linear-gradient(135deg, ${cfg.gradient[0]}, ${cfg.gradient[1]})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem", boxShadow: `0 4px 20px ${cfg.glow}` }}>
                    {cfg.icon}
                  </motion.div>
                  <div>
                    <motion.div initial={{ x: -10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} style={{ fontSize: "1.15rem", fontWeight: 800, color: "#f1f5f9", letterSpacing: "-0.025em" }}>
                      {current?.category}
                    </motion.div>
                    <motion.div initial={{ x: -10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.05 }}
                      style={{ fontSize: "0.70rem", color: "rgba(255,255,255,0.28)", fontFamily: "monospace", fontWeight: 600, marginTop: 2 }}>
                      {filteredItems.length} of {current?.items?.length ?? 0} skills{search && ` matching "${search}"`}
                    </motion.div>
                  </div>
                  <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
                    style={{ flex: 1, height: 1, transformOrigin: "left", background: `linear-gradient(90deg, ${cfg.accent}50, transparent)` }} />
                </div>
                {current?.items && <StatsStrip items={current.items} cfg={cfg} />}
              </div>

              {filteredItems.length === 0 ? (
                <EmptyState />
              ) : viewMode === "grid" ? (
                <motion.div layout style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(126px, 1fr))", gap: "0.8rem" }}>
                  <AnimatePresence>
                    {filteredItems.map((sk, i) => <SkillCard key={sk.name} skill={sk} index={i} cfg={cfg} viewMode={viewMode} />)}
                  </AnimatePresence>
                </motion.div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <AnimatePresence>
                    {filteredItems.map((sk, i) => <SkillListRow key={sk.name} skill={sk} index={i} cfg={cfg} />)}
                  </AnimatePresence>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* STATUS BAR */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        style={{
          position: "relative", zIndex: 10, padding: "0.38rem 1.2rem",
          borderTop: "1px solid rgba(255,255,255,0.05)", background: "rgba(5,4,12,0.88)",
          backdropFilter: "blur(20px)", display: "flex", alignItems: "center", gap: "1.4rem",
          fontSize: "0.63rem", color: "rgba(255,255,255,0.22)", fontFamily: "monospace", fontWeight: 600, letterSpacing: "0.04em",
        }}
      >
        <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.8, repeat: Infinity }}
          style={{ width: 6, height: 6, borderRadius: "50%", background: cfg.accent, boxShadow: `0 0 6px ${cfg.accent}`, flexShrink: 0 }} />
        <span style={{ color: cfg.accent }}>{getCfg(current?.category ?? "").label}</span>
        <span>·</span>
        <span>{filteredItems.length} skills displayed</span>
        <span>·</span>
        <span>VIEW: {viewMode.toUpperCase()}</span>
        <div style={{ marginLeft: "auto" }}>SKILLS_MATRIX v3.0 · {new Date().getFullYear()}</div>
      </motion.div>
    </div>
  );
}