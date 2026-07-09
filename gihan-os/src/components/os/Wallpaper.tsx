"use client";

import { useEffect, useRef, memo } from "react";
import type { WallpaperId } from "@/types/os";
import { useOS } from "@/contexts/OSContext";

// ─── Wallpaper meta ────────────────────────────────────────────────────────────
export const GALAXY_WALLPAPERS: Record<
  WallpaperId,
  { label: string; preview: string; bgColor: string }
> = {
  starfield: { label: "Starfield", preview: "from-slate-950 to-blue-950", bgColor: "#020510" },
  nebula_pulse: { label: "Nebula Pulse", preview: "from-purple-950 to-fuchsia-900", bgColor: "#0d0012" },
  black_hole: { label: "Black Hole", preview: "from-gray-950 to-orange-950", bgColor: "#060203" },
  cosmic_dust: { label: "Cosmic Dust", preview: "from-indigo-950 to-cyan-950", bgColor: "#01060f" },
  aurora_galaxy: { label: "Aurora Galaxy", preview: "from-teal-950 to-emerald-950", bgColor: "#020e0a" },
};

// ─── Shared hover tracking ─────────────────────────────────────────────────────
// Every wallpaper reads a smoothed 0..1 `intensity` (eases toward 1 while
// hovered, back to 0 on leave) plus normalized cursor x/y, and reacts in its
// own thematic way.
type HoverState = {
  x: number;
  y: number;
  intensity: number;
  targetIntensity: number;
};

function createHoverState(): HoverState {
  return { x: 0.5, y: 0.5, intensity: 0, targetIntensity: 0 };
}

function attachHoverListeners(canvas: HTMLCanvasElement, state: HoverState, isAppOpenRef?: React.MutableRefObject<boolean>) {
  const updatePos = (e: PointerEvent) => {
    if (isAppOpenRef && isAppOpenRef.current) {
      state.targetIntensity = 0;
      return;
    }
    state.x = e.clientX / window.innerWidth;
    state.y = e.clientY / window.innerHeight;
    state.targetIntensity = 1;
  };
  const onLeave = () => { state.targetIntensity = 0; };

  window.addEventListener("pointermove", updatePos);
  window.addEventListener("pointerdown", updatePos);
  document.addEventListener("mouseleave", onLeave);

  return () => {
    window.removeEventListener("pointermove", updatePos);
    window.removeEventListener("pointerdown", updatePos);
    document.removeEventListener("mouseleave", onLeave);
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
//  1.  STARFIELD — warp-speed 3-D parallax, steers toward cursor on hover
// ═══════════════════════════════════════════════════════════════════════════════
const StarfieldWallpaper = memo(function StarfieldWallpaper({ isAppOpenRef }: { isAppOpenRef: React.MutableRefObject<boolean> }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const NUM_STARS = 600;
    const MAX_DEPTH = 1400;
    const BASE_SPEED = 3.5;

    let W = (canvas.width = window.innerWidth);
    let H = (canvas.height = window.innerHeight);

    type Star = { x: number; y: number; z: number; px: number; py: number };
    const stars: Star[] = Array.from({ length: NUM_STARS }, () => ({
      x: Math.random() * W - W / 2,
      y: Math.random() * H - H / 2,
      z: Math.random() * MAX_DEPTH,
      px: 0,
      py: 0,
    }));

    const onResize = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", onResize);

    const hover = createHoverState();
    const detachHover = attachHoverListeners(canvas, hover, isAppOpenRef);

    let raf: number;
    const draw = () => {
      hover.intensity += (hover.targetIntensity - hover.intensity) * 0.06;
      const SPEED = BASE_SPEED + hover.intensity * 4.5;
      // Steer the vanishing point toward the cursor — feels like piloting through the field
      const cx = W / 2 + (hover.x - 0.5) * 2 * hover.intensity * 140;
      const cy = H / 2 + (hover.y - 0.5) * 2 * hover.intensity * 140;

      ctx.fillStyle = "rgba(2,5,16,0.4)";
      ctx.fillRect(0, 0, W, H);

      for (const star of stars) {
        star.px = (star.x / star.z) * MAX_DEPTH + cx;
        star.py = (star.y / star.z) * MAX_DEPTH + cy;

        star.z -= SPEED;
        if (star.z <= 0) {
          star.x = Math.random() * W - W / 2;
          star.y = Math.random() * H - H / 2;
          star.z = MAX_DEPTH;
          star.px = (star.x / star.z) * MAX_DEPTH + cx;
          star.py = (star.y / star.z) * MAX_DEPTH + cy;
        }

        const nx = (star.x / star.z) * MAX_DEPTH + cx;
        const ny = (star.y / star.z) * MAX_DEPTH + cy;
        const size = Math.max(0.3, ((MAX_DEPTH - star.z) / MAX_DEPTH) * 3.5);
        const brightness = ((MAX_DEPTH - star.z) / MAX_DEPTH) * (1 + hover.intensity * 0.25);

        const r = Math.round(180 + brightness * 75);
        const g = Math.round(200 + brightness * 55);
        const b = 255;

        ctx.beginPath();
        ctx.strokeStyle = `rgba(${r},${g},${b},${Math.min(1, brightness) * 0.9})`;
        ctx.lineWidth = size;
        ctx.moveTo(star.px, star.py);
        ctx.lineTo(nx, ny);
        ctx.stroke();

        star.px = nx;
        star.py = ny;
      }

      const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(W, H) * 0.7);
      grd.addColorStop(0, "transparent");
      grd.addColorStop(1, "rgba(2,5,16,0.55)");
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, W, H);

      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      detachHover();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ background: "#020510" }}
    />
  );
});

