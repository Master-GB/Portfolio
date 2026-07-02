"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

export type SceneState =
    | "idle"
    | "typing"
    | "deleting"
    | "sending"
    | "success"
    | "error";

/**
 * Palette tuned to sit naturally on a #060816 page background.
 * Instead of generic swatches, every accent lives in the same
 * "electric signal on deep-space navy" family: cool blues/cyans
 * for calm + data states, a warm amber for the destructive one,
 * and a magenta-shifted red for error so it still reads as part
 * of the same violet-leaning world instead of clashing with it.
 */

const STATE_COLORS: Record<SceneState, string> = {
    idle: "#041adcff",
    typing: "#4eeaff",
    deleting: "#ff8a52",
    sending: "#a6f0ff",
    success: "#3ffcc4",
    error: "#ff5c7a",
};

const STATE_LABELS: Record<SceneState, string> = {
    idle: "LISTENING",
    typing: "RECEIVING DATA",
    deleting: "PURGING DATA",
    sending: "TRANSMITTING",
    success: "DELIVERED",
    error: "LINK FAILED",
};

// chassis / trim tokens — deliberately lighter than PAGE_BG so the
// silhouette has real contrast; the bezel stays darkest of the group
// so the glowing screen is still the brightest thing on the face
const CHASSIS_INK = "#1d2748"; // main body — clearly lighter than the page bg now
const CHASSIS_PANEL = "#0a0e1c"; // bezel, stays darkest so the screen still pops
const STEEL_TRIM = "#2c3660"; // neck / base / knobs
const SCREEN_VOID = "#080b18"; // CRT background, ties screen to page bg

// muted HUD text tokens (replace generic Tailwind slate, which read
// too neutral-gray against the blue-tinted background)
const HUD_MUTED = "#5b6a94";
const HUD_FAINT = "#2e3760";

// resting x-offset that keeps the bot weighted toward the right
// half of the canvas, mirrors the layout of the original scene
const REST_X = 1.5;

const SCREEN_W = 512;
const SCREEN_H = 384;

