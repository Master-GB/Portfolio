"use client";



import { useState, useEffect, useRef, useMemo } from "react";

import dynamic from "next/dynamic";

import { motion, AnimatePresence } from "framer-motion";



import { apps, profile } from "@/data/portfolio";

import { useOS } from "@/contexts/OSContext";

import Wallpaper from "./Wallpaper";

import DesktopIcon from "./DesktopIcon";

import Taskbar from "./Taskbar";

import StartMenu from "./StartMenu";

import WindowManager from "@/components/windows/WindowManager";

import ContextMenu from "@/components/desktop/ContextMenu";

import { sound } from "@/lib/sound";
import { cn } from "@/lib/utils";



const RobotScene = dynamic(() => import("@/components/3d/RobotScene"), {

  ssr: false,

  loading: () => null,

});



const APP_TIPS: Record<string, string[]> = {
  about: ["Want to know more about Gihan? You're in the right place! 👤"],
  projects: ["Here you can see all the awesome projects! 🚀", "Click on a project to see more details! 🔍"],
  skills: ["Wow, look at all those skills! 💻", "Hover over the skills to see proficiency! ⭐"],
  education: ["SLIIT represents! 🎓", "Check out the certifications tab too! 🏆"],
  contact: ["Ready to reach out? Send a message! 📬", "You can also find social links here! 🌐"],
  terminal: ["Try typing 'matrix' or 'joke' here! 📟", "Type 'help' to see available commands! 💡"],
  settings: ["Customize the OS to your liking! ⚙️", "Try changing the wallpaper! 🎨"],
  explorer: ["Browse through the file system! 📁"],
  notepad: ["Jot down some ideas! 📝"],
  resume: ["Check out that CV! 📄"],
};

function getTimeTips(openApps: string[], activeAppId: string | null): string[] {
  if (activeAppId && APP_TIPS[activeAppId]) {
    return APP_TIPS[activeAppId];
  }

  const h = new Date().getHours();
  const base: string[] = [];

  if (h < 6) base.push("Burning the midnight oil? ☕ Let me help!");
  else if (h < 12) base.push("Good morning! Ready to explore? ☀️");
  else if (h < 17) base.push("Afternoon! Check out Gihan's projects! 🚀");
  else if (h < 21) base.push("Evening vibes! Try the tech quiz! 🎮");
  else base.push("Late night coding? I know the feeling! 🌙");

  if (!openApps.includes("projects")) base.push("📂 Check out 8 awesome projects inside!");
  if (!openApps.includes("skills")) base.push("💻 Explore 40+ skills across 9 categories!");
  if (!openApps.includes("contact")) base.push("📬 Interested? Let's get in touch!");

  base.push(
    "Click me for an AI-powered tour! 🤖",
    "Try 'search' or 'compare' commands! 🔍",
    "I can play a tech quiz game! 🎮",
    "Right-click desktop for settings! ⚙️",
    "Ask me to compare React vs Angular! ⚔️",
    "Type 'stats' for portfolio analytics! 📊",
  );

  return base;
}