// ═══════════════════════════════════════════════════════════════════════════════
//  2.  SPIRAL GALAXY (nebula_pulse) — pulsing core, orbiting nebula, spiral dust arms
// ═══════════════════════════════════════════════════════════════════════════════
const NebulaPulseWallpaper = memo(function NebulaPulseWallpaper({ isAppOpenRef }: { isAppOpenRef: React.MutableRefObject<boolean> }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let W = (canvas.width = window.innerWidth);
    let H = (canvas.height = window.innerHeight);
    let t = 0;

    const onResize = () => { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; };
    window.addEventListener("resize", onResize);

    const hover = createHoverState();
    const detachHover = attachHoverListeners(canvas, hover, isAppOpenRef);

    // Background twinkle field
    const NUM_STARS = 400;
    const stars = Array.from({ length: NUM_STARS }, () => ({
      x: Math.random(), y: Math.random(),
      r: Math.random() * 1.4 + 0.3,
      a: Math.random() * 0.8 + 0.2,
      twinkle: Math.random() * Math.PI * 2,
    }));

    // Nebula gas clouds, slowly orbiting the core
    const clouds = Array.from({ length: 6 }, (_, i) => ({
      orbitR: 0.18 + i * 0.075,
      angle: (i / 6) * Math.PI * 2,
      speed: 0.05 + Math.random() * 0.03,
      r: 0.30 + Math.random() * 0.18,
      hue: 275 + i * 14,
      sat: 75 + Math.random() * 15,
      alpha: 0.22 + Math.random() * 0.10,
    }));

    // Spiral-arm dust
    const NUM_DUST = 900;
    const ARMS = 2;
    const dust = Array.from({ length: NUM_DUST }, () => {
      const arm = Math.floor(Math.random() * ARMS);
      const dist = 30 + Math.pow(Math.random(), 0.55) * Math.min(W, H) * 0.46;
      return {
        arm,
        armAngle: (arm / ARMS) * Math.PI * 2,
        dist,
        vAng: (0.05 + Math.random() * 0.10) / Math.max(1, dist / 90),
        hue: 280 + Math.random() * 70,
        size: 0.5 + Math.random() * 1.8,
        alpha: 0.35 + Math.random() * 0.5,
      };
    });

    let raf: number;
    const draw = () => {
      t += 0.006;
      hover.intensity += (hover.targetIntensity - hover.intensity) * 0.06;
      const rotSpeed = 1 + hover.intensity * 1.8;
      const cx = W / 2, cy = H / 2;
      const mx = hover.x * W, my = hover.y * H;

      ctx.fillStyle = "#0d0012";
      ctx.fillRect(0, 0, W, H);

      for (const s of stars) {
        const ta = s.a * (0.6 + 0.4 * Math.sin(t * 45 + s.twinkle));
        ctx.beginPath();
        ctx.arc(s.x * W, s.y * H, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(230,220,255,${ta})`;
        ctx.fill();
      }

      // Orbiting nebula clouds
      for (let i = 0; i < clouds.length; i++) {
        const c = clouds[i];
        const angle = c.angle + t * c.speed * rotSpeed;
        const orbitPx = c.orbitR * Math.min(W, H);
        const px = cx + Math.cos(angle) * orbitPx;
        const py = cy + Math.sin(angle) * orbitPx * 0.55;
        const pulse = 1 + 0.15 * Math.sin(t * 8 + i * 1.4);
        const radius = c.r * Math.min(W, H) * pulse;
        const alphaM = c.alpha * (0.8 + 0.2 * Math.sin(t * 6 + i)) * (1 + hover.intensity * 0.3);

        const grd = ctx.createRadialGradient(px, py, 0, px, py, radius);
        grd.addColorStop(0, `hsla(${c.hue},${c.sat}%,72%,${alphaM})`);
        grd.addColorStop(0.45, `hsla(${c.hue + 20},${c.sat - 10}%,50%,${alphaM * 0.45})`);
        grd.addColorStop(1, "transparent");
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, W, H);
      }

      // Spiral arm dust — pulled gently toward the cursor
      for (const d of dust) {
        const spiralOffset = d.dist * 0.01;
        const angle = d.armAngle + spiralOffset + t * d.vAng * rotSpeed;
        let px = cx + Math.cos(angle) * d.dist;
        let py = cy + Math.sin(angle) * d.dist * 0.5;

        if (hover.intensity > 0.01) {
          const dx = mx - px, dy = my - py;
          const dist2 = Math.sqrt(dx * dx + dy * dy);
          if (dist2 < 180) {
            const pull = (1 - dist2 / 180) * hover.intensity * 14;
            px += (dx / (dist2 || 1)) * pull;
            py += (dy / (dist2 || 1)) * pull;
          }
        }

        const pulse = 0.85 + 0.15 * Math.sin(t * 10 + d.dist * 0.05);
        ctx.beginPath();
        ctx.arc(px, py, d.size * pulse, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${d.hue},85%,75%,${d.alpha * pulse})`;
        ctx.fill();
      }

      // Galactic core — heartbeat pulse + rotating soft rays
      const corePulse = 1 + (0.12 + hover.intensity * 0.15) * Math.sin(t * (6 + hover.intensity * 6));
      const coreR = 46 * corePulse;

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(t * 0.15);
      ctx.globalCompositeOperation = "lighter";
      for (let r = 0; r < 4; r++) {
        ctx.save();
        ctx.rotate((r / 4) * Math.PI * 2);
        const rayGrd = ctx.createLinearGradient(0, 0, 0, -coreR * 5);
        rayGrd.addColorStop(0, `hsla(300,90%,85%,${0.10 + hover.intensity * 0.08})`);
        rayGrd.addColorStop(1, "transparent");
        ctx.fillStyle = rayGrd;
        ctx.fillRect(-coreR * 0.35, -coreR * 5, coreR * 0.7, coreR * 5);
        ctx.restore();
      }
      ctx.restore();

      const coreGrd = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreR);
      coreGrd.addColorStop(0, "rgba(255,240,255,0.95)");
      coreGrd.addColorStop(0.3, "rgba(230,170,255,0.7)");
      coreGrd.addColorStop(1, "transparent");
      ctx.fillStyle = coreGrd;
      ctx.beginPath();
      ctx.arc(cx, cy, coreR, 0, Math.PI * 2);
      ctx.fill();

      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      detachHover();
    };
  }, []);

  return (
    <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ background: "#0d0012" }} />
  );
});

