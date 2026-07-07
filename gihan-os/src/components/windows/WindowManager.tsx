"use client";



import { AnimatePresence } from "framer-motion";



import { useOS } from "@/contexts/OSContext";

import Window from "./Window";

import AppRenderer from "@/components/apps/AppRenderer";



export default function WindowManager() {

  const { windows } = useOS();



  return (

    <AnimatePresence>

      {windows

        .filter((w) => !w.minimized)

        .map((win) => (

          <Window key={win.id} window={win}>

            <AppRenderer appId={win.id} />

          </Window>

        ))}

    </AnimatePresence>

  );

}

