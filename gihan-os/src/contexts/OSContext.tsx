"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { apps, type AppId } from "@/data/portfolio";
import type { OSSettings, WallpaperId, WindowInstance } from "@/types/os";

interface OSContextType {
  booted: boolean;
  setBooted: (v: boolean) => void;
  windows: WindowInstance[];
  activeWindowId: AppId | null;
  startMenuOpen: boolean;
  setStartMenuOpen: (v: boolean) => void;
  settings: OSSettings;
  openWindow: (id: AppId) => void;
  closeWindow: (id: AppId) => void;
  minimizeWindow: (id: AppId) => void;
  maximizeWindow: (id: AppId) => void;
  restoreWindow: (id: AppId) => void;
  focusWindow: (id: AppId) => void;
  moveWindow: (id: AppId, x: number, y: number) => void;
  updateSetting: <K extends keyof OSSettings>(key: K, value: OSSettings[K]) => void;
}

const OSContext = createContext<OSContextType | null>(null);

const DEFAULT_SETTINGS: OSSettings = {
  wallpaper: "starfield",
  reduceMotion: false,
  showRobot: true,
  soundEnabled: false,
  robotAvatar: "robot",
  robotTheme: "cyan",
  robotHologram: true,
  robotLookAtMouse: true,
  // Display Settings
  themeMode: "dark",
  accentColor: "#06b6d4",
  taskbarPosition: "bottom",
  taskbarTransparency: 0.8,
  desktopIconSize: "medium",
  // System Settings
  bootAnimation: true,
  autoOpenWelcome: true,
  windowSnap: true,
  desktopGrid: false,
  // Accessibility
  highContrast: false,
  reducedParticles: false,
  largerText: false,
  // Performance
  disable3DRobot: false,
  lowPowerMode: false,
  // Personalization
  desktopIconLabels: true,
  startMenuLayout: "expanded",
  clockFormat: "12h",
};

function getApp(id: AppId) {
  return apps.find((a) => a.id === id)!;
}

const TASKBAR_H = 52;

function getWindowPosition(width: number, height: number, index: number) {
  const vw = typeof window !== "undefined" ? window.innerWidth : 1280;
  const vh =
    typeof window !== "undefined" ? window.innerHeight - TASKBAR_H : 720;
  const offset = (index % 6) * 22;

  return {
    x: Math.max(16, Math.round((vw - width) / 2) + offset),
    y: Math.max(16, Math.round((vh - height) / 2) + offset),
  };
}

export function OSProvider({ children }: { children: ReactNode }) {
  const [booted, setBooted] = useState(false);
  const [windows, setWindows] = useState<WindowInstance[]>([]);
  const [activeWindowId, setActiveWindowId] = useState<AppId | null>(null);
  const [startMenuOpen, setStartMenuOpen] = useState(false);
  const [settings, setSettings] = useState<OSSettings>(DEFAULT_SETTINGS);
  const [topZ, setTopZ] = useState(10);
  const initialWindowShown = useRef(false);

  const focusWindow = useCallback((id: AppId) => {
    setTopZ((z) => {
      const next = z + 1;
      setWindows((prev) =>
        prev.map((w) => (w.id === id ? { ...w, zIndex: next } : w))
      );
      return next;
    });
    setActiveWindowId(id);
  }, []);

  const openWindow = useCallback(
    (id: AppId) => {
      setStartMenuOpen(false);

      setWindows((prev) => {
        const existing = prev.find((w) => w.id === id);
        if (existing) {
          return prev.map((w) =>
            w.id === id ? { ...w, minimized: false } : w
          );
        }

        const app = getApp(id);
        const isTabletOrMobile = typeof window !== 'undefined' && window.innerWidth <= 1024;
        const shouldMaximize = isTabletOrMobile && id === 'projects';

        const pos = getWindowPosition(
          app.defaultSize.w,
          app.defaultSize.h,
          prev.length
        );
        return [
          ...prev,
          {
            id,
            title: app.title,
            icon: app.icon,
            minimized: false,
            maximized: shouldMaximize,
            x: pos.x,
            y: pos.y,
            width: app.defaultSize.w,
            height: app.defaultSize.h,
            zIndex: 0,
          },
        ];
      });

      setTopZ((z) => {
        const next = z + 1;
        setWindows((prev) =>
          prev.map((w) => (w.id === id ? { ...w, zIndex: next } : w))
        );
        return next;
      });
      setActiveWindowId(id);
    },
    []
  );

  const closeWindow = useCallback((id: AppId) => {
    setWindows((prev) => prev.filter((w) => w.id !== id));
    setActiveWindowId((current) => (current === id ? null : current));
  }, []);

  const minimizeWindow = useCallback((id: AppId) => {
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, minimized: true } : w))
    );
    setActiveWindowId((current) => (current === id ? null : current));
  }, []);

  const maximizeWindow = useCallback((id: AppId) => {
    setWindows((prev) =>
      prev.map((w) =>
        w.id === id ? { ...w, maximized: !w.maximized, minimized: false } : w
      )
    );
    focusWindow(id);
  }, [focusWindow]);

  const restoreWindow = useCallback(
    (id: AppId) => {
      setWindows((prev) =>
        prev.map((w) =>
          w.id === id ? { ...w, minimized: false, maximized: false } : w
        )
      );
      focusWindow(id);
    },
    [focusWindow]
  );

  const moveWindow = useCallback((id: AppId, x: number, y: number) => {
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, x, y } : w))
    );
  }, []);

  const updateSetting = useCallback(
    <K extends keyof OSSettings>(key: K, value: OSSettings[K]) => {
      setSettings((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  // Open about window on first boot
  useEffect(() => {
    if (booted && !initialWindowShown.current) {
      initialWindowShown.current = true;
      setTimeout(() => {
        openWindow("about");
      }, 500);
    }
  }, [booted, openWindow]);

  const value = useMemo(
    () => ({
      booted,
      setBooted,
      windows,
      activeWindowId,
      startMenuOpen,
      setStartMenuOpen,
      settings,
      openWindow,
      closeWindow,
      minimizeWindow,
      maximizeWindow,
      restoreWindow,
      focusWindow,
      moveWindow,
      updateSetting,
    }),
    [
      booted,
      windows,
      activeWindowId,
      startMenuOpen,
      settings,
      openWindow,
      closeWindow,
      minimizeWindow,
      maximizeWindow,
      restoreWindow,
      focusWindow,
      moveWindow,
      updateSetting,
    ]
  );

  return <OSContext.Provider value={value}>{children}</OSContext.Provider>;
}

export function useOS() {
  const ctx = useContext(OSContext);
  if (!ctx) throw new Error("useOS must be used within OSProvider");
  return ctx;
}
