"use client";

import { useEffect, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF, useAnimations } from "@react-three/drei";
import type { Group } from "three";
import * as THREE from "three";
import { useOS } from "@/contexts/OSContext";
import { THEME_COLORS } from "@/lib/theme";

const AVATAR_MODELS = {
  robot: "/models/robot.glb",
};

interface RobotModelProps {
  avatar: "robot";
  activeAnimation?: string;
  lookAtMouse: boolean;
  onAnimationsLoaded?: (names: string[]) => void;
}

function RobotModel({
  avatar,
  activeAnimation,
  lookAtMouse,
  onAnimationsLoaded,
}: RobotModelProps) {
  const group = useRef<Group>(null);
  const modelPath = AVATAR_MODELS[avatar];
  const { scene, animations } = useGLTF(modelPath);
  const { actions, names } = useAnimations(animations, group);

  // Traverse model to apply shadows and nice materials
  useEffect(() => {
    scene.traverse((child) => {
      if ("isMesh" in child && child.isMesh) {
        const mesh = child as THREE.Mesh;
        // Ensure mesh renders correctly
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        // Force double-sided rendering to avoid missing parts like head
        if (mesh.material && "side" in mesh.material) {
          const mat = mesh.material as THREE.MeshStandardMaterial;
          mat.side = THREE.DoubleSide;
          // Disable unintended transparency that may hide parts
          mat.transparent = false;
        }
        // Enhance metallic/roughness look if material exists
        if (mesh.material && "metalness" in mesh.material) {
          const mat = mesh.material as THREE.MeshStandardMaterial;
          if (avatar === "robot") {
            mat.roughness = 0.3;
            mat.metalness = 0.7;
          }
        }
      }
    });
  }, [scene, avatar]);

  // Report animations list up
  useEffect(() => {
    if (onAnimationsLoaded && names.length > 0) {
      onAnimationsLoaded(names);
    }
  }, [names, onAnimationsLoaded]);

  // Handle animation changes
  useEffect(() => {
    // Determine the animation name
    let animationName = activeAnimation;
    if (!animationName || !actions[animationName]) {
      // Find idle/standing fallback
      animationName =
        names.find(
          (n) =>
            n.toLowerCase().includes("idle") ||
            n.toLowerCase().includes("stand")
        ) || names[0];
    }

    if (animationName && actions[animationName]) {
      const currentAction = actions[animationName];
      if (currentAction) {
        currentAction.reset().fadeIn(0.45).play();

        return () => {
          currentAction.fadeOut(0.3);
        };
      }
    }
  }, [activeAnimation, actions, names]);

  // Track cursor movement to rotate model slightly
  useFrame((state) => {
    if (group.current) {
      if (lookAtMouse) {
        // Compute target rotations based on relative mouse coords (-1 to +1)
        const targetY = state.pointer.x * 0.5;
        const targetX = -state.pointer.y * 0.3;

        // Smooth interpolation (lerping)
        group.current.rotation.y += (targetY - group.current.rotation.y) * 0.08;
        group.current.rotation.x += (targetX - group.current.rotation.x) * 0.08;
      } else {
        // Reset rotation if pointer tracking disabled
        group.current.rotation.x += (0 - group.current.rotation.x) * 0.08;
      }
    }
  });

  // Calculate dynamic scaling and positions based on model characteristics
  // Increased scale to make the robot model larger (not the container)
  const scale = 0.26;
  // Slightly adjust vertical position to keep model visually grounded
  const positionY = -0.82;

  return (
    <primitive
      ref={group}
      object={scene}
      scale={scale}
      position={[0, positionY, 0]}
    />
  );
}

// Preload models for responsive switching
useGLTF.preload(AVATAR_MODELS.robot);

interface RobotSceneProps {
  avatar?: "robot";
  theme?: "cyan" | "rose" | "emerald" | "gold" | "cyberpunk";
  lookAtMouse?: boolean;
  activeAnimation?: string;
  onAnimationsLoaded?: (names: string[]) => void;
  interactive?: boolean;
}

export default function RobotScene({
  avatar,
  theme,
  lookAtMouse,
  activeAnimation,
  onAnimationsLoaded,
  interactive = true,
}: RobotSceneProps) {
  const { settings } = useOS();

  // Fallback to settings if props are not explicitly provided
  const activeAvatar = avatar ?? settings.robotAvatar ?? "robot";
  const activeTheme = theme ?? settings.robotTheme ?? "cyan";
  const isLookAtMouse = lookAtMouse ?? settings.robotLookAtMouse ?? true;

  const currentThemeColor = THEME_COLORS[activeTheme] || THEME_COLORS.cyan;

  return (
    <Canvas
      shadows
      camera={{ position: [0, 0.45, 2.25], fov: 42 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      onCreated={({ gl }) => {
        gl.setClearColor(0x000000, 0);
        gl.shadowMap.type = THREE.PCFShadowMap;
        // Block wheel events on the canvas DOM element to prevent
        // scroll-based camera shifts or event bubbling
        gl.domElement.addEventListener("wheel", (e) => e.preventDefault(), { passive: false });
      }}
      style={{ background: "transparent", touchAction: "none" }}
    >
      <ambientLight intensity={0.55} />
      {/* Dynamic Main Key Light */}
      <directionalLight
        position={[3, 5, 4]}
        intensity={1.8}
        color={currentThemeColor.str}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      {/* Cool blue/slate fill light */}
      <directionalLight position={[-4, 2, -2]} intensity={0.4} color="#38bdf8" />
      {/* Bottom up glow light matching active theme */}
      <pointLight
        position={[0, -1, 0.5]}
        intensity={1.5}
        distance={2.5}
        color={currentThemeColor.str}
      />
      <pointLight position={[1, 1.5, 2]} intensity={0.3} color="#ffffff" />

      {/* Robot model */}
      <RobotModel
        avatar={activeAvatar}
        activeAnimation={activeAnimation}
        lookAtMouse={isLookAtMouse}
        onAnimationsLoaded={onAnimationsLoaded}
      />

      {interactive && (
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          minPolarAngle={Math.PI / 2.8}
          maxPolarAngle={Math.PI / 1.8}
          autoRotate={!activeAnimation}
          autoRotateSpeed={0.55}
          target={[0, -0.05, 0]}
        />
      )}
    </Canvas>
  );
}