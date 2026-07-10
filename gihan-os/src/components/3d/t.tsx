"use client";

import { useMemo, useState } from "react";

import { useOS } from "@/contexts/OSContext";

import type { WallpaperId } from "@/types/os";

import { cn } from "@/lib/utils";

import { AnimatePresence, motion } from "framer-motion";

import {

  Settings as SettingsIcon,

  Palette,

  Bot,

  Monitor,

  Info,

  Search,

  Check,

  Volume2,

  Sparkles,

  MousePointer2,

  Layers,

  Sun,

  Moon,

  Zap,

  Eye,

  LayoutGrid as LayoutGridIcon,

  Smartphone,

  Cpu,

  Grid3x3,

  Layout,

  Clock,

  Monitor as MonitorIcon,

  Sliders,

  Accessibility,

  Power,

  Maximize2,


  PanelBottom,
  
  PanelTop,

  PanelLeft,
  
  PanelRight,

} from "lucide-react";



const WALLPAPER_OPTIONS: { id: WallpaperId; label: string; color: string }[] = [
  { id: "starfield", label: "Starfield", color: "from-slate-950 to-blue-950" },
  { id: "nebula_pulse", label: "Nebula Pulse", color: "from-purple-950 to-fuchsia-900" },
  { id: "black_hole", label: "Black Hole", color: "from-gray-950 to-orange-950" },
  { id: "cosmic_dust", label: "Cosmic Dust", color: "from-indigo-950 to-cyan-950" },
  { id: "aurora_galaxy", label: "Aurora Galaxy", color: "from-teal-950 to-emerald-950" },
];



const ROBOT_THEMES = [

  { id: "cyan", hex: "#22d3ee" },

  { id: "rose", hex: "#f43f5e" },

  { id: "emerald", hex: "#34d399" },

  { id: "gold", hex: "#fbbf24" },

  { id: "cyberpunk", hex: "#ec4899" },

] as const;



const ACCENT_COLORS = [
  { id: "indigo", hex: "#6366f1", label: "Indigo" },
  { id: "rose", hex: "#f43f5e", label: "Rose" },
  { id: "emerald", hex: "#10b981", label: "Emerald" },
  { id: "amber", hex: "#f59e0b", label: "Amber" },
  { id: "cyan", hex: "#06b6d4", label: "Cyan" },
] as const;

const TASKBAR_POSITIONS = [
  { id: "bottom", icon: PanelBottom, label: "Bottom" },
  { id: "top", icon: PanelTop, label: "Top" },
  { id: "left", icon: PanelLeft, label: "Left" },
  { id: "right", icon: PanelRight, label: "Right" },
] as const;

const ICON_SIZES = [
  { id: "small", label: "Small" },
  { id: "medium", label: "Medium" },
  { id: "large", label: "Large" },
] as const;



type CategoryId = "personalization" | "display" | "system" | "accessibility" | "performance" | "robot" | "about";



const CATEGORIES: {

  id: CategoryId;

  label: string;

  icon: typeof SettingsIcon;

  description: string;

}[] = [

  { id: "personalization", label: "Personalization", icon: Palette, description: "Wallpaper & appearance" },
  { id: "display", label: "Display", icon: MonitorIcon, description: "Theme, colors & layout" },
  { id: "system", label: "System", icon: Monitor, description: "Sound, motion & behavior" },
  { id: "accessibility", label: "Accessibility", icon: Accessibility, description: "Visual & cognitive aids" },
  { id: "performance", label: "Performance", icon: Cpu, description: "Power & resource usage" },
  { id: "robot", label: "Byte Assistant", icon: Bot, description: "Your 3D companion" },
  { id: "about", label: "About", icon: Info, description: "System information" },

];



