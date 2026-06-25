"use client";

import { useEffect, useState } from "react";
import { LayoutGrid, Wifi } from "lucide-react";

import { profile } from "@/data/portfolio";
import { useOS } from "@/contexts/OSContext";
import { cn } from "@/lib/utils";

function Clock() {
  const [time, setTime] = useState("");

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      );
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return <span className="tabular-nums">{time}</span>;
}

export default function Taskbar() {
  const {
    windows,
    activeWindowId,
    startMenuOpen,
    setStartMenuOpen,
    openWindow,
    restoreWindow,
    minimizeWindow,
  } = useOS();

  return (
    <div className="os-panel flex h-[var(--taskbar-h)] items-center gap-2 border-t border-slate-700 bg-[var(--panel-bg)] px-3">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setStartMenuOpen(!startMenuOpen);
        }}
        className={cn(
          "flex h-10 items-center gap-2 rounded-md px-3 text-sm font-medium transition-colors",
          startMenuOpen
            ? "bg-indigo-600 text-white"
            : "hover:bg-slate-800"
        )}
      >
        <LayoutGrid size={18} />
        <span className="hidden sm:inline">Start</span>
      </button>

      <div className="h-6 w-px bg-slate-700" />

      <div className="flex flex-1 items-center gap-1 overflow-x-auto">
        {windows.map((w) => (
          <button
            key={w.id}
            onClick={(e) => {
              e.stopPropagation();
              if (w.minimized || activeWindowId !== w.id) {
                restoreWindow(w.id);
              } else {
                minimizeWindow(w.id);
              }
            }}
            className={cn(
              "flex h-9 max-w-[160px] items-center gap-2 rounded-md px-2.5 text-xs transition-colors truncate",
              activeWindowId === w.id && !w.minimized
                ? "bg-slate-700 text-white"
                : "bg-slate-800/80 text-slate-400 hover:bg-slate-700"
            )}
          >
            <w.icon size={14} className="shrink-0" />
            <span className="truncate">{w.title}</span>
          </button>
        ))}
      </div>

      <div className="hidden items-center gap-3 text-xs text-slate-400 md:flex">
        <button
          onClick={() => openWindow("contact")}
          className="rounded-lg px-2 py-1 hover:bg-emerald-500/20 hover:text-emerald-300 transition"
        >
          Hire Me
        </button>
        <Wifi size={14} />
        <span>{profile.location}</span>
      </div>

      <div className="rounded-md bg-slate-800 px-3 py-1.5 text-xs text-slate-300">
        <Clock />
      </div>
    </div>
  );
}
