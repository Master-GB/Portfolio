"use client";

import type { LucideIcon } from "lucide-react";

import type { AppId } from "@/data/portfolio";
import { cn } from "@/lib/utils";

const ICON_THEMES: Record<
  AppId,
  { gradient: string; shadow: string }
> = {
  about: {
    gradient: "from-sky-400 to-blue-600",
    shadow: "shadow-blue-900/50",
  },
  projects: {
    gradient: "from-amber-300 to-orange-500",
    shadow: "shadow-orange-900/50",
  },
  skills: {
    gradient: "from-emerald-400 to-green-600",
    shadow: "shadow-green-900/50",
  },
  resume: {
    gradient: "from-rose-400 to-red-600",
    shadow: "shadow-red-900/50",
  },
  education: {
    gradient: "from-violet-400 to-purple-600",
    shadow: "shadow-purple-900/50",
  },
  contact: {
    gradient: "from-cyan-400 to-teal-600",
    shadow: "shadow-teal-900/50",
  },
  terminal: {
    gradient: "from-slate-500 to-slate-800",
    shadow: "shadow-black/50",
  },
  settings: {
    gradient: "from-zinc-400 to-zinc-600",
    shadow: "shadow-zinc-900/50",
  },
  explorer: {
    gradient: "from-yellow-300 to-yellow-500",
    shadow: "shadow-yellow-900/50",
  },
  notepad: {
    gradient: "from-amber-200 to-amber-400",
    shadow: "shadow-amber-900/50",
  },
  robot_assistant: {
    gradient: "from-indigo-500 to-purple-600",
    shadow: "shadow-purple-900/50",
  },
};

interface Props {
  id: AppId;
  title: string;
  icon: LucideIcon;
  onClick: () => void;
}

export default function DesktopIcon({ id, title, icon: Icon, onClick }: Props) {
  const theme = ICON_THEMES[id];

  return (
    <button
      type="button"
      onClick={onClick}
      onDoubleClick={onClick}
      className={cn(
        "flex w-[76px] flex-col items-center gap-1 rounded-[3px] px-1 py-1.5",
        "hover:bg-white/15 active:bg-white/20",
        "focus-visible:outline focus-visible:outline-1 focus-visible:outline-white/50"
      )}
    >
      <div
        className={cn(
          "relative flex h-12 w-12 items-center justify-center rounded-[10px]",
          "bg-gradient-to-b",
          theme.gradient,
          theme.shadow,
          "shadow-lg"
        )}
      >
        <div className="pointer-events-none absolute inset-x-1 top-1 h-3 rounded-t-md bg-white/25" />
        <Icon
          size={26}
          strokeWidth={1.75}
          className="relative text-white drop-shadow-sm"
        />
      </div>

      <span
        className={cn(
          "w-full text-center text-[11px] font-normal leading-[1.25] text-white",
          "line-clamp-2 [text-shadow:0_1px_2px_rgba(0,0,0,0.95),0_0_4px_rgba(0,0,0,0.6)]"
        )}
      >
        {title}
      </span>
    </button>
  );
}
