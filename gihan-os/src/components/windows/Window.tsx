"use client";



import { useCallback, useRef } from "react";

import { motion } from "framer-motion";

import { Minus, Square, X } from "lucide-react";



import { useOS } from "@/contexts/OSContext";

import type { WindowInstance } from "@/types/os";

import { cn } from "@/lib/utils";



const TASKBAR_H = 52;



interface Props {

  window: WindowInstance;

  children: React.ReactNode;

}



export default function Window({ window: win, children }: Props) {

  const {

    closeWindow,

    minimizeWindow,

    maximizeWindow,

    focusWindow,

    moveWindow,

    settings,

  } = useOS();



  const dragState = useRef<{ startX: number; startY: number; originX: number; originY: number; rafId: number | null } | null>(null);

  const windowRef = useRef<HTMLDivElement>(null);



  const startDrag = useCallback(

    (e: React.PointerEvent<HTMLDivElement>) => {

      if (win.maximized) return;

      if ((e.target as HTMLElement).closest("button")) return;



      e.preventDefault();

      focusWindow(win.id);



      dragState.current = {

        startX: e.clientX,

        startY: e.clientY,

        originX: win.x,

        originY: win.y,

        rafId: null,

      };



      const onMove = (ev: PointerEvent) => {

        if (!dragState.current || !windowRef.current) return;



        if (dragState.current.rafId !== null) {

          cancelAnimationFrame(dragState.current.rafId);

        }



        dragState.current.rafId = requestAnimationFrame(() => {
          if (!dragState.current || !windowRef.current) return;
          const dx = ev.clientX - dragState.current.startX;
          const dy = ev.clientY - dragState.current.startY;

          const isTaskbarTop = settings.taskbarPosition === "top";
          const isTaskbarLeft = settings.taskbarPosition === "left";
          const isTaskbarRight = settings.taskbarPosition === "right";

          const minX = isTaskbarLeft ? TASKBAR_H : 0;
          const maxX = isTaskbarRight
            ? window.innerWidth - TASKBAR_H - win.width
            : window.innerWidth - win.width;

          const minY = isTaskbarTop ? TASKBAR_H : 0;
          const maxY = settings.taskbarPosition === "bottom" || !settings.taskbarPosition
            ? window.innerHeight - TASKBAR_H - win.height
            : window.innerHeight - win.height;

          let newX = dragState.current.originX + dx;
          let newY = dragState.current.originY + dy;

          if (settings.windowSnap) {
            const snapThreshold = 20;
            if (Math.abs(newX - minX) < snapThreshold) {
              newX = minX;
            }
            if (Math.abs(newX - maxX) < snapThreshold) {
              newX = maxX;
            }
            if (Math.abs(newY - minY) < snapThreshold) {
              newY = minY;
            }
            if (Math.abs(newY - maxY) < snapThreshold) {
              newY = maxY;
            }
          }

          newX = Math.max(minX, Math.min(maxX, newX));
          newY = Math.max(minY, Math.min(maxY, newY));

          // Use direct DOM manipulation for smoother dragging
          windowRef.current.style.left = `${newX}px`;
          windowRef.current.style.top = `${newY}px`;

          // Update state less frequently
          moveWindow(win.id, newX, newY);
        });
      };

      const onUp = () => {
        if (dragState.current && dragState.current.rafId !== null) {
          cancelAnimationFrame(dragState.current.rafId);
        }
        dragState.current = null;
        document.removeEventListener("pointermove", onMove);
        document.removeEventListener("pointerup", onUp);
      };

      document.addEventListener("pointermove", onMove);
      document.addEventListener("pointerup", onUp);
    },
    [win.maximized, win.x, win.y, win.width, win.height, win.id, focusWindow, moveWindow, settings.taskbarPosition, settings.windowSnap]
  );

  const isMaximized = win.maximized;
  const isTaskbarLeft = settings.taskbarPosition === "left";
  const isTaskbarRight = settings.taskbarPosition === "right";
  const isTaskbarTop = settings.taskbarPosition === "top";

  const maximizedLeft = isMaximized ? (isTaskbarLeft ? TASKBAR_H : 0) : win.x;
  const maximizedTop = isMaximized ? (isTaskbarTop ? TASKBAR_H : 0) : win.y;
  const maximizedWidth = isMaximized
    ? isTaskbarLeft || isTaskbarRight
      ? `calc(100vw - ${TASKBAR_H}px)`
      : "100vw"
    : win.width;
  const maximizedHeight = isMaximized
    ? isTaskbarLeft || isTaskbarRight
      ? "100vh"
      : `calc(100vh - ${TASKBAR_H}px)`
    : win.height;

  return (
    <motion.div
      ref={windowRef}
      initial={settings.reduceMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onMouseDown={() => focusWindow(win.id)}
      className={cn("os-window fixed flex flex-col overflow-hidden shadow-2xl shadow-black/50 bg-black", "rounded-none")}
      style={{
        left: maximizedLeft,
        top: maximizedTop,
        width: maximizedWidth,
        height: maximizedHeight,
        zIndex: win.zIndex,
      }}
    >

      <div className="os-panel flex h-full flex-col">

        <div

          className="window-drag-handle flex h-11 shrink-0 cursor-move items-center justify-between border-b border-slate-700 bg-slate-900 px-3 select-none"

          onPointerDown={startDrag}

        >

          <div className="flex min-w-0 items-center gap-2">

            <win.icon size={16} className="shrink-0 text-indigo-400" />

            <span className="truncate text-sm font-medium">{win.title}</span>

          </div>



          <div className="flex items-center gap-1">

            <WinBtn onClick={() => minimizeWindow(win.id)} label="Minimize">

              <Minus size={14} />

            </WinBtn>

            <WinBtn onClick={() => maximizeWindow(win.id)} label="Maximize">

              <Square size={13} />

            </WinBtn>

            <WinBtn onClick={() => closeWindow(win.id)} label="Close" danger>

              <X size={14} />

            </WinBtn>

          </div>

        </div>



        <div className="flex-1 relative overflow-hidden">{children}</div>

      </div>

    </motion.div>

  );

}



function WinBtn({

  children,

  onClick,

  label,

  danger,

}: {

  children: React.ReactNode;

  onClick: () => void;

  label: string;

  danger?: boolean;

}) {

  return (

    <button

      aria-label={label}

      onClick={(e) => {

        e.stopPropagation();

        onClick();

      }}

      className={cn(

        "flex h-7 w-7 items-center justify-center rounded-lg transition",

        danger ? "hover:bg-red-500/80 hover:text-white" : "hover:bg-white/15"

      )}

    >

      {children}

    </button>

  );

}

