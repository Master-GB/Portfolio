"use client";

import { useEffect, useRef } from "react";
import {
    motion,
    MotionConfig,
    useMotionValue,
    useSpring,
    useReducedMotion,
} from "framer-motion";

/**
 * Galaxy-themed animated backdrop for the contact panel — shader edition.
 *
 * The previous version stacked ~8 blurred conic/radial <div>s to fake a
 * nebula. This version renders one fullscreen WebGL fragment shader —
 * a domain-warped fractal-noise flow field — which reads as genuinely
 * volumetric/fluid instead of flat blurred blobs, animates smoother at
 * a fraction of the paint cost, and gently parallaxes with the pointer.
 * That shader is the one bold, signature element.
 *
 * Everything else is deliberately quiet on top of it: tilted "orbit"
 * rings carrying comet trails, a pulsing uplink core with a scanning
 * halo and ping rings, a faint perspective HUD floor grid, and a
 * cursor-following glow. Still no literal star shapes or twinkling dot
 * fields — that was intentional before and still is.
 *
 * Palette matches the terminal-bot scene (STATE_COLORS idle/typing):
 * indigo #7c89ff, cyan #4eeaff, violet #a78bfa.
 *
 * Respects prefers-reduced-motion: the shader renders a single static
 * frame and every looping DOM animation is switched off.
 */

/* ---------------------------- shader source ---------------------------- */

const VERTEX_SRC = `
  attribute vec2 aPosition;
  varying vec2 vUv;
  void main() {
    vUv = aPosition * 0.5 + 0.5;
    gl_Position = vec4(aPosition, 0.0, 1.0);
  }
`;

const FRAGMENT_SRC = `
  precision highp float;
  varying vec2 vUv;
  uniform vec2 uResolution;
  uniform float uTime;
  uniform vec2 uMouse;

  vec2 hash(vec2 p) {
    p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
    return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
  }

  float noise(vec2 p) {
    const float K1 = 0.366025404; // (sqrt(3)-1)/2
    const float K2 = 0.211324865; // (3-sqrt(3))/6
    vec2 i = floor(p + (p.x + p.y) * K1);
    vec2 a = p - i + (i.x + i.y) * K2;
    vec2 o = (a.x > a.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec2 b = a - o + K2;
    vec2 c = a - 1.0 + 2.0 * K2;
    vec3 h = max(0.5 - vec3(dot(a, a), dot(b, b), dot(c, c)), 0.0);
    vec3 n = h * h * h * h * vec3(dot(a, hash(i)), dot(b, hash(i + o)), dot(c, hash(i + 1.0)));
    return dot(n, vec3(70.0));
  }

  float fbm(vec2 p) {
    float f = 0.0;
    float amp = 0.5;
    mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
    for (int i = 0; i < 5; i++) {
      f += amp * noise(p);
      p = m * p;
      amp *= 0.5;
    }
    return f;
  }

  void main() {
    vec2 uv = vUv;
    vec2 p = (gl_FragCoord.xy - 0.5 * uResolution) / uResolution.y;
    p += uMouse * 0.05;

    float t = uTime * 0.045;

    // domain warp: flow-field noise feeding into itself, twice
    vec2 q = vec2(fbm(p + t), fbm(p + vec2(5.2, 1.3) - t));
    vec2 r = vec2(
      fbm(p + 3.2 * q + vec2(1.7, 9.2) + 0.18 * t),
      fbm(p + 3.2 * q + vec2(8.3, 2.8) - 0.15 * t)
    );
    float f = fbm(p + 3.4 * r);

    vec3 base = vec3(0.035, 0.045, 0.09);
    vec3 indigo = vec3(0.486, 0.537, 1.0);
    vec3 cyan = vec3(0.306, 0.918, 1.0);
    vec3 violet = vec3(0.655, 0.545, 0.980);

    vec3 color = mix(base, indigo, clamp(f * f * 2.4, 0.0, 1.0));
    color = mix(color, cyan, clamp(length(q) * 0.85, 0.0, 1.0));
    color = mix(color, violet, clamp(r.x * r.x * 1.6, 0.0, 1.0));

    float vig = 1.0 - dot(uv - 0.5, uv - 0.5) * 1.15;
    color *= clamp(vig, 0.0, 1.0);

    gl_FragColor = vec4(color, 1.0);
  }
`;

