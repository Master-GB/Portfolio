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



          const maxX = window.innerWidth - win.width;

          const maxY = window.innerHeight - TASKBAR_H - win.height;



          const newX = Math.max(0, Math.min(maxX, dragState.current.originX + dx));

          const newY = Math.max(0, Math.min(maxY, dragState.current.originY + dy));



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

    [win.maximized, win.x, win.y, win.width, win.height, win.id, focusWindow, moveWindow]

  );



  const isMaximized = win.maximized;



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

        left: isMaximized ? 0 : win.x,

        top: isMaximized ? 0 : win.y,

        width: isMaximized ? "100vw" : win.width,

        height: isMaximized ? `calc(100vh - ${TASKBAR_H}px)` : win.height,

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

