"use client";

import { useState, useEffect, useRef } from "react";
import { useOS } from "@/contexts/OSContext";
import type { WallpaperId } from "@/types/os";

import { THEME_COLORS } from "@/lib/theme";
import { sound } from "@/lib/sound";
import RobotScene from "@/components/3d/RobotScene";
import { motion } from "framer-motion";

import { profile, projects, skills } from "@/data/portfolio";
import type { AppId } from "@/data/portfolio";
import {
  Bot,
  Send,
  Cpu,
  Sparkles,
  Terminal,
  Settings2,
  Palette,
  Play,
  Volume2,
  VolumeX,
  RefreshCw,
  HelpCircle,
  FolderOpen,
} from "lucide-react";

interface Message {
  sender: "user" | "bot";
  text: string;
  isDiagnostic?: boolean;
}

export default function RobotAssistantApp() {
  const { settings, updateSetting, openWindow } = useOS();
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "bot",
      text: `Greetings! I am Byte, your holographic system assistant. 🤖\n\nI can help you navigate this OS, showcase Gihan's skills, explore projects, change your environment, or run diagnostic protocols. Try typing a command or clicking one of the options below!`,
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [activeAnimation, setActiveAnimation] = useState<string | undefined>(undefined);
  const [availableAnimations, setAvailableAnimations] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Play sound if enabled
  const playSound = (type: "beep" | "laser" | "success" | "click" | "reply") => {
    if (settings.soundEnabled) {
      sound.play(type);
    }
  };

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleAnimationsLoaded = (names: string[]) => {
    setAvailableAnimations(names);
  };

  // Helper to trigger specific animation temporarily
  const triggerAnimation = (name: string) => {
    playSound("click");
    setActiveAnimation(name);
    // Return to idle after a few seconds
    setTimeout(() => {
      setActiveAnimation(undefined);
    }, 4000);
  };

  // Bot response parser
  const getBotResponse = (input: string): { text: string; action?: () => void } => {
    const raw = input.toLowerCase().trim();

    // Check custom commands or keywords
    if (raw.includes("project")) {
      return {
        text: `Opening the Projects Application. 📂\n\nGihan has worked on several awesome projects, including an E-Commerce Platform, Task Management App, and a Fitness Tracker. Check them out in the window I just opened!`,
        action: () => openWindow("projects"),
      };
    }

    if (raw.includes("skill") || raw.includes("tech") || raw.includes("language") || raw.includes("react")) {
      return {
        text: `Opening the Skills App. 💻\n\nGihan specializes in:\n• Languages: TypeScript, Python, Java\n• Frontend: React, Next.js, Tailwind\n• Backend: Node.js, REST APIs, MongoDB/SQL\nCheck out the Skills App for competence ratings!`,
        action: () => openWindow("skills"),
      };
    }

    if (raw.includes("education") || raw.includes("sliit") || raw.includes("university")) {
      return {
        text: `Opening the Education App. 🎓\n\nGihan is a 4th-year Software Engineering Undergraduate at the Sri Lanka Institute of Information Technology (SLIIT).`,
        action: () => openWindow("education"),
      };
    }

    if (raw.includes("resume") || raw.includes("cv")) {
      return {
        text: `Opening the Resume App. 📄\n\nYou can view and download Gihan's resume directly from the window that just appeared!`,
        action: () => openWindow("resume"),
      };
    }

    if (raw.includes("terminal") || raw.includes("cmd") || raw.includes("shell")) {
      return {
        text: `Opening Terminal Console. 📟\n\nIf you prefer the command line, feel free to run commands like 'about', 'skills', or 'matrix' in the terminal!`,
        action: () => openWindow("terminal"),
      };
    }

    if (raw.includes("contact") || raw.includes("email") || raw.includes("hire") || raw.includes("mail")) {
      return {
        text: `Opening Contact Form. 📬\n\nLet's get in touch! Gihan is actively looking for internship opportunities. You can fill out the contact form or email directly at ${profile.email}.`,
        action: () => openWindow("contact"),
      };
    }

    if (raw.includes("about") || raw.includes("who is") || raw.includes("whoareyou")) {
      return {
        text: `Opening the About Me window. 👤\n\nGihan is a passionate Software Engineering undergraduate with hands-on experience in full-stack web, mobile, and cloud development.`,
        action: () => openWindow("about"),
      };
    }

    if (raw.includes("settings") || raw.includes("config")) {
      return {
        text: `Opening System Settings. ⚙️\n\nYou can change the system wallpaper, reduce motion, or toggle my presence from there.`,
        action: () => openWindow("settings"),
      };
    }

    if (raw.includes("wallpaper") || raw.includes("theme") || raw.includes("background")) {
      // Cycle wallpaper
      const wallpapers: WallpaperId[] = [
        "starfield",
        "nebula_pulse",
        "black_hole",
        "cosmic_dust",
        "aurora_galaxy",
      ];
      const nextWp = wallpapers[Math.floor(Math.random() * wallpapers.length)];
      return {
        text: `Initiating desktop reconfiguration... Done! 🎨\n\nI have set the wallpaper to "${nextWp.toUpperCase()}". Feel free to check the desktop!`,
        action: () => updateSetting("wallpaper", nextWp),
      };
    }

    if (raw.includes("joke")) {
      const jokes = [
        "Why do programmers wear glasses? Because they can't C#! 😂",
        "There are 10 types of people in this world: Those who understand binary, and those who don't. 🤖",
        "How many programmers does it take to change a light bulb? None, that's a hardware problem! 💡",
        "['hip', 'hip'] (hip hip array!) 🤭",
        "A SQL query goes into a bar, walks up to two tables and asks, 'Can I join you?' 📊",
      ];
      return {
        text: jokes[Math.floor(Math.random() * jokes.length)],
        action: () => {
          // Play dance or reaction animation
          const danceAnim = availableAnimations.find((n) =>
            n.toLowerCase().includes("dance") ||
            n.toLowerCase().includes("jump") ||
            n.toLowerCase().includes("wave")
          );
          if (danceAnim) triggerAnimation(danceAnim);
        },
      };
    }

    if (raw.includes("hello") || raw.includes("hi ") || raw.includes("hey")) {
      return {
        text: `Hello there! 👋 I am Byte, your friendly automated guide. How can I help you today? You can ask me about projects, skills, contact info, or tell me to run system tests!`,
      };
    }

    if (raw.includes("clear")) {
      return {
        text: "__CLEAR__",
      };
    }

    if (raw.includes("sound")) {
      const nextSound = !settings.soundEnabled;
      return {
        text: `Holographic Audio Feed: ${nextSound ? "ENABLED 🔊" : "DISABLED 🔇"}`,
        action: () => updateSetting("soundEnabled", nextSound),
      };
    }

    if (raw.includes("help") || raw.includes("command")) {
      return {
        text: `Here is what I can do:
• **"projects"** — Open projects list
• **"skills"** — Show Gihan's technical stack
• **"contact"** — Get Gihan's email & socials
• **"joke"** — Tell a developer joke
• **"wallpaper"** — Swap the OS wallpaper
• **"diagnostics"** — Trigger a hardware diagnostics sweep
• **"sound"** — Toggle synthesizer audio feedback`,
      };
    }

    // Default response
    return {
      text: `I've registered your query: "${input}". 📡\n\nWhile I continue to upgrade my neural networks, you can ask me to open parts of the portfolio. Try typing: "projects", "skills", "contact", "about", "diagnostics", or "joke"!`,
    };
  };

  const handleSend = (textToSend = inputText) => {
    if (!textToSend.trim()) return;

    playSound("click");
    // Add user message
    setMessages((prev) => [...prev, { sender: "user", text: textToSend }]);
    setInputText("");
    setIsTyping(true);

    // Simulate typing delay
    setTimeout(() => {
      const response = getBotResponse(textToSend);
      setIsTyping(false);

      if (response.text === "__CLEAR__") {
        setMessages([
          {
            sender: "bot",
            text: "Chat database cleared. Ready for new input! 🤖",
          },
        ]);
        playSound("laser");
        return;
      }

      setMessages((prev) => [...prev, { sender: "bot", text: response.text }]);
      playSound("reply");

      // Execute matched action if any
      if (response.action) {
        setTimeout(() => {
          response.action!();
          playSound("success");
        }, 300);
      }
    }, 800);
  };

  // Pre-baked scripts
  const runTour = () => {
    playSound("click");
    setMessages((prev) => [...prev, { sender: "user", text: "Start System Tour" }]);
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: `🌌 **Welcome to GihanOS Portfolio!** 🌌\n\nThis is a customized Web Desktop styled as an operating system. Here's a brief tour of the utilities:\n\n1️⃣ **About Me & Skills**: View who Gihan is and check out their tech competency bar graphs.\n2️⃣ **Projects & Resume**: Open interactive cards to view live code, demos, and download Gihan's CV.\n3️⃣ **Notepad / Music Player**: Functional notepad to jot notes and an active media player.\n4️⃣ **Terminal / Browser**: A Unix-like mock terminal and fully interactive iframe viewport.\n\nYou can click on icons to start exploring! Let me know if you want me to open any app for you.`,
        },
      ]);
      playSound("reply");
    }, 800);
  };

  const runDiagnostics = () => {
    playSound("laser");
    setMessages((prev) => [...prev, { sender: "user", text: "Run System Diagnostics" }]);
    setIsTyping(true);

    const scanLines = [
      "⚡ Initializing deep system telemetry sweep...",
      "🔍 Testing 3D WebGL Canvas core: OK",
      "🔋 CPU Load: 12% | RAM Usage: 4.8GB / 16.0GB (Optimal)",
      "🧬 Checking Avatar Anim Mixer... Idle/Standing/Dance matrices aligned.",
      "🟢 Audio Synth Node connected via Web Audio API: 100%",
      "🤖 All systems operational. Byte is at peak performance!",
    ];

    setTimeout(() => {
      setIsTyping(false);
      // Play high-tech reaction animation if available
      const reaction = availableAnimations.find((n) =>
        n.toLowerCase().includes("wave") ||
        n.toLowerCase().includes("spin") ||
        n.toLowerCase().includes("jump")
      );
      if (reaction) triggerAnimation(reaction);

      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: scanLines.join("\n"), isDiagnostic: true },
      ]);
      playSound("success");
    }, 1200);
  };

  const themeHexStr =
    THEME_COLORS[settings.robotTheme as keyof typeof THEME_COLORS]?.str ||
    THEME_COLORS.cyan.str;

  return (
    <div
      className="grid h-full w-full grid-cols-1 overflow-hidden rounded-xl bg-slate-950/40 text-slate-200 md:grid-cols-12"
      style={{
        border: `1px solid ${themeHexStr}33`,
        boxShadow: `0 0 15px ${themeHexStr}11`,
      }}
    >
      {/* 3D Customizer / Controller Panel (Left Side) */}
      <div className="flex flex-col border-b border-slate-800 md:col-span-5 md:border-b-0 md:border-r md:h-full">
        {/* Hologram Box */}
        <div className="relative h-[250px] w-full bg-radial-gradient(ellipse_at_center,rgba(30,41,59,0.3),transparent_70%) overflow-hidden md:h-0 md:flex-1">
          {/* Neon scan lines overlay */}
          <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,24,38,0)_94%,rgba(34,211,238,0.06)_95%,rgba(34,211,238,0.06)_98%,rgba(18,24,38,0)_99%)] bg-[length:100%_24px] animate-[pulse_6s_infinite] opacity-50 z-10" />

          {/* Hologram badge */}
          <div className="absolute left-3 top-3 z-20 flex items-center gap-1.5 rounded-full bg-slate-900/80 px-2.5 py-1 text-[10px] font-mono tracking-widest text-cyan-400 border border-cyan-500/30 backdrop-blur-md">
            <span className="h-1.5 w-1.5 animate-ping rounded-full bg-cyan-400" />
            ROBOT ACTIVE
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 1 }}
            animate={{ opacity: 1, scale: 2 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="w-[120px] h-[120px]">
              <RobotScene interactive={true} />
            </div>
          </motion.div>

        </div>

        {/* Configurations Box */}
        <div className="space-y-4 p-4 bg-slate-900/60 backdrop-blur-sm border-t border-slate-800">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
              <Settings2 size={14} className="text-cyan-400" />
              Robo Controller
            </h3>
            <button
              onClick={() => {
                playSound("click");
                updateSetting("robotAvatar", "robot");
                updateSetting("robotTheme", "cyan");
                updateSetting("robotLookAtMouse", true);
                playSound("success");
              }}
              className="rounded p-1 hover:bg-slate-800 text-slate-500 hover:text-white transition"
              title="Reset Settings"
            >
              <RefreshCw size={12} />
            </button>
          </div>

          {/* Theme switcher */}
          <div>
            <span className="mb-2 block text-[11px] text-slate-500 uppercase tracking-wide flex items-center gap-1">
              <Palette size={11} /> Glow Theme
            </span>
            <div className="flex flex-wrap gap-1.5">
              {Object.keys(THEME_COLORS).map((thKey) => {
                const colors = THEME_COLORS[thKey as keyof typeof THEME_COLORS];
                const active = settings.robotTheme === thKey;
                return (
                  <button
                    key={thKey}
                    onClick={() => {
                      playSound("click");
                      updateSetting("robotTheme", thKey as any);
                    }}
                    className={`h-6 w-6 rounded-full border transition flex items-center justify-center ${active ? "border-white scale-110" : "border-transparent hover:scale-105"
                      }`}
                    style={{ backgroundColor: colors.str }}
                    title={thKey}
                  />
                );
              })}
            </div>
          </div>

          {/* Playable Animations */}
          {availableAnimations.length > 0 && (
            <div>
              <span className="mb-2 block text-[11px] text-slate-500 uppercase tracking-wide flex items-center gap-1">
                <Play size={11} /> Force Animation Matrix
              </span>
              <div className="grid grid-cols-2 gap-1.5 max-h-[85px] overflow-y-auto pr-1">
                {availableAnimations.map((anim) => (
                  <button
                    key={anim}
                    onClick={() => triggerAnimation(anim)}
                    className={`flex items-center justify-center gap-1 rounded bg-slate-950/60 hover:bg-slate-800 text-[11px] py-1 text-slate-300 border border-slate-800/50 transition truncate px-2 ${activeAnimation === anim ? "text-cyan-400 border-cyan-500/40 bg-cyan-950/20" : ""
                      }`}
                    title={anim}
                  >
                    {anim}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Option Toggles */}
          <div className="grid grid-cols-2 gap-2 pt-1.5 border-t border-slate-800/80">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={settings.robotLookAtMouse}
                onChange={(e) => {
                  playSound("click");
                  updateSetting("robotLookAtMouse", e.target.checked);
                }}
                className="rounded text-indigo-600 bg-slate-950 border-slate-800 focus:ring-0 focus:ring-offset-0 h-3.5 w-3.5"
              />
              <span className="text-[11px] text-slate-400">Track Mouse</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none col-span-2">
              <input
                type="checkbox"
                checked={settings.soundEnabled}
                onChange={(e) => {
                  updateSetting("soundEnabled", e.target.checked);
                  setTimeout(() => playSound("success"), 50);
                }}
                className="rounded text-indigo-600 bg-slate-950 border-slate-800 focus:ring-0 focus:ring-offset-0 h-3.5 w-3.5"
              />
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                {settings.soundEnabled ? <Volume2 size={12} className="text-emerald-400" /> : <VolumeX size={12} />}
                Synthesizer Sound FX
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* AI Chat Console (Right Side) */}
      <div className="flex flex-col md:col-span-7 h-[350px] md:h-full overflow-hidden bg-slate-950/60 backdrop-blur-md">
        {/* Chat Header */}
        <div className="flex items-center gap-2 border-b border-slate-900 bg-slate-950/90 px-4 py-3">
          <div
            className="flex h-7 w-7 items-center justify-center rounded-lg"
            style={{ backgroundColor: `${themeHexStr}15` }}
          >
            <Bot size={16} style={{ color: themeHexStr }} />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-white tracking-wide">Byte OS Assistant</h4>
            <p className="text-[10px] text-slate-500">Autonomous Guidance & System Integration Node</p>
          </div>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 scrollbar-thin">
          {messages.map((msg, index) => {
            const isBot = msg.sender === "bot";
            return (
              <div
                key={index}
                className={`flex gap-2.5 ${isBot ? "" : "flex-row-reverse"}`}
              >
                {/* Avatar icon */}
                <div
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] border ${isBot
                    ? "bg-slate-900 border-slate-800 text-cyan-400"
                    : "bg-indigo-950 border-indigo-800/60 text-indigo-300"
                    }`}
                >
                  {isBot ? "🤖" : "👤"}
                </div>

                {/* Bubble */}
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed ${isBot
                    ? msg.isDiagnostic
                      ? "bg-slate-900/90 border border-emerald-500/20 text-emerald-400 font-mono"
                      : "bg-slate-900/50 border border-slate-800/80 text-slate-200"
                    : "bg-indigo-600/80 text-white rounded-tr-none"
                    }`}
                  style={{
                    whiteSpace: "pre-line",
                  }}
                >
                  {msg.text}
                </div>
              </div>
            );
          })}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex gap-2.5">
              <div className="flex h-6 w-6 items-center justify-center rounded-full border bg-slate-900 border-slate-800 text-[10px]">
                🤖
              </div>
              <div className="bg-slate-900/50 border border-slate-800/80 text-slate-400 rounded-2xl px-3.5 py-2 text-xs flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-500" style={{ animationDelay: "0ms" }} />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-500" style={{ animationDelay: "150ms" }} />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-500" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Actions Suggestions */}
        <div className="p-2 border-t border-slate-900 bg-slate-950/20">
          <span className="px-2 mb-1.5 block text-[10px] text-slate-600 uppercase tracking-widest font-semibold flex items-center gap-1">
            <Sparkles size={10} className="text-cyan-400" /> Suggested Directives
          </span>
          <div className="flex flex-wrap gap-1 px-1 max-h-[70px] overflow-y-auto">
            <button
              onClick={runTour}
              className="rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-800 px-2.5 py-1 text-[11px] text-slate-300 hover:text-white transition flex items-center gap-1"
            >
              🚀 System Tour
            </button>
            <button
              onClick={() => handleSend("Tell me a developer joke!")}
              className="rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-800 px-2.5 py-1 text-[11px] text-slate-300 hover:text-white transition flex items-center gap-1"
            >
              🎭 Dev Joke
            </button>
            <button
              onClick={() => handleSend("Open Projects App")}
              className="rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-800 px-2.5 py-1 text-[11px] text-slate-300 hover:text-white transition flex items-center gap-1"
            >
              📂 Projects
            </button>
            <button
              onClick={() => handleSend("Tell me about Gihan's Skills")}
              className="rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-800 px-2.5 py-1 text-[11px] text-slate-300 hover:text-white transition flex items-center gap-1"
            >
              💻 Tech Stack
            </button>
            <button
              onClick={() => handleSend("Change my Wallpaper")}
              className="rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-800 px-2.5 py-1 text-[11px] text-slate-300 hover:text-white transition flex items-center gap-1"
            >
              🎨 Swap Wallpaper
            </button>
            <button
              onClick={runDiagnostics}
              className="rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-800 px-2.5 py-1 text-[11px] text-slate-300 hover:text-white transition flex items-center gap-1"
            >
              🛠️ Diagnostics
            </button>
          </div>
        </div>

        {/* Robot Visualizer */}


        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex gap-2 border-t border-slate-900 bg-slate-950 p-3"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type 'help' or ask Byte to open projects, change wallpaper..."
            className="flex-1 rounded-xl bg-slate-900 px-4 py-2 text-xs text-white placeholder-slate-500 border border-slate-800 focus:outline-none focus:border-indigo-500/50 transition font-sans"
          />
          <button
            type="submit"
            className="flex items-center justify-center rounded-xl bg-indigo-600 hover:bg-indigo-500 transition px-4 text-white hover:shadow-lg hover:shadow-indigo-500/20 active:scale-95"
          >
            <Send size={14} />
          </button>
        </form>
      </div>
    </div>
  );
}