function compileShader(gl: WebGLRenderingContext, type: number, source: string) {
    const shader = gl.createShader(type);
    if (!shader) return null;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error("GalaxyBackground shader error:", gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

function useNebulaCanvas(
    canvasRef: React.RefObject<HTMLCanvasElement | null>,
    mouseRef: React.RefObject<{ x: number; y: number }>,
    reducedMotion: boolean
) {
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const gl = canvas.getContext("webgl", { antialias: true, alpha: false });
        if (!gl) return; // fallback CSS gradient behind the canvas still shows

        const vertexShader = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SRC);
        const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SRC);
        if (!vertexShader || !fragmentShader) return;

        const program = gl.createProgram();
        if (!program) return;
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.error("GalaxyBackground link error:", gl.getProgramInfoLog(program));
            return;
        }
        gl.useProgram(program);

        const positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        // one oversized triangle covers the whole clip space — cheaper than a quad
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
        const aPosition = gl.getAttribLocation(program, "aPosition");
        gl.enableVertexAttribArray(aPosition);
        gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

        const uResolution = gl.getUniformLocation(program, "uResolution");
        const uTime = gl.getUniformLocation(program, "uTime");
        const uMouse = gl.getUniformLocation(program, "uMouse");

        let raf = 0;
        const start = performance.now();

        // Measure the canvas's own rendered box every frame rather than
        // relying only on ResizeObserver. ResizeObserver only fires on real
        // layout-box changes — it stays silent if a "maximize" animation is
        // implemented via CSS transform: scale() on an ancestor, which is a
        // common way to animate window resizing smoothly. Polling via
        // getBoundingClientRect() catches that case too, and the check is
        // cheap enough to run every frame.
        let lastW = 0;
        let lastH = 0;
        const applySize = () => {
            const rect = canvas.getBoundingClientRect();
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            const w = Math.floor(rect.width * dpr);
            const h = Math.floor(rect.height * dpr);
            if (w === lastW && h === lastH) return;
            lastW = w;
            lastH = h;
            if (w > 0 && h > 0) {
                canvas.width = w;
                canvas.height = h;
                gl.viewport(0, 0, w, h);
                gl.uniform2f(uResolution, w, h);
            }
        };

        const observer = new ResizeObserver(applySize);
        observer.observe(canvas);
        applySize();

        const draw = (now: number) => {
            applySize();
            if (lastW > 0 && lastH > 0) {
                gl.uniform1f(uTime, (now - start) / 1000);
                gl.uniform2f(uMouse, mouseRef.current?.x ?? 0, mouseRef.current?.y ?? 0);
                gl.drawArrays(gl.TRIANGLES, 0, 3);
            }
            if (!reducedMotion) raf = requestAnimationFrame(draw);
        };
        draw(performance.now());

        const handleContextLost = (e: Event) => {
            e.preventDefault();
            cancelAnimationFrame(raf);
        };
        canvas.addEventListener("webglcontextlost", handleContextLost, false);

        return () => {
            cancelAnimationFrame(raf);
            observer.disconnect();
            canvas.removeEventListener("webglcontextlost", handleContextLost);
            gl.deleteProgram(program);
            gl.deleteShader(vertexShader);
            gl.deleteShader(fragmentShader);
            gl.deleteBuffer(positionBuffer);
            // NOTE: deliberately not calling WEBGL_lose_context().loseContext()
            // here. It sounds like good hygiene, but forcing context loss on
            // cleanup breaks React Strict Mode's dev-mode double-invocation:
            // the canvas only ever gets ONE context for its lifetime, so the
            // second (real) mount gets handed back the now-permanently-dead
            // context instead of a fresh one, and every later compile fails.
            // Ordinary garbage collection is sufficient here.
        };
    }, [canvasRef, mouseRef, reducedMotion]);
}