export default function SettingsApp() {

  const { settings, updateSetting } = useOS();

  const [activeCategory, setActiveCategory] = useState<CategoryId>("personalization");

  const [query, setQuery] = useState("");



  const filteredCategories = useMemo(() => {

    if (!query.trim()) return CATEGORIES;

    const q = query.toLowerCase();

    return CATEGORIES.filter(

      (c) => c.label.toLowerCase().includes(q) || c.description.toLowerCase().includes(q)

    );



  }, [query]);



  const transition = settings.reduceMotion

    ? { duration: 0 }

    : { duration: 0.22, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] };



  const activeMeta = CATEGORIES.find((c) => c.id === activeCategory)!;



  return (

    <div className="flex h-full w-full overflow-hidden  bg-[#0c0d12] text-slate-200">

      {/* Sidebar */}

      <aside className="flex w-[224px] shrink-0 flex-col border-r border-white/[0.06] bg-white/[0.02] backdrop-blur-xl">

        <div className="flex items-center gap-2.5 px-4 pt-5 pb-4">

          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-400 shadow-lg shadow-indigo-500/20">

            <SettingsIcon size={16} className="text-white" />

          </div>

          <div className="min-w-0">

            <h1 className="text-sm font-semibold leading-none text-white">Settings</h1>

            <p className="mt-1 text-[10px] text-slate-500">GihanOS</p>

          </div>

        </div>



        <div className="px-3 pb-3">

          <div className="relative">

            <Search

              size={13}

              className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500"

            />

            <input

              value={query}

              onChange={(e) => setQuery(e.target.value)}

              placeholder="Find a setting"

              className="w-full rounded-lg border border-white/[0.06] bg-black/20 py-1.5 pl-7 pr-2 text-xs text-slate-200 outline-none transition placeholder:text-slate-500 focus:border-indigo-400/50 focus:bg-black/30"

            />

          </div>

        </div>



        <nav className="flex-1 space-y-0.5 overflow-y-auto px-2">

          {filteredCategories.map((cat) => {

            const Icon = cat.icon;

            const active = activeCategory === cat.id;

            return (

              <button

                key={cat.id}

                onClick={() => setActiveCategory(cat.id)}

                className={cn(

                  "group relative flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs transition-colors",

                  active ? "text-white" : "text-slate-400 hover:bg-white/[0.04] hover:text-slate-200"

                )}

              >

                {active && (

                  <motion.div

                    layoutId="settings-nav-active"

                    transition={transition}

                    className="absolute inset-0 rounded-lg border border-indigo-400/20 bg-gradient-to-r from-indigo-500/20 to-cyan-500/10"

                  />

                )}

                {active && (

                  <motion.span

                    layoutId="settings-nav-indicator"

                    transition={transition}

                    className="absolute left-0 top-1/2 h-4 w-[3px] -translate-y-1/2 rounded-full bg-gradient-to-b from-indigo-400 to-cyan-400"

                  />

                )}

                <Icon size={15} className={cn("relative shrink-0", active && "text-indigo-300")} />

                <span className="relative font-medium">{cat.label}</span>

              </button>

            );

          })}

          {filteredCategories.length === 0 && (

            <p className="px-2.5 py-4 text-center text-[11px] text-slate-500">No settings found</p>

          )}

        </nav>



        <div className="border-t border-white/[0.06] px-4 py-3">

          <p className="text-[10px] text-slate-600">v1.0 · Next.js, Three.js &​amp; Framer Motion</p>

        </div>

      </aside>



      {/* Content */}

      <main className="flex-1 overflow-y-auto px-8 py-6">

        <div className="mx-auto max-w-2xl">

          <div className="mb-5">

            <h2 className="text-xl font-semibold text-white">{activeMeta.label}</h2>

            <p className="text-xs text-slate-500">{activeMeta.description}</p>

          </div>



          <AnimatePresence mode="wait">

            <motion.div

              key={activeCategory}

              initial={{ opacity: 0, y: settings.reduceMotion ? 0 : 8 }}

              animate={{ opacity: 1, y: 0 }}

              exit={{ opacity: 0, y: settings.reduceMotion ? 0 : -8 }}

              transition={transition}

              className="space-y-6 pb-6"

            >

              {activeCategory === "personalization" && (

                <>

                  <div>

                    <SectionLabel>Choose your background</SectionLabel>

                    <div className="grid grid-cols-3 gap-2.5">

                      {WALLPAPER_OPTIONS.map((wp) => {

                        const active = settings.wallpaper === wp.id;

                        return (

                          <motion.button

                            key={wp.id}

                            whileHover={settings.reduceMotion ? undefined : { scale: 1.02 }}

                            whileTap={settings.reduceMotion ? undefined : { scale: 0.98 }}

                            onClick={() => updateSetting("wallpaper", wp.id)}

                            className={cn(

                              "cursor-pointer overflow-hidden rounded-xl ring-2 transition",

                              active ? "ring-indigo-400" : "ring-transparent hover:ring-white/15"

                            )}

                          >

                            <div className={cn("h-16 w-full bg-gradient-to-br", wp.color)} />

                            <div className="flex items-center justify-between bg-white/[0.03] px-2.5 py-2">

                              <span className="text-[11px] font-medium text-slate-300">{wp.label}</span>

                              {active && (

                                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-indigo-500">

                                  <Check size={10} className="text-white" />

                                </span>

                              )}

                            </div>

                          </motion.button>

                        );

                      })}

                    </div>

                  </div>

                  <SettingsCard>

                    <SettingsRow

                      icon={<LayoutGridIcon size={15} />}

                      label="Show desktop icons"

                      description="Display app icons on desktop"

                      control={

                        <Toggle

                          checked={settings.showDesktopIcons}

                          onChange={(v) => updateSetting("showDesktopIcons", v)}

                          reduceMotion={settings.reduceMotion}

                        />

                      }

                    />

                    <SettingsRow

                      icon={<Grid3x3 size={15} />}

                      label="Desktop grid"

                      description="Align icons in a grid layout"

                      control={

                        <Toggle

                          checked={settings.desktopGrid}

                          onChange={(v) => updateSetting("desktopGrid", v)}

                          reduceMotion={settings.reduceMotion}

                        />

                      }

                    />

                  </SettingsCard>

                  <div>

                    <SectionLabel>Icon size</SectionLabel>

                    <div className="flex gap-2">

                      {ICON_SIZES.map((size) => {

                        const active = settings.desktopIconSize === size.id;

                        return (

                          <button

                            key={size.id}

                            onClick={() => updateSetting("desktopIconSize", size.id as any)}

                            className={cn(

                              "flex-1 rounded-lg border px-3 py-2 text-xs font-medium transition",

                              active

                                ? "border-indigo-400 bg-indigo-400/10 text-indigo-300"

                                : "border-white/[0.06] bg-white/[0.02] text-slate-400 hover:bg-white/[0.04]"

                            )}

                          >

                            {size.label}

                          </button>

                        );

                      })}

                    </div>

                  </div>

                  <SettingsCard>

                    <SettingsRow

                      icon={<Layout size={15} />}

                      label="Show icon labels"

                      description="Display text labels under icons"

                      control={

                        <Toggle

                          checked={settings.showIconLabels}

                          onChange={(v) => updateSetting("showIconLabels", v)}

                          reduceMotion={settings.reduceMotion}

                        />

                      }

                    />

                  </SettingsCard>

                </>

              )}



              {activeCategory === "display" && (

                <>

                  <SettingsCard>

                    <SettingsRow

                      icon={<Sun size={15} />}

                      label="Theme mode"

                      description="Light or dark appearance"

                      control={

                        <div className="flex gap-1">

                          <button

                            onClick={() => updateSetting("themeMode", "light")}

                            className={cn(

                              "flex h-8 w-8 items-center justify-center rounded-lg transition",

                              settings.themeMode === "light"

                                ? "bg-amber-400 text-amber-950"

                                : "bg-white/[0.04] text-slate-400 hover:bg-white/[0.08]"

                            )}

                          >

                            <Sun size={16} />

                          </button>

                          <button

                            onClick={() => updateSetting("themeMode", "dark")}

                            className={cn(

                              "flex h-8 w-8 items-center justify-center rounded-lg transition",

                              settings.themeMode === "dark"

                                ? "bg-indigo-400 text-indigo-950"

                                : "bg-white/[0.04] text-slate-400 hover:bg-white/[0.08]"

                            )}

                          >

                            <Moon size={16} />

                          </button>

                        </div>

                      }

                    />

                  </SettingsCard>


                  <div>

                    <SectionLabel>Taskbar position</SectionLabel>

                    <div className="grid grid-cols-4 gap-2">

                      {TASKBAR_POSITIONS.map((pos) => {

                        const Icon = pos.icon;

                        const active = settings.taskbarPosition === pos.id;

                        return (

                          <button

                            key={pos.id}

                            onClick={() => updateSetting("taskbarPosition", pos.id as any)}

                            className={cn(

                              "flex flex-col items-center gap-1 rounded-lg border px-2 py-3 transition",

                              active

                                ? "border-indigo-400 bg-indigo-400/10 text-indigo-300"

                                : "border-white/[0.06] bg-white/[0.02] text-slate-400 hover:bg-white/[0.04]"

                            )}

                          >

                            <Icon size={18} />

                            <span className="text-[10px]">{pos.label}</span>

                          </button>

                        );

                      })}

                    </div>

                  </div>

                  <div>

                    <SectionLabel>Taskbar opacity</SectionLabel>

                    <div className="flex items-center gap-3">

                      <span className="text-xs text-slate-500">Transparent</span>

                      <input

                        type="range"

                        min="0"

                        max="100"

                        value={settings.taskbarOpacity}

                        onChange={(e) => updateSetting("taskbarOpacity", parseInt(e.target.value))}

                        className="flex-1 h-2 appearance-none rounded-full bg-slate-700 accent-indigo-400"

                      />

                      <span className="text-xs text-slate-500">Opaque</span>

                    </div>

                  </div>

                </>

              )}



              {activeCategory === "system" && (

                <>

                  <SectionLabel>Preferences</SectionLabel>

                  <SettingsCard>

                    <SettingsRow

                      icon={<Bot size={15} />}

                      label="Show 3D Robot (Byte)"

                      description="Display your companion on the desktop"

                      control={

                        <Toggle

                          checked={settings.showRobot}

                          onChange={(v) => updateSetting("showRobot", v)}

                          reduceMotion={settings.reduceMotion}

                        />

                      }

                    />

                    <SettingsRow

                      icon={<Sparkles size={15} />}

                      label="Reduce motion"

                      description="Limit animations across the OS"

                      control={

                        <Toggle

                          checked={settings.reduceMotion}

                          onChange={(v) => updateSetting("reduceMotion", v)}

                          reduceMotion={settings.reduceMotion}

                        />

                      }

                    />

                    <SettingsRow

                      icon={<Zap size={15} />}

                      label="Boot animation"

                      description="Show startup animation"

                      control={

                        <Toggle

                          checked={settings.bootAnimation}

                          onChange={(v) => updateSetting("bootAnimation", v)}

                          reduceMotion={settings.reduceMotion}

                        />

                      }

                    />

                    <SettingsRow

                      icon={<LayoutGridIcon size={15} />}

                      label="Auto-open welcome"

                      description="Show welcome window on boot"

                      control={

                        <Toggle

                          checked={settings.autoOpenWelcome}

                          onChange={(v) => updateSetting("autoOpenWelcome", v)}

                          reduceMotion={settings.reduceMotion}

                        />

                      }

                    />

                    <SettingsRow

                      icon={<Maximize2 size={15} />}

                      label="Window snap"

                      description="Snap windows to edges"

                      control={

                        <Toggle

                          checked={settings.windowSnap}

                          onChange={(v) => updateSetting("windowSnap", v)}

                          reduceMotion={settings.reduceMotion}

                        />

                      }

                    />

                  </SettingsCard>

                  <SectionLabel>Clock</SectionLabel>

                  <SettingsCard>

                    <SettingsRow

                      icon={<Clock size={15} />}

                      label="Clock format"

                      description="12-hour or 24-hour format"

                      control={

                        <div className="flex gap-1">

                          <button

                            onClick={() => updateSetting("clockFormat", "12h")}

                            className={cn(

                              "rounded-lg border px-2.5 py-1.5 text-xs font-medium transition",

                              settings.clockFormat === "12h"

                                ? "border-indigo-400 bg-indigo-400/10 text-indigo-300"

                                : "border-white/[0.06] bg-white/[0.02] text-slate-400 hover:bg-white/[0.04]"

                            )}

                          >

                            12h

                          </button>

                          <button

                            onClick={() => updateSetting("clockFormat", "24h")}

                            className={cn(

                              "rounded-lg border px-2.5 py-1.5 text-xs font-medium transition",

                              settings.clockFormat === "24h"

                                ? "border-indigo-400 bg-indigo-400/10 text-indigo-300"

                                : "border-white/[0.06] bg-white/[0.02] text-slate-400 hover:bg-white/[0.04]"

                            )}

                          >

                            24h

                          </button>

                        </div>

                      }

                    />

                    <SettingsRow

                      icon={<Clock size={15} />}

                      label="Show seconds"

                      description="Display seconds in clock"

                      control={

                        <Toggle

                          checked={settings.clockSeconds}

                          onChange={(v) => updateSetting("clockSeconds", v)}

                          reduceMotion={settings.reduceMotion}

                        />

                      }

                    />

                  </SettingsCard>

                </>

              )}



              {activeCategory === "accessibility" && (

                <>

                  <SectionLabel>Visual</SectionLabel>

                  <SettingsCard>

                    <SettingsRow

                      icon={<Accessibility size={15} />}

                      label="Larger text"

                      description="Increase base font size"

                      control={

                        <Toggle

                          checked={settings.largerText}

                          onChange={(v) => updateSetting("largerText", v)}

                          reduceMotion={settings.reduceMotion}

                        />

                      }

                    />

                  </SettingsCard>

                  <SectionLabel>Effects</SectionLabel>

                  <SettingsCard>

                    <SettingsRow

                      icon={<Sparkles size={15} />}

                      label="Reduced particles"

                      description="Reduce wallpaper particle effects"

                      control={

                        <Toggle

                          checked={settings.reducedParticles}

                          onChange={(v) => updateSetting("reducedParticles", v)}

                          reduceMotion={settings.reduceMotion}

                        />

                      }

                    />

                  </SettingsCard>

                </>

              )}



              {activeCategory === "performance" && (

                <>

                  <SectionLabel>Power</SectionLabel>

                  <SettingsCard>

                    <SettingsRow

                      icon={<Power size={15} />}

                      label="Low power mode"

                      description="Reduce resource usage"

                      control={

                        <Toggle

                          checked={settings.lowPowerMode}

                          onChange={(v) => updateSetting("lowPowerMode", v)}

                          reduceMotion={settings.reduceMotion}

                        />

                      }

                    />

                  </SettingsCard>

                  <SectionLabel>Performance</SectionLabel>

                  <SettingsCard>

                    <SettingsRow

                      icon={<Cpu size={15} />}

                      label="Disable 3D Robot"

                      description="Completely disable robot rendering"

                      control={

                        <Toggle

                          checked={settings.disableRobot}

                          onChange={(v) => updateSetting("disableRobot", v)}

                          reduceMotion={settings.reduceMotion}

                        />

                      }

                    />

                    <SettingsRow

                      icon={<Sparkles size={15} />}

                      label="Reduce animations"

                      description="More aggressive animation reduction"

                      control={

                        <Toggle

                          checked={settings.reduceAnimations}

                          onChange={(v) => updateSetting("reduceAnimations", v)}

                          reduceMotion={settings.reduceMotion}

                        />

                      }

                    />

                  </SettingsCard>

                </>

              )}



              {activeCategory === "robot" && (

                <>

                  {!settings.showRobot && (

                    <div className="flex items-center justify-between gap-3 rounded-xl border border-amber-400/20 bg-amber-400/[0.06] px-4 py-3">

                      <div>

                        <p className="text-sm font-medium text-amber-200">Byte is turned off</p>

                        <p className="text-xs text-amber-200/60">

                          Turn on the robot to preview changes on the desktop.

                        </p>

                      </div>

                      <button

                        onClick={() => updateSetting("showRobot", true)}

                        className="shrink-0 cursor-pointer rounded-lg bg-amber-400/20 px-3 py-1.5 text-xs font-medium text-amber-200 transition hover:bg-amber-400/30"

                      >

                        Turn on

                      </button>

                    </div>

                  )}



                  <div className={cn(!settings.showRobot && "pointer-events-none opacity-40")}>

                    <SectionLabel>Glow theme</SectionLabel>

                    <div className="mb-6 flex gap-2.5">

                      {ROBOT_THEMES.map((t) => {

                        const active = settings.robotTheme === t.id;

                        return (

                          <button

                            key={t.id}

                            title={t.id}

                            onClick={() => updateSetting("robotTheme", t.id)}

                            className="relative flex h-9 w-9 cursor-pointer items-center justify-center rounded-full transition hover:scale-105"

                            style={{ backgroundColor: t.hex }}

                          >

                            {active && (

                              <span className="absolute inset-0 rounded-full ring-2 ring-white ring-offset-2 ring-offset-[#0c0d12]" />

                            )}

                            {active && <Check size={13} className="text-white drop-shadow" />}

                          </button>

                        );

                      })}

                    </div>



                    <SectionLabel>Behavior</SectionLabel>

                    <SettingsCard>

                      <SettingsRow

                        icon={<Layers size={15} />}

                        label="Holo platform"

                        description="Show a holographic base beneath Byte"

                        control={

                          <Toggle

                            checked={settings.robotHologram}

                            onChange={(v) => updateSetting("robotHologram", v)}

                            reduceMotion={settings.reduceMotion}

                          />

                        }

                      />

                      <SettingsRow

                        icon={<MousePointer2 size={15} />}

                        label="Track mouse"

                        description="Byte's eyes follow your cursor"

                        control={

                          <Toggle

                            checked={settings.robotLookAtMouse}

                            onChange={(v) => updateSetting("robotLookAtMouse", v)}

                            reduceMotion={settings.reduceMotion}

                          />

                        }

                      />

                    </SettingsCard>

                  </div>

                </>

              )}



              {activeCategory === "about" && (

                <div>

                  <div className="mb-6 flex items-center gap-4 rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">

                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-400 shadow-lg shadow-indigo-500/20">

                      <SettingsIcon size={26} className="text-white" />

                    </div>

                    <div>

                      <p className="text-base font-semibold text-white">GihanOS</p>

                      <p className="text-xs text-slate-500">Version 1.0 · Personal build</p>

                    </div>

                  </div>



                  <SectionLabel>System information</SectionLabel>

                  <SettingsCard>

                    <InfoRow label="Edition" value="GihanOS Personal" />

                    <InfoRow label="Version" value="1.0.0" />

                    <InfoRow label="Rendering" value="Three.js + WebGL" />

                    <InfoRow label="Interface" value="Next.js · Framer Motion" />

                  </SettingsCard>

                </div>

              )}

            </motion.div>

          </AnimatePresence>

        </div>

      </main>

    </div>

  );

}



