"use client";

/**
 * CuteRobotScene.tsx
 * -------------------------------------------------------------------------
 * A fully self-contained, procedurally-built cute robot avatar:
 *  - Realistic modern metal look (PBR MeshPhysicalMaterial + HDRI reflections)
 *  - Chibi/cute proportions (big head, big eyes, rounded shapes)
 *  - Talks out loud using the browser's built-in Web Speech API
 *  - Mouth animates in sync with speech (lip-sync via speech envelope)
 *  - Blinking eyes, idle bob, mouse-look, holographic ring
 *
 * No external .glb file is required — everything is built from primitives,
 * so this runs immediately. When you have a real rigged GLB later, swap the
 * <CuteRobotMesh /> group for your <primitive object={scene} /> and reuse
 * the `useTalkingMouth` hook to drive a jaw bone or morph target instead of
 * the procedural mouth mesh.
 *
 * Dependencies (already implied by your existing RobotScene.tsx):
 *   @react-three/fiber, @react-three/drei, three, react
 * -------------------------------------------------------------------------
 */

import { useEffect, useMemo, useRef, useState, useCallback, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, RoundedBox } from "@react-three/drei";
import * as THREE from "three";

// ---------------------------------------------------------------------------
// Theme colors (self-contained — merge with your own THEME_COLORS if you like)
// ---------------------------------------------------------------------------
const THEME_COLORS: Record<string, { str: string; hex: number }> = {
    cyan: { str: "#22d3ee", hex: 0x22d3ee },
    rose: { str: "#fb7185", hex: 0xfb7185 },
    emerald: { str: "#34d399", hex: 0x34d399 },
    gold: { str: "#fbbf24", hex: 0xfbbf24 },
    cyberpunk: { str: "#e879f9", hex: 0xe879f9 },
};

type ThemeName = keyof typeof THEME_COLORS;

// ---------------------------------------------------------------------------
// Speech + lip-sync hook
// ---------------------------------------------------------------------------
// The Web Speech API does not expose raw audio amplitude for
// SpeechSynthesisUtterance (browsers don't route it through Web Audio API).
// Instead we approximate a natural talking envelope:
//   - a layered-sine "mouth chatter" while speech is actively playing
//   - a pulse boost on each word boundary (onboundary event) for punch
//   - smooth decay to closed when speech ends
// If you later swap in real audio (e.g. ElevenLabs streamed audio), replace
// the envelope logic with an AnalyserNode reading real amplitude — the
// `mouthOpenRef` output contract stays identical either way.
function useTalkingMouth() {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const mouthOpenRef = useRef(0); // 0 = closed, 1 = fully open
    const pulseRef = useRef(0);
    const clockRef = useRef(0);

    const speak = useCallback((text: string, voiceName?: string) => {
        if (!text.trim() || typeof window === "undefined" || !window.speechSynthesis) return;

        // Cancel anything currently queued/playing
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.0;
        utterance.pitch = 1.05; // slightly higher pitch reads as "cute"
        utterance.volume = 1;

        if (voiceName) {
            const voice = window.speechSynthesis.getVoices().find((v) => v.name === voiceName);
            if (voice) utterance.voice = voice;
        }

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);
        utterance.onboundary = (e) => {
            // Word/sentence boundary -> quick mouth pulse for punctuation on syllables
            if (e.name === "word" || e.name === undefined) {
                pulseRef.current = 1;
            }
        };

        window.speechSynthesis.speak(utterance);
    }, []);

    const stop = useCallback(() => {
        if (typeof window !== "undefined" && window.speechSynthesis) {
            window.speechSynthesis.cancel();
        }
        setIsSpeaking(false);
    }, []);

    // Per-frame envelope update — call this inside useFrame in the consumer
    const updateEnvelope = useCallback((delta: number) => {
        clockRef.current += delta;

        let target = 0;
        if (isSpeaking) {
            // Layered sine waves = organic "chatter" rather than a robotic single pulse
            const t = clockRef.current;
            const chatter =
                0.5 +
                0.25 * Math.sin(t * 14) +
                0.15 * Math.sin(t * 27 + 1.3) +
                0.1 * Math.sin(t * 41 + 0.4);
            target = THREE.MathUtils.clamp(chatter + pulseRef.current * 0.6, 0, 1);
        }

        // Decay the word-boundary pulse quickly
        pulseRef.current = THREE.MathUtils.lerp(pulseRef.current, 0, delta * 10);

        // Smooth toward target (fast open, slightly slower close = natural feel)
        const speed = target > mouthOpenRef.current ? 18 : 10;
        mouthOpenRef.current = THREE.MathUtils.lerp(mouthOpenRef.current, target, Math.min(delta * speed, 1));
    }, [isSpeaking]);

    return { isSpeaking, speak, stop, mouthOpenRef, updateEnvelope };
}