// ═══════════════════════════════════════════════════════════════════════════════
//  3.  BLACK HOLE — accretion disc particle system, warps toward cursor on hover
// ═══════════════════════════════════════════════════════════════════════════════
const BlackHoleWallpaper = memo(function BlackHoleWallpaper({ isAppOpenRef }: { isAppOpenRef: React.MutableRefObject<boolean> }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let W = (canvas.width = window.innerWidth);
    let H = (canvas.height = window.innerHeight);

    const onResize = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", onResize);

    const hover = createHoverState();
    const detachHover = attachHoverListeners(canvas, hover, isAppOpenRef);

    const NUM = 1200;
    const BH_R = 54;

    type Particle = {
      angle: number; angularSpeed: number;
      radius: number; baseR: number;
      life: number; maxLife: number;
      hue: number; size: number;
    };

    const particles: Particle[] = Array.from({ length: NUM }, () => {
      const baseR = BH_R + 40 + Math.random() * Math.min(W, H) * 0.38;
      const ml = 200 + Math.random() * 600;
      return {
        angle: Math.random() * Math.PI * 2,
        angularSpeed: (0.003 + Math.random() * 0.006) * (Math.random() < 0.5 ? 1 : -0.3),
        radius: baseR,
        baseR,
        life: Math.random() * ml,
        maxLife: ml,
        hue: 20 + Math.random() * 40,
        size: 0.8 + Math.random() * 2,
      };
    });

    const outerRing: Particle[] = Array.from({ length: 200 }, () => {
      const baseR = BH_R + Math.min(W, H) * 0.42 + Math.random() * Math.min(W, H) * 0.15;
      const ml = 300 + Math.random() * 400;
      return {
        angle: Math.random() * Math.PI * 2,
        angularSpeed: 0.001 + Math.random() * 0.002,
        radius: baseR,
        baseR,
        life: Math.random() * ml,
        maxLife: ml,
        hue: 200 + Math.random() * 40,
        size: 0.5 + Math.random() * 1.2,
      };
    });

    const bgStars = Array.from({ length: 200 }, () => ({
      x: Math.random(), y: Math.random(),
      r: Math.random() * 1.2,
      a: Math.random() * 0.5 + 0.1,
    }));

    let t = 0;
    let raf: number;

    const draw = () => {
      t += 1;
      hover.intensity += (hover.targetIntensity - hover.intensity) * 0.06;
      const cx = W / 2, cy = H / 2;
      const mx = hover.x * W, my = hover.y * H;

      ctx.fillStyle = "rgba(6,2,3,0.25)";
      ctx.fillRect(0, 0, W, H);

      const lensGrd = ctx.createRadialGradient(cx, cy, BH_R * 0.8, cx, cy, BH_R * 3.5);
      lensGrd.addColorStop(0, `rgba(255,200,80,${0.14 + hover.intensity * 0.10})`);
      lensGrd.addColorStop(0.4, `rgba(255,100,20,${0.08 + hover.intensity * 0.06})`);
      lensGrd.addColorStop(1, "transparent");
      ctx.fillStyle = lensGrd;
      ctx.fillRect(0, 0, W, H);

      for (const p of outerRing) {
        p.angle += p.angularSpeed * (1 + hover.intensity * 1.4);
        p.life -= 0.5;
        if (p.life <= 0) { p.life = p.maxLife; p.angle = Math.random() * Math.PI * 2; }
        const progress = p.life / p.maxLife;
        const spiral = p.baseR * (0.85 + 0.15 * progress);
        const px = cx + Math.cos(p.angle) * spiral * 1.6;
        const py = cy + Math.sin(p.angle) * spiral * 0.4;
        ctx.beginPath();
        ctx.arc(px, py, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue},70%,80%,${progress * 0.5})`;
        ctx.fill();
      }

      for (const p of particles) {
        p.angle += p.angularSpeed * (1 + hover.intensity * 1.6);
        p.radius = p.baseR * (0.92 + 0.08 * Math.sin(t * 0.02 + p.angle));
        p.life -= 1;
        if (p.life <= 0) {
          p.life = p.maxLife;
          p.baseR = BH_R + 40 + Math.random() * Math.min(W, H) * 0.38;
          p.radius = p.baseR;
          p.angle = Math.random() * Math.PI * 2;
        }
        const progress = p.life / p.maxLife;
        const distRatio = p.radius / (Math.min(W, H) * 0.5);
        const heat = Math.min(1, 1.2 - distRatio);
        const hue = p.hue + heat * 30;
        const sat = 80 + heat * 20;
        const lgt = 55 + heat * 30;

        let px = cx + Math.cos(p.angle) * p.radius;
        let py = cy + Math.sin(p.angle) * p.radius * 0.28;

        // Cursor warps nearby particles inward, like a passing gravity well
        if (hover.intensity > 0.01) {
          const dx = mx - px, dy = my - py;
          const dist2 = Math.sqrt(dx * dx + dy * dy);
          if (dist2 < 160) {
            const pull = (1 - dist2 / 160) * hover.intensity * 10;
            px += (dx / (dist2 || 1)) * pull;
            py += (dy / (dist2 || 1)) * pull;
          }
        }

        ctx.beginPath();
        ctx.arc(px, py, p.size * (0.6 + heat * 0.8), 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${hue},${sat}%,${lgt}%,${progress * 0.85})`;
        ctx.fill();
      }

      // Event horizon
      ctx.save();
      const bhGrd = ctx.createRadialGradient(cx, cy, 0, cx, cy, BH_R * 1.6);
      bhGrd.addColorStop(0, "#000000");
      bhGrd.addColorStop(0.6, "#000000");
      bhGrd.addColorStop(0.85, "rgba(0,0,0,0.7)");
      bhGrd.addColorStop(1, "transparent");
      ctx.fillStyle = bhGrd;
      ctx.beginPath();
      ctx.arc(cx, cy, BH_R * 1.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Photon ring — flares brighter on hover
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, BH_R * 1.05, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255,200,120,${0.12 + hover.intensity * 0.55})`;
      ctx.lineWidth = 2 + hover.intensity * 2.5;
      ctx.shadowColor = "rgba(255,180,80,0.8)";
      ctx.shadowBlur = 10 + hover.intensity * 20;
      ctx.stroke();
      ctx.restore();

      for (const s of bgStars) {
        ctx.beginPath();
        ctx.arc(s.x * W, s.y * H, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${s.a})`;
        ctx.fill();
      }

      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      detachHover();
    };
  }, []);

  return (
    <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ background: "#060203" }} />
  );
});

