"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { profile } from "@/data/portfolio";
import { useOS } from "@/contexts/OSContext";

const BOOT_LINES = [
  "GihanOS v1.0 — Personal Developer Operating System",
  "Loading kernel modules...",
  "Mounting portfolio filesystem...",
  "Initializing 3D renderer...",
  "Starting window manager...",
  `Welcome, ${profile.name}.`,
];

export default function BootScreen() {
  const { booted, setBooted, settings } = useOS();
  const [lines, setLines] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (booted || settings.reduceMotion) {
      setBooted(true);
      return;
    }

    let lineIndex = 0;
    const lineInterval = setInterval(() => {
      if (lineIndex < BOOT_LINES.length) {
        setLines((prev) => [...prev, BOOT_LINES[lineIndex]]);
        lineIndex++;
        setProgress(Math.round((lineIndex / BOOT_LINES.length) * 100));
      } else {
        clearInterval(lineInterval);
        setTimeout(() => setBooted(true), 600);
      }
    }, 380);

    return () => clearInterval(lineInterval);
  }, [booted, setBooted, settings.reduceMotion]);

  return (
    <AnimatePresence>
      {!booted && (
        <motion.div
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#030712] font-mono"
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.6 }}
        >

          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.15),transparent_70%)]" />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative z-10 w-full max-w-lg px-8"
          >
            <div className="mb-8 flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center text-lg font-bold shadow-lg shadow-indigo-500/30">
                G
              </div>
              <div>
                <h1 className="text-xl font-semibold tracking-tight">GihanOS</h1>
                <p className="text-xs text-slate-500">Boot sequence</p>
              </div>
            </div>

            <div className="mb-6 h-32 space-y-1.5 text-sm text-emerald-400/90">
              {lines.map((line, i) => (
                <motion.p
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <span className="text-slate-600 mr-2">{">"}</span>
                  {line}
                </motion.p>
              ))}
              <span className="inline-block h-4 w-2 animate-pulse bg-emerald-400/80" />
            </div>

            <div className="h-1 w-full overflow-hidden rounded-full bg-slate-800">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-cyan-400 to-pink-400"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <p className="mt-2 text-right text-xs text-slate-600">{progress}%</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