// ---------------------------------------------------------------------------
// Material helper — realistic modern metal via MeshPhysicalMaterial
// ---------------------------------------------------------------------------
function metalMaterial(color: string, opts?: { metalness?: number; roughness?: number; clearcoat?: number }) {
    return new THREE.MeshPhysicalMaterial({
        color,
        metalness: opts?.metalness ?? 0.85,
        roughness: opts?.roughness ?? 0.28,
        clearcoat: opts?.clearcoat ?? 0.6,
        clearcoatRoughness: 0.18,
        envMapIntensity: 1.4,
    });
}

function glowMaterial(color: string) {
    return new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: 1.6,
        roughness: 0.3,
        metalness: 0.1,
    });
}

// ---------------------------------------------------------------------------
// The procedural cute robot
// ---------------------------------------------------------------------------
interface CuteRobotMeshProps {
    themeColor: { str: string; hex: number };
    lookAtMouse: boolean;
    mouthOpenRef: React.MutableRefObject<number>;
}

function CuteRobotMesh({ themeColor, lookAtMouse, mouthOpenRef }: CuteRobotMeshProps) {
    const group = useRef<THREE.Group>(null);
    const headRef = useRef<THREE.Group>(null);
    const mouthRef = useRef<THREE.Mesh>(null);
    const leftEyeRef = useRef<THREE.Mesh>(null);
    const rightEyeRef = useRef<THREE.Mesh>(null);
    const blinkState = useRef({ next: 2 + Math.random() * 3, progress: 0, blinking: false });

    const bodyMat = useMemo(() => metalMaterial("#e6e9ef", { metalness: 0.9, roughness: 0.22, clearcoat: 0.7 }), []);
    const headMat = useMemo(() => metalMaterial("#f4f6fa", { metalness: 0.85, roughness: 0.2, clearcoat: 0.8 }), []);
    const accentMat = useMemo(() => metalMaterial(themeColor.str, { metalness: 0.7, roughness: 0.3, clearcoat: 0.5 }), [themeColor]);
    const eyeGlow = useMemo(() => glowMaterial(themeColor.str), [themeColor]);
    const mouthMat = useMemo(() => glowMaterial(themeColor.str), [themeColor]);
    const darkMat = useMemo(() => metalMaterial("#2a2e38", { metalness: 0.6, roughness: 0.4, clearcoat: 0.3 }), []);

    useFrame((state, delta) => {
        // Idle bob
        if (group.current) {
            group.current.position.y = Math.sin(state.clock.elapsedTime * 1.4) * 0.03;
        }

        // Head look-at-mouse / gentle idle sway
        if (headRef.current) {
            const targetY = lookAtMouse ? state.pointer.x * 0.35 : Math.sin(state.clock.elapsedTime * 0.6) * 0.15;
            const targetX = lookAtMouse ? -state.pointer.y * 0.2 : 0;
            headRef.current.rotation.y += (targetY - headRef.current.rotation.y) * 0.08;
            headRef.current.rotation.x += (targetX - headRef.current.rotation.x) * 0.08;
        }

        // Mouth open amount driven by external lip-sync ref
        if (mouthRef.current) {
            const openAmt = mouthOpenRef.current;
            mouthRef.current.scale.y = 0.15 + openAmt * 0.9;
            mouthRef.current.scale.x = 1 - openAmt * 0.15;
        }

        // Blinking
        const b = blinkState.current;
        b.next -= delta;
        if (b.next <= 0 && !b.blinking) {
            b.blinking = true;
            b.progress = 0;
        }
        if (b.blinking) {
            b.progress += delta * 10;
            const s = Math.abs(Math.sin(Math.min(b.progress, Math.PI)));
            const scaleY = 1 - s;
            if (leftEyeRef.current) leftEyeRef.current.scale.y = Math.max(scaleY, 0.05);
            if (rightEyeRef.current) rightEyeRef.current.scale.y = Math.max(scaleY, 0.05);
            if (b.progress >= Math.PI) {
                b.blinking = false;
                b.next = 2 + Math.random() * 4;
                if (leftEyeRef.current) leftEyeRef.current.scale.y = 1;
                if (rightEyeRef.current) rightEyeRef.current.scale.y = 1;
            }
        }
    });

    return (
        <group ref={group} position={[0, -0.9, 0]} scale={1}>
            {/* --- Body --- */}
            <RoundedBox args={[0.62, 0.55, 0.42]} radius={0.14} smoothness={6} position={[0, 0.32, 0]} material={bodyMat} castShadow receiveShadow />
            {/* Chest accent panel */}
            <RoundedBox args={[0.26, 0.22, 0.05]} radius={0.06} smoothness={4} position={[0, 0.36, 0.22]} material={accentMat} castShadow />

            {/* --- Arms --- */}
            {[-1, 1].map((side) => (
                <group key={side} position={[0.42 * side, 0.36, 0]}>
                    <mesh material={bodyMat} castShadow>
                        <capsuleGeometry args={[0.075, 0.28, 6, 12]} />
                    </mesh>
                    {/* Hand */}
                    <mesh position={[0, -0.22, 0]} material={accentMat} castShadow>
                        <sphereGeometry args={[0.09, 16, 16]} />
                    </mesh>
                </group>
            ))}

            {/* --- Legs (small, cute, stubby) --- */}
            {[-1, 1].map((side) => (
                <mesh key={side} position={[0.16 * side, -0.02, 0]} material={darkMat} castShadow>
                    <capsuleGeometry args={[0.09, 0.18, 6, 12]} />
                </mesh>
            ))}

            {/* --- Head group --- */}
            <group ref={headRef} position={[0, 0.78, 0]}>
                {/* Big round cute head */}
                <mesh material={headMat} castShadow>
                    <sphereGeometry args={[0.36, 32, 32]} />
                </mesh>

                {/* Antenna */}
                <mesh position={[0, 0.4, 0]} material={darkMat}>
                    <cylinderGeometry args={[0.012, 0.012, 0.16, 8]} />
                </mesh>
                <mesh position={[0, 0.49, 0]} material={eyeGlow}>
                    <sphereGeometry args={[0.035, 16, 16]} />
                </mesh>

                {/* Eyes — big + round = cute */}
                <mesh ref={leftEyeRef} position={[-0.14, 0.03, 0.31]} material={eyeGlow}>
                    <sphereGeometry args={[0.075, 20, 20]} />
                </mesh>
                <mesh ref={rightEyeRef} position={[0.14, 0.03, 0.31]} material={eyeGlow}>
                    <sphereGeometry args={[0.075, 20, 20]} />
                </mesh>

                {/* Mouth — scales with lip-sync amplitude */}
                <mesh ref={mouthRef} position={[0, -0.12, 0.335]} material={mouthMat}>
                    <capsuleGeometry args={[0.045, 0.05, 4, 8]} />
                </mesh>

                {/* Cheek accent dots (cute blush-style panels) */}
                {[-1, 1].map((side) => (
                    <mesh key={side} position={[0.24 * side, -0.05, 0.24]} material={accentMat}>
                        <circleGeometry args={[0.04, 16]} />
                    </mesh>
                ))}
            </group>
        </group>
    );
}

