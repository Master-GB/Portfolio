import type { LucideIcon } from "lucide-react";
import type { AppId } from "@/data/portfolio";

export interface WindowInstance {
  id: AppId;
  title: string;
  icon: LucideIcon;
  minimized: boolean;
  maximized: boolean;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
}

export type WallpaperId =
  | "starfield"      // Warp-speed 3D star field
  | "nebula_pulse"   // Breathing nebula gas clouds
  | "black_hole"     // Rotating accretion disc particle system
  | "cosmic_dust"    // Galaxy-arm spiral dust drift
  | "aurora_galaxy"; // Space aurora curtains

export interface OSSettings {
  wallpaper: WallpaperId;
  reduceMotion: boolean;
  showRobot: boolean;
  soundEnabled: boolean;
  robotAvatar: "robot";
  robotTheme: "cyan" | "rose" | "emerald" | "gold" | "cyberpunk";
  robotHologram: boolean;
  robotLookAtMouse: boolean;

  // Display Settings
  themeMode: "dark" | "light";
  accentColor: "indigo" | "rose" | "emerald" | "amber" | "cyan";
  taskbarPosition: "bottom" | "top" | "left" | "right";
  taskbarOpacity: number;
  desktopIconSize: "small" | "medium" | "large";

  // System Settings
  bootAnimation: boolean;
  autoOpenWelcome: boolean;
  windowSnap: boolean;
  desktopGrid: boolean;

  // Accessibility
  reducedParticles: boolean;
  largerText: boolean;

  // Performance
  disableRobot: boolean;
  reduceAnimations: boolean;
  lowPowerMode: boolean;

  // Personalization
  showIconLabels: boolean;
  startMenuLayout: "compact" | "expanded";
  clockFormat: "12h" | "24h";
  clockSeconds: boolean;
  showDesktopIcons: boolean;
}

