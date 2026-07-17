"use client";

import { useEffect, useState } from "react";
import {
  LayoutGrid,
  Wifi,
  BatteryFull,
  BatteryLow,
  Volume2,
  Sparkles,
} from "lucide-react";

import { profile } from "@/data/portfolio";
import { useOS } from "@/contexts/OSContext";
import { cn } from "@/lib/utils";

function Clock() {
  const { settings } = useOS();
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");

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
      setDate(
        now.toLocaleDateString([], {
          weekday: "short",
          month: "short",
          day: "numeric",
        })
      );
    };
    tick();

    const intervalTime =
      settings.clockSeconds && !settings.lowPowerMode ? 1000 : 10000;
    const id = setInterval(tick, intervalTime);
    return () => clearInterval(id);
  }, [settings.clockFormat, settings.clockSeconds, settings.lowPowerMode]);

  return (
    <div className="group relative flex items-center justify-center">
      <span className="tabular-nums">{time}</span>

      {/* date flyout on hover */}
      <div
        className={cn(
          "pointer-events-none absolute bottom-full right-0 mb-2 whitespace-nowrap rounded-md border border-slate-700/80 bg-slate-900/95 px-2.5 py-1.5 text-[11px] text-slate-300 opacity-0 shadow-lg shadow-black/40 transition-all duration-200",
          "group-hover:opacity-100 group-hover:-translate-y-0.5",
          "motion-reduce:transition-none"
        )}
      >
        {date}
      </div>
    </div>
  );
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

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const isVertical =
    settings.taskbarPosition === "left" || settings.taskbarPosition === "right";
  const lowPower = settings.lowPowerMode;

  const borderClass =
    {
      top: "border-b",
      bottom: "border-t",
      left: "border-r",
      right: "border-l",
    }[settings.taskbarPosition] || "border-t";

  const taskbarBg = `rgba(15, 23, 42, ${settings.taskbarOpacity / 100})`;

  // macOS-dock-style magnetism: the hovered icon and its immediate
  // neighbours lift and scale, tapering off with distance.
  function magnetClass(index: number) {
    if (lowPower || hoveredIndex === null) return "";
    const distance = Math.abs(index - hoveredIndex);
    const isLeft = settings.taskbarPosition === "left";

    if (distance === 0) {
      return isVertical
        ? cn("scale-[1.18]", isLeft ? "translate-x-1.5" : "-translate-x-1.5")
        : "scale-[1.18] -translate-y-1.5";
    }
    if (distance === 1) {
      return isVertical
        ? cn("scale-[1.06]", isLeft ? "translate-x-0.5" : "-translate-x-0.5")
        : "scale-[1.06] -translate-y-0.5";
    }
    return "";
  }

  // Windows-11-style running / active pill indicator.
  function indicatorClass(isRunning: boolean, isActive: boolean) {
    const isLeft = settings.taskbarPosition === "left";
    return cn(
      "absolute rounded-full transition-all duration-300 motion-reduce:transition-none",
      isVertical
        ? cn(
            "top-1/2 -translate-y-1/2 w-[3px]",
            isLeft ? "left-0.5" : "right-0.5"
          )
        : "bottom-0.5 left-1/2 -translate-x-1/2 h-[3px]",
      isActive
        ? cn(
            "bg-gradient-to-r from-indigo-400 to-cyan-300",
            !lowPower && "shadow-[0_0_8px_rgba(129,140,248,0.85)]",
            isVertical ? "h-5" : "w-5"
          )
        : isRunning
        ? cn("bg-slate-500/70", isVertical ? "h-2" : "w-2")
        : "opacity-0"
    );
  }

  return (
    <>
      <div
        className={cn(
          "os-panel relative flex gap-2 border-slate-700/60 transition-all z-50",
          isVertical
            ? "flex-col h-full w-full py-3 items-center"
            : "h-[var(--taskbar-h)] items-center px-3",
          borderClass,
          !lowPower && "backdrop-blur-xl"
        )}
        style={{
          backgroundColor: taskbarBg,
          backgroundImage: lowPower
            ? undefined
            : "linear-gradient(180deg, rgba(99,102,241,0.07), rgba(15,23,42,0) 45%)",
        }}
      >
        {/* ambient hairline glow along the taskbar's outer edge */}
        {!lowPower && (
          <div
            aria-hidden
            className={cn(
              "pointer-events-none absolute opacity-70",
              isVertical
                ? cn(
                    "inset-y-0 w-px bg-gradient-to-b from-transparent via-indigo-400/50 to-transparent",
                    settings.taskbarPosition === "left" ? "right-0" : "left-0"
                  )
                : cn(
                    "inset-x-0 h-px bg-gradient-to-r from-transparent via-indigo-400/50 to-transparent",
                    settings.taskbarPosition === "top" ? "bottom-0" : "top-0"
                  )
            )}
          />
        )}

        {/* start button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setStartMenuOpen(!startMenuOpen);
          }}
          className={cn(
            "group relative flex items-center gap-2 rounded-lg transition-all duration-300 justify-center",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/70",
            "motion-reduce:transition-none",
            isVertical ? "h-10 w-10 px-0" : "h-10 px-3 text-sm font-medium",
            startMenuOpen
              ? cn(
                  "bg-gradient-to-br from-indigo-500 to-violet-600 text-white",
                  !lowPower && "shadow-[0_0_18px_rgba(99,102,241,0.55)]"
                )
              : "text-slate-300 hover:bg-slate-800/80 hover:text-white active:scale-95"
          )}
        >
          <LayoutGrid
            size={18}
            className={cn(
              "transition-transform duration-300 motion-reduce:transition-none",
              startMenuOpen && "rotate-90"
            )}
          />
          {!isVertical && <span className="hidden sm:inline">Start</span>}
          {!lowPower && (
            <Sparkles
              size={10}
              className={cn(
                "absolute -right-0.5 -top-0.5 text-cyan-300 transition-opacity duration-300",
                startMenuOpen ? "opacity-100" : "opacity-0 group-hover:opacity-70"
              )}
            />
          )}
        </button>

        <div
          className={cn(
            "bg-gradient-to-b from-transparent via-slate-600 to-transparent",
            isVertical ? "h-px w-6" : "h-6 w-px"
          )}
        />

        {/* running apps / dock */}
        <div
          className={cn(
            "flex gap-1 overflow-auto",
            isVertical
              ? "flex-col flex-1 w-full items-center px-1"
              : "flex-1 items-center overflow-x-auto"
          )}
        >
          {windows.map((w, index) => {
            const isActive = activeWindowId === w.id && !w.minimized;

            return (
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
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                onFocus={() => setHoveredIndex(index)}
                onBlur={() => setHoveredIndex(null)}
                className={cn(
                  "group/win relative flex items-center gap-2 rounded-lg text-xs transition-all duration-200 truncate justify-center",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/70",
                  "motion-reduce:transition-none motion-reduce:scale-100 motion-reduce:translate-y-0",
                  isVertical ? "h-9 w-9 px-0" : "h-9 max-w-[160px] px-2.5",
                  isActive
                    ? "bg-slate-700/90 text-white"
                    : "bg-slate-800/70 text-slate-400 hover:bg-slate-700/80 hover:text-slate-200",
                  magnetClass(index)
                )}
                title={w.title}
              >
                <w.icon size={14} className="shrink-0" />
                {!isVertical && <span className="truncate">{w.title}</span>}

                <span className={indicatorClass(true, isActive)} />

                {/* tooltip, useful for icon-only vertical/collapsed states */}
                <span
                  className={cn(
                    "pointer-events-none absolute z-10 whitespace-nowrap rounded-md border border-slate-700/80 bg-slate-900/95 px-2 py-1 text-[11px] text-slate-200 opacity-0 shadow-lg shadow-black/40 transition-all duration-150",
                    "group-hover/win:opacity-100 group-focus-visible/win:opacity-100",
                    "motion-reduce:transition-none",
                    isVertical
                      ? cn(
                          "top-1/2 -translate-y-1/2",
                          settings.taskbarPosition === "left"
                            ? "left-full ml-2"
                            : "right-full mr-2"
                        )
                      : cn(
                          "left-1/2 -translate-x-1/2",
                          settings.taskbarPosition === "top"
                            ? "top-full mt-2"
                            : "bottom-full mb-2"
                        )
                  )}
                >
                  {w.title}
                  {w.minimized && (
                    <span className="ml-1 text-slate-500">(minimized)</span>
                  )}
                </span>
              </button>
            );
          })}
        </div>

        {/* system tray */}
        {!isVertical && (
          <div className="hidden items-center gap-1 text-xs text-slate-400 md:flex">
            <button
              onClick={() => openWindow("contact")}
              className="group relative overflow-hidden rounded-lg px-3 py-1.5 font-medium text-emerald-300 transition-all duration-300 hover:text-emerald-200 active:scale-95"
            >
              <span className="absolute inset-0 -z-10 rounded-lg bg-emerald-500/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <span className="absolute inset-0 -z-10 rounded-lg ring-1 ring-inset ring-emerald-500/30" />
              Hire Me
            </button>

            <div className="mx-1 h-5 w-px bg-slate-700/80" />

            <div className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors hover:bg-slate-800/60">
              <span title="Network: online">
                <Wifi size={14} />
              </span>
              <span
                title={settings.lowPowerMode ? "Low power mode" : "Battery: full"}
                className={settings.lowPowerMode ? "text-amber-400" : undefined}
              >
                {settings.lowPowerMode ? (
                  <BatteryLow size={14} />
                ) : (
                  <BatteryFull size={14} />
                )}
              </span>
              <span title="Volume">
                <Volume2 size={14} />
              </span>
              <span className="text-slate-500">{profile.location}</span>
            </div>
          </div>
        )}

        {/* clock */}
        <div
          className={cn(
            "rounded-lg bg-slate-800/80 py-1.5 text-xs font-medium text-slate-200 text-center ring-1 ring-inset ring-slate-700/60",
            isVertical ? "px-1 w-full" : "px-3"
          )}
        >
          <Clock />
        </div>
      </div>
    </>
  );
}