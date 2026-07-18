import React, { useEffect, useState } from "react";
import { useOS } from "@/contexts/OSContext";
import type { WallpaperId } from "@/types/os";

interface Props {
  x: number;
  y: number;
  onClose: () => void;
}

export default function ContextMenu({ x, y, onClose }: Props) {
  const { updateSetting, settings } = useOS();
  const [adjustedX, setAdjustedX] = useState(x);
  const [adjustedY, setAdjustedY] = useState(y);

  useEffect(() => {
    const ZOOM_SCALE = 0.9;
    // Simple logic to keep menu on screen
    const menuWidth = 200;
    const menuHeight = 150;
    
    const scaledX = x / ZOOM_SCALE;
    const scaledY = y / ZOOM_SCALE;
    const scaledInnerWidth = window.innerWidth / ZOOM_SCALE;
    const scaledInnerHeight = window.innerHeight / ZOOM_SCALE;

    let newX = scaledX;
    let newY = scaledY;

    if (scaledX + menuWidth > scaledInnerWidth) {
      newX = scaledInnerWidth - menuWidth - 10;
    }
    if (scaledY + menuHeight > scaledInnerHeight) {
      newY = scaledInnerHeight - menuHeight - 10;
    }

    setAdjustedX(newX);
    setAdjustedY(newY);

    const handleClickOutside = () => onClose();
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, [x, y, onClose]);

  const handleChangeWallpaper = () => {
    const wallpapers: WallpaperId[] = [
      "starfield", "nebula_pulse", "black_hole", "cosmic_dust", "aurora_galaxy"
    ];
    const currentIndex = wallpapers.indexOf(settings.wallpaper);
    const nextIndex = (currentIndex + 1) % wallpapers.length;
    updateSetting("wallpaper", wallpapers[nextIndex]);
    onClose();
  };

  const handleToggleRobot = () => {
    updateSetting("showRobot", !settings.showRobot);
    onClose();
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div
      className="fixed z-50 w-48 bg-zinc-50/90 dark:bg-zinc-800/90 backdrop-blur-md border border-zinc-200 dark:border-zinc-700 rounded-md shadow-lg py-1 text-sm text-zinc-800 dark:text-zinc-200"
      style={{ left: adjustedX, top: adjustedY }}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        onClick={handleChangeWallpaper}
        className="w-full text-left px-4 py-1.5 hover:bg-blue-500 hover:text-white transition-colors"
      >
        Next Wallpaper
      </button>
      <button
        onClick={handleRefresh}
        className="w-full text-left px-4 py-1.5 hover:bg-blue-500 hover:text-white transition-colors"
      >
        Refresh Desktop
      </button>
      <div className="h-px bg-zinc-200 dark:bg-zinc-700 my-1 mx-2" />
      <button
        onClick={handleToggleRobot}
        className="w-full text-left px-4 py-1.5 hover:bg-blue-500 hover:text-white transition-colors"
      >
        {settings.showRobot ? "Hide Robot" : "Show Robot"}
      </button>
    </div>
  );
}
