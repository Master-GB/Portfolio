import React, { useEffect, useState, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useOS } from '../../contexts/OSContext';
import { sound } from '../../lib/sound';
import { motion, AnimatePresence } from 'framer-motion';
import RobotScene from '../../components/3d/RobotScene';

// App-specific tips
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

// Time-aware tips with dynamic content
function getTimeTips(openApps: string[], activeAppId: string | null): string[] {
  // If there's an active app, prioritize its tips
  if (activeAppId && APP_TIPS[activeAppId]) {
    return APP_TIPS[activeAppId];
  }

  const h = new Date().getHours();
  const base: string[] = [];

  // Time-based tips
  if (h < 6) {
    base.push("Burning the midnight oil? ☕ Let me help!");
  } else if (h < 12) {
    base.push("Good morning! Ready to explore? ☀️");
  } else if (h < 17) {
    base.push("Afternoon! Check out Gihan's projects! 🚀");
  } else if (h < 21) {
    base.push("Evening vibes! Try the tech quiz! 🎮");
  } else {
    base.push("Late night coding? I know the feeling! 🌙");
  }

  // Dynamic tips based on what's NOT open
  if (!openApps.includes("projects")) {
    base.push("📂 Check out 8 awesome projects inside!");
  }
  if (!openApps.includes("skills")) {
    base.push("💻 Explore 40+ skills across 9 categories!");
  }
  if (!openApps.includes("contact")) {
    base.push("📬 Interested? Let's get in touch!");
  }

  // Always-available tips
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

export default function RobotPortal() {
  const { settings, openWindow, windows, activeWindowId } = useOS();
  const [tipIndex, setTipIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const openAppIds = useMemo(() => windows.map(w => w.id), [windows]);
  const tips = useMemo(() => getTimeTips(openAppIds, activeWindowId), [openAppIds, activeWindowId]);

  // Reset tip index when active window changes
  useEffect(() => {
    setTipIndex(0);
  }, [activeWindowId]);

  // Cycle tips every 10 seconds when robot is shown
  useEffect(() => {
    const robotOpen = windows.some((w) => w.id === "robot_assistant");
    if (!settings.showRobot || robotOpen || tips.length <= 1) return;
    const interval = setInterval(() => setTipIndex((i) => i + 1), 10000);
    return () => clearInterval(interval);
  }, [settings.showRobot, tips.length, windows]);

  // Hover interaction
  const handleMouseEnter = () => {
    setIsHovered(true);
    setHasInteracted(true);
    if (settings.soundEnabled) sound.play('beep');

    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    };
  }, []);

  const themeColor = settings.robotTheme || "cyan";

  return createPortal(
    // Only show portal robot when assistant isn't open
    !windows.some((w) => w.id === "robot_assistant") && (
      <div
        className="pointer-events-auto fixed bottom-[var(--taskbar-h)] right-0 h-[260px] w-[240px] md:right-2 md:h-[340px] md:w-[300px] flex flex-col items-center justify-end group z-[9999]"
        style={{ transform: "translateZ(0)", willChange: "transform" }}
        onWheel={(e) => e.stopPropagation()}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={() => {
          if (settings.soundEnabled) sound.play('click');
          openWindow('robot_assistant');
        }}
      >
        {/* Breathing glow effect under the robot */}
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[180px] h-[60px] rounded-full blur-3xl pointer-events-none z-0"
          style={{
            background: `radial-gradient(ellipse, ${getThemeGlow(themeColor)}44, transparent 70%)`,
            animation: "breathe 3s ease-in-out infinite",
          }}
        />

        {/* Status badge */}
        <div
          className={`absolute top-0 right-2 z-30 flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-mono tracking-widest border backdrop-blur-md transition-all duration-500 ${isHovered
              ? "bg-cyan-950/80 border-cyan-500/40 text-cyan-300"
              : "bg-slate-900/80 border-slate-700/50 text-slate-500"
            }`}
        >
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{
              backgroundColor: isHovered ? "#22d3ee" : "#64748b",
              boxShadow: isHovered ? "0 0 6px #22d3ee" : "none",
            }}
          />
          {isHovered ? "ACTIVE" : "ONLINE"}
        </div>

        {/* First-interaction pulse hint */}
        {!hasInteracted && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute bottom-[40px] left-1/2 -translate-x-1/2 z-30 pointer-events-none"
          >
            <motion.div
              animate={{ y: [0, -6, 0], scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="rounded-full bg-indigo-500/20 border border-indigo-400/30 px-3 py-1 text-[10px] text-indigo-300 font-medium backdrop-blur-sm"
            >
              ✨ Click me!
            </motion.div>
          </motion.div>
        )}

        {/* Tip bubble (hidden when assistant window is open) */}
        {!windows.some((w) => w.id === "robot_assistant") && (
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

        {/* 3D Canvas */}
        <motion.div key={windows.some((w) => w.id === "robot_assistant") ? "robot-closed" : "robot-open"}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="h-[210px] w-full md:h-[280px] cursor-pointer relative"
        >
          {/* Hover glow ring */}
          <div
            className={`absolute inset-0 rounded-full blur-2xl transition-all duration-500 pointer-events-none ${isHovered ? "opacity-100" : "opacity-0"
              }`}
            style={{
              background: `radial-gradient(circle, ${getThemeGlow(themeColor)}15, transparent 70%)`,
            }}
          />
          <RobotScene interactive={false} />
        </motion.div>

        {/* Inject breathing animation keyframes */}
        <style>{`
        @keyframes breathe {
          0%, 100% { opacity: 0.3; transform: translateX(-50%) scale(1); }
          50% { opacity: 0.7; transform: translateX(-50%) scale(1.15); }
        }
      `}</style>
      </div>
    ),
    document.body
  );
}

// Helper to get theme glow color
function getThemeGlow(theme: string): string {
  const map: Record<string, string> = {
    cyan: "#22d3ee",
    rose: "#f43f5e",
    emerald: "#34d399",
    gold: "#fbbf24",
    cyberpunk: "#ec4899",
  };
  return map[theme] || "#22d3ee";
}