/** Draws the CRT face for the current frame directly onto a 2D canvas. */
function drawFace(
    ctx: CanvasRenderingContext2D,
    state: SceneState,
    t: number,
    blink: number,
    flash: number
) {
    const w = SCREEN_W;
    const h = SCREEN_H;
    const color = STATE_COLORS[state];

    // background
    ctx.fillStyle = SCREEN_VOID;
    ctx.fillRect(0, 0, w, h);

    // scanlines
    ctx.globalAlpha = 0.12;
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    for (let y = 0; y < h; y += 4) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
    }
    ctx.globalAlpha = 1;

    const cx = w / 2;
    const cy = h / 2 - 10;
    const eyeOffsetX = 90;
    const eyeY = cy - 30;
    const blinkScale = Math.max(0.06, 1 - blink);

    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 8;
    ctx.lineCap = "round";
    ctx.shadowColor = color;
    ctx.shadowBlur = 18;

    if (state === "success") {
        // happy curved eyes
        [-1, 1].forEach((side) => {
            ctx.beginPath();
            ctx.arc(cx + side * eyeOffsetX, eyeY + 10, 26, Math.PI * 1.1, Math.PI * 1.9);
            ctx.stroke();
        });
        // big smile
        ctx.beginPath();
        ctx.arc(cx, cy + 40, 90, 0.15 * Math.PI, 0.85 * Math.PI);
        ctx.stroke();
        // checkmark
        ctx.save();
        ctx.translate(cx, cy - 130);
        ctx.beginPath();
        ctx.moveTo(-40, 0);
        ctx.lineTo(-10, 30);
        ctx.lineTo(45, -35);
        ctx.stroke();
        ctx.restore();
    } else if (state === "error") {
        // X X eyes
        [-1, 1].forEach((side) => {
            const ex = cx + side * eyeOffsetX;
            ctx.beginPath();
            ctx.moveTo(ex - 20, eyeY - 20);
            ctx.lineTo(ex + 20, eyeY + 20);
            ctx.moveTo(ex + 20, eyeY - 20);
            ctx.lineTo(ex - 20, eyeY + 20);
            ctx.stroke();
        });
        // jagged frown
        ctx.beginPath();
        const fy = cy + 70;
        ctx.moveTo(cx - 90, fy + 10);
        ctx.lineTo(cx - 45, fy - 20);
        ctx.lineTo(cx, fy + 5);
        ctx.lineTo(cx + 45, fy - 20);
        ctx.lineTo(cx + 90, fy + 10);
        ctx.stroke();

        // glitch: shift random horizontal bands
        const rows = 6;
        for (let i = 0; i < rows; i++) {
            const ry = Math.floor(Math.random() * h);
            const rh = 4 + Math.random() * 10;
            const dx = (Math.random() - 0.5) * 34;
            const imgData = ctx.getImageData(0, ry, w, rh);
            ctx.clearRect(0, ry, w, rh);
            ctx.putImageData(imgData, dx, ry);
        }
    } else if (state === "deleting") {
        // squinting eyes
        [-1, 1].forEach((side) => {
            const ex = cx + side * eyeOffsetX;
            ctx.beginPath();
            ctx.moveTo(ex - 22, eyeY);
            ctx.lineTo(ex + 22, eyeY);
            ctx.stroke();
        });
        // zigzag mouth, data being chewed through
        ctx.beginPath();
        const fy = cy + 60;
        ctx.moveTo(cx - 80, fy);
        for (let i = 0; i < 5; i++) {
            const x = cx - 80 + (i + 1) * 32;
            const y = fy + (i % 2 === 0 ? 20 : -20);
            ctx.lineTo(x, y);
        }
        ctx.stroke();
    } else if (state === "sending") {
        // focused slit eyes
        [-1, 1].forEach((side) => {
            const ex = cx + side * eyeOffsetX;
            ctx.beginPath();
            ctx.ellipse(ex, eyeY, 20, 6, 0, 0, Math.PI * 2);
            ctx.fill();
        });
        // determined flat mouth
        ctx.beginPath();
        ctx.moveTo(cx - 60, cy + 60);
        ctx.lineTo(cx + 60, cy + 60);
        ctx.stroke();
    } else if (state === "typing") {
        // wide alert eyes
        [-1, 1].forEach((side) => {
            const ex = cx + side * eyeOffsetX;
            ctx.beginPath();
            ctx.ellipse(ex, eyeY, 24, 24 * blinkScale, 0, 0, Math.PI * 2);
            ctx.fill();
        });
        // small "o" mouth, pulsing as data streams in
        ctx.beginPath();
        const r = 18 + Math.sin(t * 10) * 4;
        ctx.arc(cx, cy + 60, r, 0, Math.PI * 2);
        ctx.stroke();
    } else {
        // idle: neutral eyes with a gentle blink, flat mouth
        [-1, 1].forEach((side) => {
            const ex = cx + side * eyeOffsetX;
            ctx.beginPath();
            ctx.ellipse(ex, eyeY, 22, 22 * blinkScale, 0, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.beginPath();
        ctx.moveTo(cx - 50, cy + 60);
        ctx.lineTo(cx + 50, cy + 60);
        ctx.stroke();
    }

    ctx.shadowBlur = 0;

    // keystroke flash overlay
    if (flash > 0) {
        ctx.globalAlpha = flash * 0.25;
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, w, h);
        ctx.globalAlpha = 1;
    }

    // vignette
    const grad = ctx.createRadialGradient(cx, h / 2, h * 0.2, cx, h / 2, h * 0.75);
    grad.addColorStop(0, "rgba(0,0,0,0)");
    grad.addColorStop(1, "rgba(0,0,0,0.55)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
}

function TerminalBot({ state, pulse }: { state: SceneState; pulse: number }) {
    const groupRef = useRef<THREE.Group>(null);
    const bodyMatRef = useRef<THREE.MeshStandardMaterial>(null);
    const screenMatRef = useRef<THREE.MeshBasicMaterial>(null);
    const screenLightRef = useRef<THREE.PointLight>(null);
    const antennaMatRef = useRef<THREE.MeshStandardMaterial>(null);
    const ring1Ref = useRef<THREE.Mesh>(null);
    const ring2Ref = useRef<THREE.Mesh>(null);

    // signature addition: a hologram-style contact pad beneath the
    // bot. It's the one bold move — a soft disc + ring that breathes
    // and tints to the current state color, visually welding the
    // chassis to the dark page background instead of leaving it
    // floating as a mismatched box on top of it.
    const padRef = useRef<THREE.Mesh>(null);
    const padRingRef = useRef<THREE.Mesh>(null);

    const flashRef = useRef(0);
    const lastPulse = useRef(pulse);
    const blinkTimer = useRef(0);
    const blinkVal = useRef(0);
    const launchT = useRef(0);

    // offscreen canvas + texture used to paint the face each frame
    const { ctx, texture } = useMemo(() => {
        const canvas = document.createElement("canvas");
        canvas.width = SCREEN_W;
        canvas.height = SCREEN_H;
        const context = canvas.getContext("2d")!;
        const tex = new THREE.CanvasTexture(canvas);
        tex.colorSpace = THREE.SRGBColorSpace;
        return { ctx: context, texture: tex };
    }, []);

    const targetColor = useMemo(() => new THREE.Color(STATE_COLORS[state]), [state]);
    const bodyColor = useMemo(() => new THREE.Color(CHASSIS_INK), []);

    // trailing power cable — a simple sagging curve from a port on
    // the chassis back down to the base, reinforcing the "plugged
    // into something" read the antenna mount started
    const cableCurve = useMemo(
        () =>
            new THREE.CatmullRomCurve3([
                new THREE.Vector3(0.35, -0.55, -0.3),
                new THREE.Vector3(0.62, -0.85, -0.28),
                new THREE.Vector3(0.55, -1.02, -0.05),
                new THREE.Vector3(0.3, -1.06, 0.22),
            ]),
        []
    );

    // per-keystroke flash, fired whenever the parent bumps `pulse`
    useEffect(() => {
        if (pulse !== lastPulse.current) {
            flashRef.current = 1;
            lastPulse.current = pulse;
        }
    }, [pulse]);

    // reset the launch timeline every time we enter "sending"
    useEffect(() => {
        if (state === "sending") launchT.current = 0;
    }, [state]);

    useFrame((three, delta) => {
        const t = three.clock.elapsedTime;
        const lerpSpeed = 1 - Math.pow(0.001, delta);

        // blink cycle
        blinkTimer.current -= delta;
        if (blinkTimer.current <= 0) {
            blinkTimer.current = 2.4 + Math.random() * 2.2;
            blinkVal.current = 1;
        }
        blinkVal.current = Math.max(0, blinkVal.current - delta * 6);

        flashRef.current = Math.max(0, flashRef.current - delta * 2.2);

        // repaint the CRT face texture
        drawFace(ctx, state, t, blinkVal.current, flashRef.current);
        texture.needsUpdate = true;

        if (groupRef.current) {
            const idleBob = Math.sin(t * 0.8) * 0.06;
            groupRef.current.rotation.y = Math.sin(t * 0.3) * 0.08;
            groupRef.current.rotation.z = state === "error" ? Math.sin(t * 30) * 0.02 : 0;

            if (state === "sending") {
                launchT.current = Math.min(launchT.current + delta, 1);
                const ease = 1 - Math.pow(1 - launchT.current, 3);
                groupRef.current.position.x = REST_X + ease * 3.2;
                groupRef.current.position.y = idleBob + ease * 1.7;
                groupRef.current.rotation.x = THREE.MathUtils.lerp(
                    groupRef.current.rotation.x,
                    -0.12,
                    lerpSpeed
                );
            } else {
                groupRef.current.position.x = THREE.MathUtils.lerp(
                    groupRef.current.position.x,
                    REST_X + (state === "error" ? (Math.random() - 0.5) * 0.05 : 0),
                    lerpSpeed * 2
                );
                groupRef.current.position.y = THREE.MathUtils.lerp(
                    groupRef.current.position.y,
                    idleBob,
                    lerpSpeed
                );
                groupRef.current.rotation.x = THREE.MathUtils.lerp(
                    groupRef.current.rotation.x,
                    state === "deleting" ? 0.06 : 0,
                    lerpSpeed
                );
            }
        }

        if (bodyMatRef.current) {
            bodyMatRef.current.color.lerp(bodyColor, lerpSpeed);
            bodyMatRef.current.emissive.lerp(targetColor, lerpSpeed * 2);
            bodyMatRef.current.emissiveIntensity = THREE.MathUtils.lerp(
                bodyMatRef.current.emissiveIntensity,
                0.28 + flashRef.current * 0.35,
                lerpSpeed
            );
        }

        if (antennaMatRef.current) {
            antennaMatRef.current.emissive.lerp(targetColor, lerpSpeed * 2);
            antennaMatRef.current.emissiveIntensity = THREE.MathUtils.lerp(
                antennaMatRef.current.emissiveIntensity,
                state === "sending" ? 3 : 1.4 + Math.sin(t * 3) * 0.3,
                lerpSpeed
            );
        }

        if (screenLightRef.current) {
            screenLightRef.current.color.lerp(targetColor, lerpSpeed * 2);
            screenLightRef.current.intensity = THREE.MathUtils.lerp(
                screenLightRef.current.intensity,
                1.9 + flashRef.current * 1.5,
                lerpSpeed
            );
        }

        // success = expanding sonar rings confirming delivery
        [ring1Ref, ring2Ref].forEach((ref, i) => {
            if (!ref.current) return;
            const mat = ref.current.material as THREE.MeshBasicMaterial;
            if (state === "success") {
                const phase = (t * 0.9 + i * 0.5) % 1.4;
                ref.current.scale.setScalar(1 + phase * 2.2);
                mat.opacity = Math.max(0, 0.55 - phase * 0.4);
                mat.color.lerp(targetColor, lerpSpeed * 2);
            } else {
                mat.opacity = THREE.MathUtils.lerp(mat.opacity, 0, lerpSpeed);
            }
        });

        // contact pad: gentle idle breathing, brighter kick on
        // keystrokes/state changes so it still reads as "alive"
        // even though it sits low in the frame
        if (padRef.current) {
            const mat = padRef.current.material as THREE.MeshBasicMaterial;
            mat.color.lerp(targetColor, lerpSpeed * 2);
            const breathe = 0.14 + Math.sin(t * 1.1) * 0.04;
            mat.opacity = THREE.MathUtils.lerp(
                mat.opacity,
                breathe + flashRef.current * 0.15,
                lerpSpeed
            );
        }
        if (padRingRef.current) {
            const mat = padRingRef.current.material as THREE.MeshBasicMaterial;
            mat.color.lerp(targetColor, lerpSpeed * 2);
            const ringPulse = 0.45 + Math.sin(t * 1.1 + 1) * 0.15;
            mat.opacity = THREE.MathUtils.lerp(mat.opacity, ringPulse, lerpSpeed);
        }
    });

    return (
        <group ref={groupRef} position={[REST_X, 0, 0]}>
            {/* antenna mount — a collar welded flush to the chassis roof
                so the rod has something to actually attach to */}
            <mesh position={[0, 0.735, 0]}>
                <cylinderGeometry args={[0.09, 0.12, 0.07, 12]} />
                <meshStandardMaterial color={STEEL_TRIM} roughness={0.4} metalness={0.5} />
            </mesh>

            {/* antenna rod — bottom sits flush on the mount collar */}
            <mesh position={[0, 1.05, 0]}>
                <cylinderGeometry args={[0.022, 0.032, 0.56, 8]} />
                <meshStandardMaterial color={STEEL_TRIM} roughness={0.4} metalness={0.5} />
            </mesh>

            {/* antenna tip — overlaps the rod top, no floating gap */}
            <mesh position={[0, 1.36, 0]}>
                <sphereGeometry args={[0.08, 16, 16]} />
                <meshStandardMaterial
                    ref={antennaMatRef}
                    color={CHASSIS_PANEL}
                    emissive={STATE_COLORS.idle}
                    emissiveIntensity={1.4}
                />
            </mesh>

            {/* chassis */}
            <mesh>
                <boxGeometry args={[1.9, 1.4, 0.7]} />
                <meshStandardMaterial
                    ref={bodyMatRef}
                    color={CHASSIS_INK}
                    emissive={STATE_COLORS.idle}
                    emissiveIntensity={0.28}
                    roughness={0.28}
                    metalness={0.5}
                />
            </mesh>

            {/* top vent grilles — flank the antenna mount */}
            {[-1, 1].map((side) => (
                <group key={`vent-${side}`} position={[side * 0.55, 0.705, 0]}>
                    {[0, 1, 2, 3].map((i) => (
                        <mesh key={i} position={[0, 0, -0.12 + i * 0.08]}>
                            <boxGeometry args={[0.32, 0.015, 0.045]} />
                            <meshStandardMaterial color={CHASSIS_PANEL} roughness={0.7} metalness={0.2} />
                        </mesh>
                    ))}
                </group>
            ))}

            {/* corner rivets on the screen bezel */}
            {[
                [-0.68, 0.47],
                [0.68, 0.47],
                [-0.68, -0.37],
                [0.68, -0.37],
            ].map(([x, y], i) => (
                <mesh key={`rivet-${i}`} position={[x, y, 0.4]} rotation={[Math.PI / 2, 0, 0]}>
                    <cylinderGeometry args={[0.025, 0.025, 0.025, 10]} />
                    <meshStandardMaterial color={STEEL_TRIM} roughness={0.3} metalness={0.6} />
                </mesh>
            ))}

            {/* trailing power cable — sags from a rear port down to the base */}
            <mesh>
                <tubeGeometry args={[cableCurve, 32, 0.032, 8, false]} />
                <meshStandardMaterial color={CHASSIS_PANEL} roughness={0.55} metalness={0.15} />
            </mesh>

            {/* screen bezel */}
            <mesh position={[0, 0.05, 0.36]}>
                <boxGeometry args={[1.55, 1.05, 0.06]} />
                <meshStandardMaterial color={CHASSIS_PANEL} roughness={0.6} />
            </mesh>

            {/* screen */}
            <mesh position={[0, 0.05, 0.4]}>
                <planeGeometry args={[1.4, 0.9]} />
                <meshBasicMaterial ref={screenMatRef} map={texture} toneMapped={false} />
            </mesh>
            <pointLight ref={screenLightRef} position={[0, 0.05, 1.2]} intensity={1.4} distance={4} />

            {/* success sonar rings */}
            <mesh ref={ring1Ref} position={[0, 0.05, 0.45]}>
                <ringGeometry args={[0.8, 0.85, 48]} />
                <meshBasicMaterial color={STATE_COLORS.success} transparent opacity={0} side={THREE.DoubleSide} />
            </mesh>
            <mesh ref={ring2Ref} position={[0, 0.05, 0.45]}>
                <ringGeometry args={[0.8, 0.85, 48]} />
                <meshBasicMaterial color={STATE_COLORS.success} transparent opacity={0} side={THREE.DoubleSide} />
            </mesh>

            {/* neck */}
            <mesh position={[0, -0.85, 0]}>
                <cylinderGeometry args={[0.12, 0.18, 0.3, 12]} />
                <meshStandardMaterial color={STEEL_TRIM} roughness={0.5} metalness={0.3} />
            </mesh>

            {/* base */}
            <mesh position={[0, -1.05, 0]}>
                <cylinderGeometry args={[0.5, 0.5, 0.08, 24]} />
                <meshStandardMaterial color={CHASSIS_INK} roughness={0.5} metalness={0.3} />
            </mesh>

            {/* knobs */}
            <mesh position={[-0.75, -0.55, 0.37]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.06, 0.06, 0.05, 12]} />
                <meshStandardMaterial color={STEEL_TRIM} />
            </mesh>
            <mesh position={[0.75, -0.55, 0.37]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.06, 0.06, 0.05, 12]} />
                <meshStandardMaterial color={STEEL_TRIM} />
            </mesh>

            {/* contact pad — grounds the bot in the page background */}
            <mesh ref={padRef} position={[0, -1.16, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <circleGeometry args={[1.35, 48]} />
                <meshBasicMaterial
                    color={STATE_COLORS.idle}
                    transparent
                    opacity={0.14}
                    side={THREE.DoubleSide}
                    depthWrite={false}
                />
            </mesh>
            <mesh ref={padRingRef} position={[0, -1.15, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[1.3, 1.37, 64]} />
                <meshBasicMaterial
                    color={STATE_COLORS.idle}
                    transparent
                    opacity={0.45}
                    side={THREE.DoubleSide}
                    depthWrite={false}
                />
            </mesh>
        </group>
    );
}

function Lights() {
    return (
        <>
            <ambientLight intensity={0.48} color="#28336a" />
            <pointLight position={[4, 4, 4]} intensity={1.4} color="#7c89ff" />
            <pointLight position={[-4, -2, -3]} intensity={1.0} color="#4eeaff" />
            {/* cool rim/kicker light from behind-above — this is what
                actually pulls the silhouette off a near-black background */}
            <pointLight position={[0, 3, -4]} intensity={1.2} color="#c9d4ff" />
            {/* low fill, same hue family as the page background, keeps
                the underside of the chassis from dropping to pure black */}
            <pointLight position={[0, -2.5, 1.5]} intensity={0.4} color="#1c274e" />
        </>
    );
}

export default function Scene3D({
    state,
    pulse,
}: {
    state: SceneState;
    pulse: number;
}) {
    return (
        <div className="relative h-full w-full" style={{ backgroundColor: "transparent" }}>
            <Canvas
                camera={{ position: [0, 0, 6], fov: 45 }}
                dpr={[1, 1.5]}
                gl={{ antialias: true, alpha: true }}
            >
                <Lights />
                <TerminalBot state={state} pulse={pulse} />
            </Canvas>

            {/* HUD overlay, mirrors the terminal panel on the left */}
            <div
                className="pointer-events-none absolute right-6 top-6 select-none text-right font-mono text-[10px] tracking-widest"
                style={{ color: HUD_MUTED }}
            >
                <div className="flex items-center gap-2">
                    <span
                        className="h-1.5 w-1.5 rounded-full transition-colors duration-300"
                        style={{ backgroundColor: STATE_COLORS[state] }}
                    />
                    <span className="transition-colors duration-300" style={{ color: STATE_COLORS[state] }}>
                        {STATE_LABELS[state]}
                    </span>
                </div>
            </div>

           
        </div>
    );
}