export default function Desktop() {
  const { booted, settings, openWindow, setStartMenuOpen, windows, activeWindowId } = useOS();
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [tipIndex, setTipIndex] = useState(0);
  const robotRef = useRef<HTMLDivElement>(null);

  // Apply theme mode, high contrast, accent color, and larger text classes to document element
  useEffect(() => {
    if (typeof window === "undefined") return;
    const root = document.documentElement;
    
    // Theme Mode
    if (settings.themeMode === "light") {
      root.classList.add("light-mode");
    } else {
      root.classList.remove("light-mode");
    }

    // Larger Text
    if (settings.largerText) {
      root.classList.add("larger-text");
    } else {
      root.classList.remove("larger-text");
    }

    // Accent Colors
    const accents = ["accent-indigo", "accent-rose", "accent-emerald", "accent-amber", "accent-cyan"];
    accents.forEach((cls) => root.classList.remove(cls));
    root.classList.add(`accent-${settings.accentColor}`);
  }, [settings.themeMode, settings.largerText, settings.accentColor]);

  const showRobotActive = settings.showRobot && !settings.disableRobot;

  // Force robot to stay in position using requestAnimationFrame loop
  useEffect(() => {
    if (!robotRef.current || !showRobotActive) return;

    const forcePosition = () => {
      if (!robotRef.current) return;

      const rect = robotRef.current.getBoundingClientRect();
      const taskbarHeight = 52;
      const expectedBottom = settings.taskbarPosition === "bottom" ? taskbarHeight : 8;
      const expectedRight = settings.taskbarPosition === "right" ? taskbarHeight : 8;

      const actualBottom = window.innerHeight - rect.bottom;

      // If robot has moved, force it back
      if (Math.abs(actualBottom - expectedBottom) > 0.5) {
        robotRef.current.style.bottom = `${expectedBottom}px`;
        robotRef.current.style.right = `${expectedRight}px`;
        robotRef.current.style.position = 'fixed';
      }

      requestAnimationFrame(forcePosition);
    };

    const animationId = requestAnimationFrame(forcePosition);

    return () => cancelAnimationFrame(animationId);
  }, [showRobotActive, settings.taskbarPosition]);

  const robotOpen = windows.some((w) => w.id === "robot_assistant");
  
  const openAppIds = useMemo(() => windows.map((w) => w.id), [windows]);
  const tips = useMemo(() => getTimeTips(openAppIds, activeWindowId), [openAppIds, activeWindowId]);

  useEffect(() => {
    setTipIndex(0);
  }, [activeWindowId]);

  // Cycle tips every 12 seconds (only when robot is visible and assistant isn't open)
  useEffect(() => {
    if (!showRobotActive || robotOpen || tips.length <= 1) return;

    const interval = setInterval(() => {
      setTipIndex((prev) => prev + 1);
    }, 12000);

    return () => clearInterval(interval);
  }, [showRobotActive, robotOpen, tips.length]);

  if (!booted) return null;

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  const getDesktopPaddingClass = () => {
    switch (settings.taskbarPosition) {
      case "top":
        return "pt-[var(--taskbar-h)] pb-0 pl-0 pr-0";
      case "left":
        return "pl-[var(--taskbar-h)] pt-0 pb-0 pr-0";
      case "right":
        return "pr-[var(--taskbar-h)] pt-0 pb-0 pl-0";
      case "bottom":
      default:
        return "pb-[var(--taskbar-h)] pt-0 pl-0 pr-0";
    }
  };

  const getTaskbarWrapperClass = () => {
    switch (settings.taskbarPosition) {
      case "top":
        return "absolute top-0 left-0 right-0 z-50";
      case "left":
        return "absolute left-0 top-0 bottom-0 z-50 w-[var(--taskbar-h)] flex flex-col";
      case "right":
        return "absolute right-0 top-0 bottom-0 z-50 w-[var(--taskbar-h)] flex flex-col";
      case "bottom":
      default:
        return "absolute bottom-0 left-0 right-0 z-50";
    }
  };

  const taskbarInitialY = settings.taskbarPosition === "top" ? -60 : 60;

  return (
    <div className="relative h-screen w-screen overflow-hidden select-none" onContextMenu={handleContextMenu}>
      <Wallpaper id={settings.wallpaper} />

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
        />
      )}

      <div
        className={cn("absolute inset-0 transition-all", getDesktopPaddingClass())}
        onClick={() => {
          setStartMenuOpen(false);
          setContextMenu(null);
        }}
      >
        <div className="flex h-full flex-col justify-between py-4 px-1 md:py-6 md:px-2 text-slate-200">
          {settings.showDesktopIcons && (
            <div className={cn(
              "flex h-full max-h-[calc(100vh-var(--taskbar-h)-2rem)] flex-col flex-wrap content-start gap-1 transition-all",
              settings.desktopGrid ? "gap-4 md:gap-6" : "gap-0"
            )}>
              {apps.map((app) => (
                app.id === "robot_assistant" ? (
                  <div key={app.id} className="hidden xl:flex">
                    <DesktopIcon
                      id={app.id}
                      title={app.title}
                      icon={app.icon}
                      onClick={() => openWindow(app.id)}
                    />
                  </div>
                ) : (
                  <DesktopIcon
                    key={app.id}
                    id={app.id}
                    title={app.title}
                    icon={app.icon}
                    onClick={() => openWindow(app.id)}
                  />
                )
              ))}
            </div>
          )}
        </div>

        <WindowManager />
      </div>

      {/* 3D Robot – rendered as a top-level fixed overlay (hidden while assistant open) */}
      {showRobotActive && !robotOpen && (
        <div
          ref={robotRef}
          className="pointer-events-auto fixed bottom-[var(--taskbar-h)] right-0 h-[200px] w-[200px] md:right-0 md:h-[220px] md:w-[245px] hidden xl:flex flex-col items-center justify-end group z-[9999]"
          onMouseEnter={() => {
            if (settings.soundEnabled) sound.play("beep");
          }}
          onClick={(e) => {
            e.stopPropagation();
            if (settings.soundEnabled) sound.play("click");
            openWindow("robot_assistant");
          }}
          onWheel={(e) => e.stopPropagation()}
        >
              {/* Cycling Glassmorphic Tip Bubble (hidden when assistant window is open) */}
              {!robotOpen && (
                <div className="absolute top-0 z-20 w-full flex justify-center pointer-events-none px-2">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={tips[tipIndex % tips.length]}
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.35 }}
                      className="relative rounded-2xl bg-slate-950/80 border border-slate-700/50 px-3.5 py-1.5 text-[11px] text-center text-slate-100 shadow-2xl backdrop-blur-md max-w-[210px] font-sans"
                    >
                      {tips[tipIndex % tips.length]}
                      <div className="absolute left-1/2 -bottom-1 h-2 w-2 -translate-x-1/2 rotate-45 border-r border-b border-slate-700/50 bg-slate-950/80" />
                    </motion.div>
                  </AnimatePresence>
                </div>
              )}

          {/* 3D Canvas rendering */}
          <motion.div
            initial={{ opacity: 0, scale: 1 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="h-[210px] w-full md:h-[280px] cursor-pointer relative"
            key={robotOpen ? "robot-closed" : "robot-open"}
          >
            {/* Visual pulse glow on hover */}
            <div className="absolute inset-0 rounded-full bg-indigo-500/5 opacity-0 group-hover:opacity-100 blur-2xl transition duration-500 pointer-events-none" />
            <RobotScene interactive={false} />
          </motion.div>
        </div>
      )}

      <motion.div
        initial={{ y: taskbarInitialY, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 120 }}
        className={getTaskbarWrapperClass()}
      >
        <Taskbar />
        <StartMenu />
      </motion.div>


    </div>

  );

}

