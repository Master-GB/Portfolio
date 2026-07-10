"use client";

import { useEffect, useState } from "react";
import { LayoutGrid, Wifi } from "lucide-react";

import { profile } from "@/data/portfolio";
import { useOS } from "@/contexts/OSContext";
import { cn } from "@/lib/utils";

function Clock() {
  const { settings } = useOS();
  const [time, setTime] = useState("");

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const showSeconds = settings.clockSeconds && !settings.lowPowerMode;
      const hour12 = settings.clockFormat !== "24h";
      
      setTime(
        now.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          second: showSeconds ? "2-digit" : undefined,
          hour12: hour12,
        })
      );
    };
    tick();
    
    const intervalTime = settings.clockSeconds && !settings.lowPowerMode ? 1000 : 10000;
    const id = setInterval(tick, intervalTime);
    return () => clearInterval(id);
  }, [settings.clockFormat, settings.clockSeconds, settings.lowPowerMode]);

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
    settings,
  } = useOS();

  const isVertical = settings.taskbarPosition === "left" || settings.taskbarPosition === "right";

  const borderClass = {
    top: "border-b",
    bottom: "border-t",
    left: "border-r",
    right: "border-l",
  }[settings.taskbarPosition] || "border-t";

  const taskbarBg = `rgba(15, 23, 42, ${settings.taskbarOpacity / 100})`;

  return (
    <div
      className={cn(
        "os-panel flex gap-2 border-slate-700 transition-all z-50",
        isVertical ? "flex-col h-full w-full py-3 items-center" : "h-[var(--taskbar-h)] items-center px-3",
        borderClass
      )}
      style={{ backgroundColor: taskbarBg }}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          setStartMenuOpen(!startMenuOpen);
        }}
        className={cn(
          "flex items-center gap-2 rounded-md transition-colors justify-center",
          isVertical ? "h-10 w-10 px-0" : "h-10 px-3 text-sm font-medium",
          startMenuOpen
            ? "bg-indigo-600 text-white"
            : "hover:bg-slate-800"
        )}
      >
        <LayoutGrid size={18} />
        {!isVertical && <span className="hidden sm:inline">Start</span>}
      </button>

      <div className={isVertical ? "h-px w-6 bg-slate-700" : "h-6 w-px bg-slate-700"} />

      <div className={cn("flex gap-1 overflow-auto", isVertical ? "flex-col flex-1 w-full items-center px-1" : "flex-1 items-center overflow-x-auto")}>
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
              "flex items-center gap-2 rounded-md text-xs transition-colors truncate justify-center",
              isVertical ? "h-9 w-9 px-0" : "h-9 max-w-[160px] px-2.5",
              activeWindowId === w.id && !w.minimized
                ? "bg-slate-700 text-white"
                : "bg-slate-800/80 text-slate-400 hover:bg-slate-700"
            )}
            title={w.title}
          >
            <w.icon size={14} className="shrink-0" />
            {!isVertical && <span className="truncate">{w.title}</span>}
          </button>
        ))}
      </div>

      {!isVertical && (
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
      )}

      <div className={cn("rounded-md bg-slate-800 py-1.5 text-xs text-slate-300 font-medium text-center", isVertical ? "px-1 w-full" : "px-3")}>
        <Clock />
      </div>
    </div>
  );
}
