"use client";



import { useState, useEffect, useRef } from "react";

import dynamic from "next/dynamic";

import { motion, AnimatePresence } from "framer-motion";



import { apps, profile } from "@/data/portfolio";

import { useOS } from "@/contexts/OSContext";

import Wallpaper from "./Wallpaper";

import DesktopIcon from "./DesktopIcon";

import Taskbar from "./Taskbar";

import StartMenu from "./StartMenu";

import WindowManager from "@/components/windows/WindowManager";

import ContextMenu from "@/components/desktop/ContextMenu";

import { sound } from "@/lib/sound";



const RobotScene = dynamic(() => import("@/components/3d/RobotScene"), {

  ssr: false,

  loading: () => null,

});



const DESKTOP_TIPS = [

  "Hi! Click me for an AI tour! 🚀",

  "Need help? Double-click icons to run apps!",

  "Right-click the desktop for settings! ⚙️",

  "Try changing my look in the AI Byte App! 🦾",

  "Type 'matrix' or 'joke' in the Terminal! 📟",

  "Ask me to swap your wallpaper! 🎨",

];



export default function Desktop() {

  const { booted, settings, openWindow, setStartMenuOpen } = useOS();

  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);

  const [tipIndex, setTipIndex] = useState(0);

  const robotRef = useRef<HTMLDivElement>(null);

  // Force robot to stay in position using requestAnimationFrame loop
  useEffect(() => {
    if (!robotRef.current || !settings.showRobot) return;

    const forcePosition = () => {
      if (!robotRef.current) return;

      const rect = robotRef.current.getBoundingClientRect();
      const taskbarHeight = 52;
      const expectedBottom = taskbarHeight;
      const actualBottom = window.innerHeight - rect.bottom;

      // If robot has moved, force it back
      if (Math.abs(actualBottom - expectedBottom) > 0.5) {
        robotRef.current.style.bottom = `${expectedBottom}px`;
        robotRef.current.style.right = '0px';
        robotRef.current.style.position = 'fixed';
      }

      requestAnimationFrame(forcePosition);
    };

    const animationId = requestAnimationFrame(forcePosition);

    return () => cancelAnimationFrame(animationId);
  }, [settings.showRobot]);



  // Cycle tips every 12 seconds

  useEffect(() => {

    if (!settings.showRobot) return;



    const interval = setInterval(() => {

      setTipIndex((prev) => (prev + 1) % DESKTOP_TIPS.length);

    }, 12000);



    return () => clearInterval(interval);

  }, [settings.showRobot]);



  if (!booted) return null;



  const handleContextMenu = (e: React.MouseEvent) => {

    e.preventDefault();

    setContextMenu({ x: e.clientX, y: e.clientY });

  };



  return (

    <div className="relative h-screen w-screen overflow-hidden select-none" onContextMenu={handleContextMenu}>

      <Wallpaper id={settings.wallpaper} />



      {contextMenu && (

        <ContextMenu

          x={contextMenu.x}

          y={contextMenu.y}

          onClose={() => setContextMenu(null)}

        />

      )}



      <div

        className="absolute inset-0 pb-[var(--taskbar-h)]"

        onClick={() => {

          setStartMenuOpen(false);

          setContextMenu(null);

        }}

      >

        <div className="flex h-full flex-col justify-between py-4 px-1 md:py-6 md:px-2 text-slate-200">

          <div className="flex h-full max-h-[calc(100vh-var(--taskbar-h)-2rem)] flex-col flex-wrap content-start gap-0">

            {apps.map((app) => (
              app.id === "robot_assistant" ? (
                <div key={app.id} className="hidden xl:flex">
                  <DesktopIcon
                    id={app.id}
                    title={app.title}
                    icon={app.icon}
                    onClick={() => openWindow(app.id)}
                  />
                </div>
              ) : (
                <DesktopIcon
                  key={app.id}
                  id={app.id}
                  title={app.title}
                  icon={app.icon}
                  onClick={() => openWindow(app.id)}
                />
              )
            ))}

          </div>

        </div>



        <WindowManager />

      </div>



      {/* 3D Robot – rendered as a top-level fixed overlay so it is never

          affected by layout shifts, scroll events, or z-index stacking

          from application windows */}

      {settings.showRobot && (

        <div

          ref={robotRef}

          className="pointer-events-auto fixed bottom-[var(--taskbar-h)] right-0 h-[260px] w-[240px] md:right-2 md:h-[340px] md:w-[300px] hidden xl:flex flex-col items-center justify-end group z-[9999]"

          onMouseEnter={() => {

            if (settings.soundEnabled) sound.play("beep");

          }}

          onClick={(e) => {

            e.stopPropagation();

            if (settings.soundEnabled) sound.play("click");

            openWindow("robot_assistant");

          }}

          onWheel={(e) => e.stopPropagation()}

        >

          {/* Cycling Glassmorphic Tip Bubble */}

          <div className="absolute top-0 z-20 w-full flex justify-center pointer-events-none px-2">

            <AnimatePresence mode="wait">

              <motion.div

                key={tipIndex}

                initial={{ opacity: 0, y: 10, scale: 0.95 }}

                animate={{ opacity: 1, y: 0, scale: 1 }}

                exit={{ opacity: 0, y: -10, scale: 0.95 }}

                transition={{ duration: 0.35 }}

                className="relative rounded-2xl bg-slate-950/80 border border-slate-700/50 px-3.5 py-1.5 text-[11px] text-center text-slate-100 shadow-2xl backdrop-blur-md max-w-[210px] font-sans"

              >

                {DESKTOP_TIPS[tipIndex]}

                <div className="absolute left-1/2 -bottom-1 h-2 w-2 -translate-x-1/2 rotate-45 border-r border-b border-slate-700/50 bg-slate-950/80" />

              </motion.div>

            </AnimatePresence>

          </div>



          {/* 3D Canvas rendering */}

          <motion.div

            initial={{ opacity: 0, scale: 0.9 }}

            animate={{ opacity: 1, scale: 1 }}

            transition={{ delay: 0.4, duration: 0.8 }}

            className="h-[210px] w-full md:h-[280px] cursor-pointer relative"

          >

            {/* Visual pulse glow on hover */}

            <div className="absolute inset-0 rounded-full bg-indigo-500/5 opacity-0 group-hover:opacity-100 blur-2xl transition duration-500 pointer-events-none" />

            <RobotScene interactive={false} />

          </motion.div>

        </div>

      )}



      <motion.div

        initial={{ y: 60, opacity: 0 }}

        animate={{ y: 0, opacity: 1 }}

        transition={{ delay: 0.2, type: "spring", stiffness: 120 }}

        className="absolute bottom-0 left-0 right-0 z-50"

      >

        <Taskbar />

        <StartMenu />

      </motion.div>

    </div>

  );

}