function SectionLabel({ children }: { children: React.ReactNode }) {

  return (

    <h3 className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-slate-500">

      {children}

    </h3>

  );

}



function SettingsCard({ children }: { children: React.ReactNode }) {

  return (

    <div className="mb-6 divide-y divide-white/[0.06] overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.03]">

      {children}

    </div>

  );

}



function SettingsRow({

  icon,

  label,

  description,

  control,

}: {

  icon?: React.ReactNode;

  label: string;

  description?: string;

  control: React.ReactNode;

}) {

  return (

    <div className="flex items-center justify-between gap-4 px-4 py-3.5 transition-colors hover:bg-white/[0.02]">

      <div className="flex min-w-0 items-center gap-3">

        {icon && (

          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.04] text-indigo-300">

            {icon}

          </div>

        )}

        <div className="min-w-0">

          <p className="truncate text-sm font-medium text-slate-200">{label}</p>

          {description && <p className="truncate text-xs text-slate-500">{description}</p>}

        </div>

      </div>

      <div className="shrink-0">{control}</div>

    </div>

  );

}



function InfoRow({ label, value }: { label: string; value: string }) {

  return (

    <div className="flex items-center justify-between px-4 py-3">

      <span className="text-sm text-slate-400">{label}</span>

      <span className="text-sm font-medium text-slate-200">{value}</span>

    </div>

  );

}



function Toggle({

  checked,

  onChange,

  reduceMotion,

}: {

  checked: boolean;

  onChange: (v: boolean) => void;

  reduceMotion?: boolean;

}) {

  return (

    <button

      role="switch"

      aria-checked={checked}

      onClick={() => onChange(!checked)}

      className={cn(

        "relative h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-300",

        checked ? "bg-gradient-to-r from-indigo-500 to-cyan-500" : "bg-slate-700/80"

      )}

    >

      <motion.span

        animate={{ left: checked ? 22 : 2 }}

        transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 500, damping: 32 }}

        className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-md"

      />

    </button>

  );

}