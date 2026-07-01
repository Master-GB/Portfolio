import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useOS } from '../../contexts/OSContext';
import { sound } from '../../lib/sound';
import { motion, AnimatePresence } from 'framer-motion';
import RobotScene from '../../components/3d/RobotScene';

const DESKTOP_TIPS = [
  "Hi! Click me for an AI tour! 🚀",
  "Need help? Double-click icons to run apps!",
  "Right-click the desktop for settings! ⚙️",
  "Try changing my look in the AI Byte App! 🦾",
  "Type 'matrix' or 'joke' in the Terminal! 📟",
  "Ask me to swap your wallpaper! 🎨",
];

export default function RobotPortal() {
  const { settings, openWindow } = useOS();
  const [tipIndex, setTipIndex] = useState(0);

  // Cycle tips every 12 seconds when robot is shown
  useEffect(() => {
    if (!settings.showRobot) return;
    const interval = setInterval(() => setTipIndex((i) => (i + 1) % DESKTOP_TIPS.length), 12000);
    return () => clearInterval(interval);
  }, [settings.showRobot]);

  return createPortal(
    <div
      className="pointer-events-auto fixed bottom-[var(--taskbar-h)] right-0 h-[260px] w-[240px] md:right-2 md:h-[340px] md:w-[300px] flex flex-col items-center justify-end group z-[9999]"
      style={{ transform: "translateZ(0)", willChange: "transform" }}
      onWheel={(e) => e.stopPropagation()}
      onMouseEnter={() => {
        if (settings.soundEnabled) sound.play('beep');
      }}
      onClick={() => {
        if (settings.soundEnabled) sound.play('click');
        openWindow('robot_assistant');
      }}
    >
      {/* Tip bubble */}
      <div className="absolute top-0 z-20 w-full flex justify-center pointer-events-none px-2">
        <AnimatePresence mode="wait">
          <motion.div
            key={tipIndex}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.35 }}
            className="relative rounded-2xl bg-slate-950/80 border border-slate-700/50 px-3.5 py-1.5 text-[11px] text-center text-slate-100 shadow-2xl backdrop-blur-md max-w-[210px] font-sans"
          >
            {DESKTOP_TIPS[tipIndex]}
            <div className="absolute left-1/2 -bottom-1 h-2 w-2 -translate-x-1/2 rotate-45 border-r border-b border-slate-700/50 bg-slate-950/80" />
          </motion.div>
        </AnimatePresence>
      </div>
      {/* 3D Canvas */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4, duration: 0.8 }}
        className="h-[210px] w-full md:h-[280px] cursor-pointer relative"
      >
        <div className="absolute inset-0 rounded-full bg-indigo-500/5 opacity-0 group-hover:opacity-100 blur-2xl transition duration-500 pointer-events-none" />
        <RobotScene interactive={false} />
      </motion.div>
    </div>,
    document.body
  );
}