// ═══════════════════════════════════════════════════════════════════════════════
//  4.  COSMIC DUST — galaxy-arm spiral drift, scatters like solar wind on hover
// ═══════════════════════════════════════════════════════════════════════════════
const CosmicDustWallpaper = memo(function CosmicDustWallpaper({ isAppOpenRef }: { isAppOpenRef: React.MutableRefObject<boolean> }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let W = (canvas.width = window.innerWidth);
    let H = (canvas.height = window.innerHeight);

    const onResize = () => { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; };
    window.addEventListener("resize", onResize);

    const hover = createHoverState();
    const detachHover = attachHoverListeners(canvas, hover, isAppOpenRef);

    const NUM = 2500;
    const NUM_ARMS = 3;

    type Dust = {
      arm: number; armAngle: number; dist: number;
      vAng: number;
      hue: number; size: number; alpha: number;
    };

    const dust: Dust[] = Array.from({ length: NUM }, () => {
      const arm = Math.floor(Math.random() * NUM_ARMS);
      const dist = 40 + Math.pow(Math.random(), 0.6) * Math.min(W, H) * 0.48;
      return {
        arm,
        armAngle: (arm / NUM_ARMS) * Math.PI * 2,
        dist,
        vAng: (0.0003 + Math.random() * 0.0006) / Math.max(1, dist / 120),
        hue: 190 + Math.random() * 80,
        size: 0.5 + Math.random() * 2.2,
        alpha: 0.3 + Math.random() * 0.6,
      };
    });

    let t = 0;
    let raf: number;

    const draw = () => {
      t += 1;
      hover.intensity += (hover.targetIntensity - hover.intensity) * 0.06;
      const cx = W / 2, cy = H / 2;
      const mx = hover.x * W, my = hover.y * H;

      ctx.fillStyle = "rgba(1,6,15,0.18)";
      ctx.fillRect(0, 0, W, H);

      const coreGrd = ctx.createRadialGradient(cx, cy, 0, cx, cy, 160);
      coreGrd.addColorStop(0, "rgba(160,200,255,0.22)");
      coreGrd.addColorStop(0.35, "rgba(80,130,220,0.10)");
      coreGrd.addColorStop(1, "transparent");
      ctx.fillStyle = coreGrd;
      ctx.fillRect(0, 0, W, H);

      for (const d of dust) {
        const spiralOffset = d.dist * 0.009;
        const angle = d.armAngle + spiralOffset + t * d.vAng * (1 + hover.intensity * 1.3);
        const scatter = (d.dist / Math.min(W, H)) * 35;
        const scatterX = Math.sin(t * 0.007 + d.dist) * scatter;
        const scatterY = Math.cos(t * 0.009 + d.dist * 1.3) * scatter;

        let px = cx + Math.cos(angle) * d.dist + scatterX;
        let py = cy + Math.sin(angle) * d.dist * 0.55 + scatterY;
        let alphaBoost = 1;

        // Cursor acts like solar wind, scattering nearby dust outward
        if (hover.intensity > 0.01) {
          const dx = px - mx, dy = py - my;
          const dist2 = Math.sqrt(dx * dx + dy * dy);
          if (dist2 < 150) {
            const push = (1 - dist2 / 150) * hover.intensity * 22;
            px += (dx / (dist2 || 1)) * push;
            py += (dy / (dist2 || 1)) * push;
            alphaBoost = 1 + (1 - dist2 / 150) * hover.intensity * 0.8;
          }
        }

        const pulse = 0.8 + 0.2 * Math.sin(t * 0.05 + d.dist * 0.08);
        ctx.beginPath();
        ctx.arc(px, py, d.size * pulse, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${d.hue},85%,72%,${Math.min(1, d.alpha * pulse * alphaBoost)})`;
        ctx.fill();
      }

      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", onResize); detachHover(); };
  }, []);

  return (
    <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ background: "#01060f" }} />
  );
});

// ═══════════════════════════════════════════════════════════════════════════════
//  5.  AURORA GALAXY — vertical rippling light curtains, flare near cursor
// ═══════════════════════════════════════════════════════════════════════════════
const AuroraGalaxyWallpaper = memo(function AuroraGalaxyWallpaper({ isAppOpenRef }: { isAppOpenRef: React.MutableRefObject<boolean> }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let W = (canvas.width = window.innerWidth);
    let H = (canvas.height = window.innerHeight);

    const onResize = () => { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; };
    window.addEventListener("resize", onResize);

    const hover = createHoverState();
    const detachHover = attachHoverListeners(canvas, hover, isAppOpenRef);

    const NUM_CURTAINS = 8;
    const NUM_STARS = 300;

    const curtains = Array.from({ length: NUM_CURTAINS }, (_, i) => ({
      xBase: (i / (NUM_CURTAINS - 1)) * 1.1 - 0.05,
      hue: 140 + (i / NUM_CURTAINS) * 160,
      phase: Math.random() * Math.PI * 2,
      speed: 0.006 + Math.random() * 0.005,
      width: 0.1 + Math.random() * 0.14,
      amplitude: 0.04 + Math.random() * 0.05,
    }));

    const stars = Array.from({ length: NUM_STARS }, () => ({
      x: Math.random(), y: Math.random() * 0.5,
      r: Math.random() * 1.3 + 0.2,
      a: Math.random() * 0.7 + 0.1,
    }));

    let t = 0;
    let raf: number;

    const draw = () => {
      t += 1;
      hover.intensity += (hover.targetIntensity - hover.intensity) * 0.06;
      const mxPix = hover.x * W;

      ctx.clearRect(0, 0, W, H);

      const bgGrd = ctx.createLinearGradient(0, 0, 0, H);
      bgGrd.addColorStop(0, "#000d06");
      bgGrd.addColorStop(0.5, "#010e0a");
      bgGrd.addColorStop(1, "#020a08");
      ctx.fillStyle = bgGrd;
      ctx.fillRect(0, 0, W, H);

      for (const s of stars) {
        ctx.beginPath();
        ctx.arc(s.x * W, s.y * H, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(230,255,240,${s.a})`;
        ctx.fill();
      }

      ctx.globalCompositeOperation = "lighter";
      for (const c of curtains) {
        const xCenter = c.xBase * W + Math.sin(t * c.speed + c.phase) * c.amplitude * W;

        // Curtains nearest the cursor flare brighter and ripple wider
        const proximity = Math.max(0, 1 - Math.abs(xCenter - mxPix) / (W * 0.35));
        const hoverBoost = hover.intensity * proximity;

        const halfW = c.width * W * 0.5 * (1 + hoverBoost * 0.5);

        const SEGMENTS = 40;
        for (let seg = 0; seg < SEGMENTS; seg++) {
          const y0 = (seg / SEGMENTS) * H;
          const y1 = ((seg + 1) / SEGMENTS) * H;
          const yRatio = seg / SEGMENTS;

          const ripple = Math.sin(t * c.speed * (1.5 + hoverBoost * 1.5) + yRatio * 8 + c.phase) * W * 0.015;
          const xLeft = xCenter - halfW + ripple;
          const xRight = xCenter + halfW + ripple;

          const fade =
            yRatio < 0.15 ? yRatio / 0.15
              : yRatio > 0.85 ? (1 - yRatio) / 0.15
                : 1;

          const alpha = (0.06 + 0.10 * Math.abs(Math.sin(t * c.speed * 0.7 + yRatio * 3))) * (1 + hoverBoost * 1.6);

          const grd = ctx.createLinearGradient(xLeft, 0, xRight, 0);
          grd.addColorStop(0, "transparent");
          grd.addColorStop(0.25, `hsla(${c.hue},100%,65%,${alpha * fade * 0.6})`);
          grd.addColorStop(0.5, `hsla(${c.hue + 20},100%,75%,${alpha * fade})`);
          grd.addColorStop(0.75, `hsla(${c.hue},100%,65%,${alpha * fade * 0.6})`);
          grd.addColorStop(1, "transparent");

          ctx.fillStyle = grd;
          ctx.fillRect(xLeft - halfW * 0.4, y0, (xRight - xLeft) + halfW * 0.8, y1 - y0 + 1);
        }
      }
      ctx.globalCompositeOperation = "source-over";

      const groundGrd = ctx.createLinearGradient(0, H * 0.75, 0, H);
      groundGrd.addColorStop(0, "transparent");
      groundGrd.addColorStop(1, "rgba(0,40,20,0.25)");
      ctx.fillStyle = groundGrd;
      ctx.fillRect(0, 0, W, H);

      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", onResize); detachHover(); };
  }, []);

  return (
    <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ background: "#020e0a" }} />
  );
});

// ═══════════════════════════════════════════════════════════════════════════════
//  Root export — picks the right scene
// ═══════════════════════════════════════════════════════════════════════════════
interface Props {
  id: WallpaperId;
}

export default function Wallpaper({ id }: Props) {
  const { windows, startMenuOpen } = useOS();

  const isAppOpenRef = useRef(windows.length > 0 || startMenuOpen);
  useEffect(() => {
    isAppOpenRef.current = windows.length > 0 || startMenuOpen;
  }, [windows.length, startMenuOpen]);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {id === "starfield" && <StarfieldWallpaper isAppOpenRef={isAppOpenRef} />}
      {id === "nebula_pulse" && <NebulaPulseWallpaper isAppOpenRef={isAppOpenRef} />}
      {id === "black_hole" && <BlackHoleWallpaper isAppOpenRef={isAppOpenRef} />}
      {id === "cosmic_dust" && <CosmicDustWallpaper isAppOpenRef={isAppOpenRef} />}
      {id === "aurora_galaxy" && <AuroraGalaxyWallpaper isAppOpenRef={isAppOpenRef} />}
    </div>
  );
}