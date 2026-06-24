"use client";

import type { WallpaperId } from "@/types/os";

const WALLPAPERS: Record<WallpaperId, string> = {
  aurora:
    "bg-[#050810] bg-[radial-gradient(ellipse_80%_60%_at_20%_30%,rgba(99,102,241,0.35),transparent),radial-gradient(ellipse_60%_50%_at_80%_70%,rgba(34,211,238,0.2),transparent),radial-gradient(ellipse_50%_40%_at_50%_50%,rgba(244,114,182,0.12),transparent)]",
  midnight:
    "bg-[#020617] bg-[radial-gradient(ellipse_at_top,rgba(30,58,138,0.4),transparent_60%)]",
  nebula:
    "bg-[#0a0612] bg-[radial-gradient(ellipse_70%_50%_at_30%_20%,rgba(168,85,247,0.3),transparent),radial-gradient(ellipse_60%_40%_at_70%_80%,rgba(236,72,153,0.2),transparent)]",
  matrix:
    "bg-[#020a04] bg-[radial-gradient(ellipse_at_center,rgba(34,197,94,0.15),transparent_70%)]",
  anime:
    "bg-[#1a0f1c] bg-[radial-gradient(circle_at_top_right,rgba(244,114,182,0.4),transparent_50%),radial-gradient(circle_at_bottom_left,rgba(168,85,247,0.3),transparent_50%)]",
  macos:
    "bg-[#0f172a] bg-[radial-gradient(ellipse_80%_100%_at_50%_100%,rgba(59,130,246,0.5),transparent_70%),radial-gradient(ellipse_100%_100%_at_50%_0%,rgba(168,85,247,0.3),transparent_70%)]",
  minimalist:
    "bg-[#f8fafc] dark:bg-[#0f172a] bg-[linear-gradient(to_bottom_right,rgba(226,232,240,0.5),rgba(241,245,249,0.5))] dark:bg-[linear-gradient(to_bottom_right,rgba(30,41,59,0.5),rgba(15,23,42,0.5))]",
};

interface Props {
  id: WallpaperId;
}

export default function Wallpaper({ id }: Props) {
  return (
    <div className={`absolute inset-0 ${WALLPAPERS[id]}`}>


    </div>
  );
}