// ---------------------------------------------------------------------------
// Hologram ring (unchanged concept from your original scene)
// ---------------------------------------------------------------------------
function HologramRing({ themeColor }: { themeColor: string }) {
    const ringRef1 = useRef<THREE.Mesh>(null);
    const ringRef2 = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        const elapsed = state.clock.getElapsedTime();
        if (ringRef1.current) ringRef1.current.rotation.z = elapsed * 0.4;
        if (ringRef2.current) ringRef2.current.rotation.z = -elapsed * 0.25;
    });

    return (
        <group position={[0, -1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <mesh ref={ringRef1}>
                <ringGeometry args={[0.5, 0.68, 32]} />
                <meshBasicMaterial color={themeColor} side={THREE.DoubleSide} transparent opacity={0.3} wireframe />
            </mesh>
            <mesh ref={ringRef2}>
                <ringGeometry args={[0.5, 0.65, 8]} />
                <meshBasicMaterial color={themeColor} side={THREE.DoubleSide} transparent opacity={0.45} wireframe />
            </mesh>
            <mesh>
                <circleGeometry args={[0.35, 6]} />
                <meshBasicMaterial color={themeColor} side={THREE.DoubleSide} transparent opacity={0.12} wireframe />
            </mesh>
        </group>
    );
}

// Small internal component so useFrame can drive the lip-sync envelope
// even though the hook itself lives outside the Canvas (DOM/JS land).
function EnvelopeDriver({ updateEnvelope }: { updateEnvelope: (delta: number) => void }) {
    useFrame((_, delta) => updateEnvelope(delta));
    return null;
}

// ---------------------------------------------------------------------------
// Main exported component
// ---------------------------------------------------------------------------
interface CuteRobotSceneProps {
    theme?: ThemeName;
    hologram?: boolean;
    lookAtMouse?: boolean;
    interactive?: boolean;
    showControls?: boolean; // show the built-in text-to-speak UI panel
}

export default function CuteRobotScene({
    theme = "cyan",
    hologram = true,
    lookAtMouse = true,
    interactive = true,
    showControls = true,
}: CuteRobotSceneProps) {
    const currentThemeColor = THEME_COLORS[theme] || THEME_COLORS.cyan;
    const { isSpeaking, speak, stop, mouthOpenRef, updateEnvelope } = useTalkingMouth();
    const [text, setText] = useState("Hi there! I'm your friendly robot assistant.");
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
    const [voiceName, setVoiceName] = useState<string>("");

    useEffect(() => {
        if (typeof window === "undefined" || !window.speechSynthesis) return;
        const loadVoices = () => setVoices(window.speechSynthesis.getVoices());
        loadVoices();
        window.speechSynthesis.onvoiceschanged = loadVoices;
    }, []);

    return (
        <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column" }}>
            <div style={{ flex: 1, position: "relative", minHeight: 360 }}>
                <Canvas
                    shadows
                    camera={{ position: [0, 0.45, 2.25], fov: 42 }}
                    gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
                    onCreated={({ gl }) => {
                        gl.setClearColor(0x000000, 0);
                        gl.shadowMap.type = THREE.PCFSoftShadowMap;
                        gl.domElement.addEventListener("wheel", (e) => e.preventDefault(), { passive: false });
                    }}
                    style={{ background: "transparent", touchAction: "none" }}
                >
                    <ambientLight intensity={0.55} />
                    <directionalLight
                        position={[3, 5, 4]}
                        intensity={1.8}
                        color={currentThemeColor.str}
                        castShadow
                        shadow-mapSize={[1024, 1024]}
                    />
                    <directionalLight position={[-4, 2, -2]} intensity={0.4} color="#38bdf8" />
                    <pointLight position={[0, -1, 0.5]} intensity={1.5} distance={2.5} color={currentThemeColor.str} />
                    <pointLight position={[1, 1.5, 2]} intensity={0.3} color="#ffffff" />

                    {/* HDRI environment = the key ingredient for realistic metal reflections */}
                    <Suspense fallback={null}>
                        <Environment preset="city" />
                        <CuteRobotMesh themeColor={currentThemeColor} lookAtMouse={lookAtMouse} mouthOpenRef={mouthOpenRef} />
                    </Suspense>
                    <EnvelopeDriver updateEnvelope={updateEnvelope} />

                    {hologram && <HologramRing themeColor={currentThemeColor.str} />}

                    {interactive && (
                        <OrbitControls
                            enableZoom={false}
                            enablePan={false}
                            minPolarAngle={Math.PI / 2.8}
                            maxPolarAngle={Math.PI / 1.8}
                            autoRotate={!isSpeaking}
                            autoRotateSpeed={0.55}
                            target={[0, -0.05, 0]}
                        />
                    )}
                </Canvas>
            </div>

            {showControls && (
                <div
                    style={{
                        display: "flex",
                        gap: 8,
                        padding: 12,
                        alignItems: "center",
                        borderTop: "1px solid rgba(255,255,255,0.1)",
                        background: "rgba(0,0,0,0.15)",
                    }}
                >
                    <input
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Type something for the robot to say..."
                        style={{
                            flex: 1,
                            padding: "8px 12px",
                            borderRadius: 8,
                            border: "1px solid rgba(255,255,255,0.2)",
                            background: "rgba(255,255,255,0.05)",
                            color: "white",
                            outline: "none",
                        }}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") speak(text, voiceName || undefined);
                        }}
                    />
                    {voices.length > 0 && (
                        <select
                            value={voiceName}
                            onChange={(e) => setVoiceName(e.target.value)}
                            style={{
                                padding: "8px",
                                borderRadius: 8,
                                background: "rgba(255,255,255,0.05)",
                                color: "white",
                                border: "1px solid rgba(255,255,255,0.2)",
                                maxWidth: 160,
                            }}
                        >
                            <option value="">Default voice</option>
                            {voices.map((v) => (
                                <option key={v.name} value={v.name}>
                                    {v.name}
                                </option>
                            ))}
                        </select>
                    )}
                    <button
                        onClick={() => speak(text, voiceName || undefined)}
                        disabled={isSpeaking}
                        style={{
                            padding: "8px 16px",
                            borderRadius: 8,
                            border: "none",
                            background: currentThemeColor.str,
                            color: "#0a0a0a",
                            fontWeight: 600,
                            cursor: isSpeaking ? "not-allowed" : "pointer",
                            opacity: isSpeaking ? 0.6 : 1,
                        }}
                    >
                        {isSpeaking ? "Speaking…" : "Speak"}
                    </button>
                    <button
                        onClick={stop}
                        style={{
                            padding: "8px 16px",
                            borderRadius: 8,
                            border: "1px solid rgba(255,255,255,0.3)",
                            background: "transparent",
                            color: "white",
                            cursor: "pointer",
                        }}
                    >
                        Stop
                    </button>
                </div>
            )}
        </div>
    );
}