/* ------------------------------ DOM layer ------------------------------ */

const ORBITS = [
    { size: 460, tilt: 64, duration: 13, delay: 0, hue: "rgba(124,137,255,1)" },
    { size: 660, tilt: 70, duration: 19, delay: -4, hue: "rgba(78,234,255,0.95)" },
    { size: 860, tilt: 75, duration: 27, delay: -11, hue: "rgba(167,139,250,0.92)" },
];

const PING_DELAYS = [0, 1.3, 2.6];

export default function GalaxyBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const mouseRef = useRef({ x: 0, y: 0 });
    // Motion complies with the OS-level "Reduced Motion" setting by default,
    // including in dev — so if *your* machine has it enabled, animations
    // disappear locally even though real users without it would see them
    // fine. Only respect it in production; always animate while developing.
    const systemPrefersReducedMotion = !!useReducedMotion();
    const reducedMotion = process.env.NODE_ENV === "production" ? systemPrefersReducedMotion : false;

    useNebulaCanvas(canvasRef, mouseRef, reducedMotion);

    // cursor-following glow, in px relative to the panel
    const glowX = useMotionValue(0);
    const glowY = useMotionValue(0);
    const springX = useSpring(glowX, { stiffness: 40, damping: 18, mass: 0.6 });
    const springY = useSpring(glowY, { stiffness: 40, damping: 18, mass: 0.6 });

    // subtle 3D parallax tilt for the ring/core layer
    const tiltX = useMotionValue(0);
    const tiltY = useMotionValue(0);
    const springTiltX = useSpring(tiltX, { stiffness: 60, damping: 20 });
    const springTiltY = useSpring(tiltY, { stiffness: 60, damping: 20 });

    useEffect(() => {
        if (reducedMotion) return;
        const handleMove = (e: PointerEvent) => {
            const rect = canvasRef.current?.getBoundingClientRect();
            if (!rect || rect.width === 0 || rect.height === 0) return; // avoid NaN on a 0×0 box
            const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
            const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;
            mouseRef.current = { x: nx, y: -ny };
            glowX.set(e.clientX - rect.left);
            glowY.set(e.clientY - rect.top);
            tiltX.set(nx * 10);
            tiltY.set(ny * -10);
        };
        window.addEventListener("pointermove", handleMove);
        return () => window.removeEventListener("pointermove", handleMove);
    }, [reducedMotion, glowX, glowY, tiltX, tiltY]);

    return (
        <MotionConfig reducedMotion={process.env.NODE_ENV === "production" ? "user" : "never"}>
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                {/* static fallback wash — only visible if WebGL can't init */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_60%_40%,_#241b3d_0%,_#0a0f24_45%,_#060816_75%,_#020308_100%)]" />

            {/* signature element: shader nebula */}
            <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

            {/* cursor-reactive glow */}
            {!reducedMotion && (
                <motion.div
                    className="absolute h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-300/20 blur-3xl"
                    style={{ left: springX, top: springY }}
                />
            )}

          

            {/* faint perspective HUD floor grid, fading upward */}
            <div
                className="absolute inset-x-[-20%] bottom-[-15%] h-[55%] opacity-[0.08]"
                style={{
                    backgroundImage:
                        "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
                    backgroundSize: "44px 44px",
                    transform: "perspective(500px) rotateX(62deg)",
                    maskImage: "linear-gradient(to top, black, transparent)",
                    WebkitMaskImage: "linear-gradient(to top, black, transparent)",
                }}
            />

            {/* film grain for a less flat, more filmic finish */}
            <svg className="absolute inset-0 h-full w-full opacity-[0.035] mix-blend-overlay">
                <filter id="galaxy-grain">
                    <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} stitchTiles="stitch" />
                </filter>
                <rect width="100%" height="100%" filter="url(#galaxy-grain)" />
                </svg>
            </div>
        </MotionConfig>
    );
}