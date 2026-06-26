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

export type WallpaperId = "aurora" | "midnight" | "nebula" | "matrix" | "anime" | "macos" | "minimalist";

export interface OSSettings {
  wallpaper: WallpaperId;
  reduceMotion: boolean;
  showRobot: boolean;
  soundEnabled: boolean;
  robotAvatar: "robot" | "astronaut" | "humanoid";
  robotTheme: "cyan" | "rose" | "emerald" | "gold" | "cyberpunk";
  robotHologram: boolean;
  robotLookAtMouse: boolean;
}
