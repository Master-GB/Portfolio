"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, Power } from "lucide-react";

import { apps, profile } from "@/data/portfolio";
import { useOS } from "@/contexts/OSContext";

export default function StartMenu() {
  const { startMenuOpen, setStartMenuOpen, openWindow, setBooted } = useOS();

  return (
    <AnimatePresence>
      {startMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: 12, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.98 }}
          transition={{ type: "spring", stiffness: 400, damping: 28 }}
          onClick={(e) => e.stopPropagation()}
          className="os-panel absolute bottom-[calc(var(--taskbar-h)+8px)] left-3 z-50 w-[min(340px,calc(100vw-24px))] overflow-hidden rounded-lg border border-slate-700 bg-[var(--panel-bg)] shadow-2xl shadow-black/50"
        >
          <div className="border-b border-slate-700 bg-slate-800 p-5">
            <p className="text-lg font-semibold">{profile.fullName}</p>
            <p className="text-sm text-slate-300">{profile.title}</p>
            <p className="mt-1 text-xs text-indigo-300">{profile.tagline}</p>
          </div>

          <div className="grid grid-cols-2 gap-1 p-2">
            {apps.map((app) => (
              <button
                key={app.id}
                onClick={() => openWindow(app.id)}
                className="flex items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm hover:bg-slate-800 transition-colors"
              >
                <app.icon size={18} className="text-indigo-400" />
                {app.title}
              </button>
            ))}
          </div>

          <div className="border-t border-slate-700 p-2 flex gap-1">
            <a
              href={profile.socials[0].url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-1 items-center justify-center gap-2 rounded-md py-2 text-xs text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <ExternalLink size={14} />
              GitHub
            </a>
            <button
              onClick={() => {
                setStartMenuOpen(false);
                setBooted(false);
              }}
              className="flex items-center gap-2 rounded-md px-3 py-2 text-xs text-slate-500 hover:bg-red-950 hover:text-red-300 transition-colors"
            >
              <Power size={14} />
              Reboot
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
