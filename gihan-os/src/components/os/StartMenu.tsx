"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Power, User, ExternalLink } from "lucide-react";

import { apps, profile } from "@/data/portfolio";
import { useOS } from "@/contexts/OSContext";

export default function StartMenu() {
  const { startMenuOpen, setStartMenuOpen, openWindow } = useOS();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredApps = useMemo(() => {
    if (!searchQuery) return apps;
    const lower = searchQuery.toLowerCase();
    return apps.filter((app) => app.title.toLowerCase().includes(lower));
  }, [searchQuery]);

  return (
    <AnimatePresence>
      {startMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: 20, scale: 0.95, filter: "blur(10px)" }}
          transition={{ type: "spring", stiffness: 350, damping: 25 }}
          onClick={(e) => e.stopPropagation()}
          className="absolute bottom-[calc(var(--taskbar-h)+16px)] left-4 z-50 w-[min(440px,calc(100vw-32px))] overflow-hidden rounded-2xl border border-white/10 bg-slate-950/70 backdrop-blur-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7)]"
        >
          {/* Top Edge Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/60 to-transparent" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/4 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/80 to-transparent blur-[1px]" />

          {/* Header & Search */}
          <div className="p-6 pb-2">
            <div className="relative group">
              {/* Animated glow behind search */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-500" />
              <div className="relative flex items-center gap-3 rounded-xl border border-white/10 bg-black/40 px-4 py-3 backdrop-blur-md">
                <Search size={18} className="text-slate-400 group-focus-within:text-cyan-400 transition-colors" />
                <input
                  type="text"
                  placeholder="Type to search apps..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent text-sm text-white placeholder-slate-500 outline-none"
                  autoFocus
                />
              </div>
            </div>
          </div>

          {/* App Grid */}
          <div className="px-6 pt-4 pb-6 min-h-[340px] max-h-[420px] overflow-y-auto os-scrollbar">
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              {searchQuery ? "Search Results" : "Pinned Applications"}
            </h3>

            {filteredApps.length > 0 ? (
              <div className="grid grid-cols-4 gap-x-2 gap-y-4">
                {filteredApps.map((app) => (
                  <motion.button
                    key={app.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      openWindow(app.id);
                      setStartMenuOpen(false);
                      setSearchQuery("");
                    }}
                    className="group relative flex flex-col items-center gap-3 rounded-2xl p-2 hover:bg-white/[0.04] transition-colors"
                  >
                    <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.01] border border-white/10 group-hover:border-indigo-500/40 group-hover:shadow-[0_0_20px_rgba(99,102,241,0.2)] transition-all duration-300">
                      <app.icon size={26} className="text-slate-300 group-hover:text-cyan-300 transition-colors duration-300" />
                    </div>
                    <span className="text-[11px] font-medium text-slate-400 group-hover:text-white truncate w-full text-center transition-colors">
                      {app.title}
                    </span>
                  </motion.button>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 text-slate-500">
                <Search size={32} className="mb-4 opacity-20" />
                <p className="text-sm">No applications found</p>
              </div>
            )}
          </div>

          {/* Footer - Profile & Power */}
          <div className="relative border-t border-white/5 bg-black/40 p-5 backdrop-blur-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-400 p-[2px]">
                <div className="flex h-full w-full items-center justify-center rounded-full bg-slate-950 overflow-hidden">
                  <img src="/profile.jpeg" alt="Profile" className="h-full w-full object-cover" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-slate-100 tracking-wide">{profile.fullName}</span>
                <span className="text-[10px] uppercase tracking-wider text-cyan-400/80">{profile.title}</span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <a
                href={profile.socials[0].url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex h-10 w-10 items-center justify-center rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-all duration-300"
                title="GitHub"
              >
                <ExternalLink size={18} className="group-hover:scale-110 transition-transform" />
              </a>
              <button
                onClick={() => {
                  window.location.reload();
                }}
                className="group relative flex h-10 w-10 items-center justify-center rounded-xl hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-all duration-300"
                title="Reboot"
              >
                <Power size={18} className="group-hover:scale-110 group-hover:drop-shadow-[0_0_8px_rgba(248,113,113,0.8)] transition-all" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
