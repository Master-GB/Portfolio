"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useOS } from "@/contexts/OSContext";
import type { WallpaperId } from "@/types/os";

import { THEME_COLORS } from "@/lib/theme";
import { sound } from "@/lib/sound";
import RobotScene from "@/components/3d/RobotScene";
import { motion, AnimatePresence } from "framer-motion";

import { profile, projects, skills, education } from "@/data/portfolio";
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
  Copy,
  Check,
  Search,
  BarChart3,
  Gamepad2,
  Clock,
  Brain,
  Zap,
  ArrowRight,
  Code,
  User,
  Mail,
  Trophy,
  X,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────
interface Message {
  sender: "user" | "bot";
  text: string;
  isDiagnostic?: boolean;
  isTyping?: boolean; // true while typewriter effect is running
  richContent?: React.ReactNode; // for embedded widgets (stats, quiz, etc.)
}

// ─── Helpers ──────────────────────────────────────────────────

// Time-aware greeting
function getTimeGreeting(): string {
  const h = new Date().getHours();
  if (h < 6) return "Burning the midnight oil? 🌙";
  if (h < 12) return "Good morning! ☀️";
  if (h < 17) return "Good afternoon! 🌤️";
  if (h < 21) return "Good evening! 🌆";
  return "Good night! 🌙";
}

function getSessionDuration(start: number): string {
  const diff = Math.floor((Date.now() - start) / 1000);
  if (diff < 60) return `${diff}s`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ${diff % 60}s`;
  return `${Math.floor(diff / 3600)}h ${Math.floor((diff % 3600) / 60)}m`;
}

// Fuzzy match – returns score 0..1
function fuzzyScore(query: string, target: string): number {
  const q = query.toLowerCase();
  const t = target.toLowerCase();
  if (t.includes(q)) return 1;
  if (q.includes(t)) return 0.8;
  // token overlap
  const qTokens = q.split(/\s+/);
  const tTokens = t.split(/\s+/);
  const matches = qTokens.filter((qt) => tTokens.some((tt) => tt.includes(qt) || qt.includes(tt)));
  return matches.length / Math.max(qTokens.length, 1);
}

// Deep search across portfolio data
function deepSearch(query: string): string[] {
  const results: string[] = [];
  const q = query.toLowerCase();

  projects.forEach((p) => {
    if (p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.tech.some((t) => t.toLowerCase().includes(q))) {
      results.push(`📂 Project: **${p.title}** — ${p.description.slice(0, 80)}...`);
    }
  });

  skills.forEach((cat) => {
    cat.items.forEach((s) => {
      if (s.name.toLowerCase().includes(q)) {
        results.push(`💻 Skill: **${s.name}** (${s.level}%) in ${cat.category}`);
      }
    });
  });

  education.forEach((edu) => {
    edu.courses.forEach((c) => {
      if (c.name.toLowerCase().includes(q)) {
        results.push(`🎓 Course: **${c.name}** - Grade: ${c.grade}`);
      }
    });
    edu.certificates.forEach((cert) => {
      if (cert.title.toLowerCase().includes(q) || cert.issuer.toLowerCase().includes(q)) {
        results.push(`🏆 Certificate: **${cert.title}** by ${cert.issuer} (${cert.year})`);
      }
    });
  });

  return results;
}

// Portfolio stats computation
function getPortfolioStats() {
  const totalProjects = projects.length;
  const featuredProjects = projects.filter((p) => p.featured).length;
  const totalSkills = skills.reduce((acc, cat) => acc + cat.items.length, 0);
  const avgSkillLevel = Math.round(skills.reduce((acc, cat) => acc + cat.items.reduce((a, s) => a + s.level, 0), 0) / totalSkills);
  const topSkills = skills.flatMap((c) => c.items).sort((a, b) => b.level - a.level).slice(0, 5);
  const totalCerts = education.reduce((acc, e) => acc + e.certificates.length, 0);
  const techStack = new Set(projects.flatMap((p) => p.tech));
  return { totalProjects, featuredProjects, totalSkills, avgSkillLevel, topSkills, totalCerts, uniqueTechs: techStack.size };
}

// Quiz data
const QUIZ_QUESTIONS = [
  { q: "Which JavaScript runtime is built on Chrome's V8 engine?", options: ["Deno", "Node.js", "Bun", "PHP"], answer: 1 },
  { q: "What does CSS stand for?", options: ["Computer Style Sheets", "Creative Style System", "Cascading Style Sheets", "Colorful Style Sheets"], answer: 2 },
  { q: "Which database is document-oriented?", options: ["MySQL", "PostgreSQL", "MongoDB", "SQLite"], answer: 2 },
  { q: "What is the default port for a React dev server?", options: ["8080", "3000", "5000", "4200"], answer: 1 },
  { q: "Which company created TypeScript?", options: ["Google", "Facebook", "Microsoft", "Apple"], answer: 2 },
  { q: "What does API stand for?", options: ["Application Programming Interface", "Applied Protocol Integration", "App Processing Index", "Automated Program Interaction"], answer: 0 },
  { q: "Which framework uses a virtual DOM?", options: ["Angular", "Vue", "Svelte", "React"], answer: 3 },
  { q: "What is Docker used for?", options: ["Version control", "Containerization", "Databases", "Testing"], answer: 1 },
];

// ─── Main Component ───────────────────────────────────────────
export default function RobotAssistantApp() {
  const { settings, updateSetting, openWindow } = useOS();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [activeAnimation, setActiveAnimation] = useState<string | undefined>(undefined);
  const [availableAnimations, setAvailableAnimations] = useState<string[]>([]);
  const [discussedTopics, setDiscussedTopics] = useState<Set<string>>(new Set());
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showStats, setShowStats] = useState(false);
  const [quizActive, setQuizActive] = useState(false);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizAnswered, setQuizAnswered] = useState(false);
  const sessionStart = useRef(Date.now());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const hasInteracted = useRef(false);

  // Initial greeting
  useEffect(() => {
    const greeting = getTimeGreeting();
    setMessages([
      {
        sender: "bot",
        text: `${greeting} I am **Byte**, your holographic system assistant. 🤖\n\nI can navigate this OS, showcase Gihan's portfolio, run diagnostics, play quiz games, search skills, compare technologies, and much more!\n\nTry typing a command or pick a quick action below.`,
      },
    ]);
  }, []);

  // Play sound if enabled
  const playSound = useCallback((type: "beep" | "laser" | "success" | "click" | "reply") => {
    if (settings.soundEnabled) {
      sound.play(type);
    }
  }, [settings.soundEnabled]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleAnimationsLoaded = useCallback((names: string[]) => {
    setAvailableAnimations(names);
  }, []);

  // Helper to trigger specific animation temporarily
  const triggerAnimation = useCallback((name: string) => {
    playSound("click");
    setActiveAnimation(name);
    setTimeout(() => setActiveAnimation(undefined), 4000);
  }, [playSound]);

  // Copy to clipboard
  const copyToClipboard = useCallback((text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    playSound("success");
    setTimeout(() => setCopiedField(null), 2000);
  }, [playSound]);

  // Add a topic as discussed
  const markDiscussed = useCallback((topic: string) => {
    setDiscussedTopics((prev) => new Set(prev).add(topic));
  }, []);

  // Typewriter effect for bot messages
  const addBotMessage = useCallback((fullText: string, opts?: { isDiagnostic?: boolean; richContent?: React.ReactNode }) => {
    // Add empty bot message with isTyping flag
    const msgId = Date.now();
    setMessages((prev) => [
      ...prev,
      { sender: "bot", text: "", isTyping: true, isDiagnostic: opts?.isDiagnostic, richContent: opts?.richContent },
    ]);

    // Typewriter effect
    let charIndex = 0;
    const speed = Math.max(8, Math.min(20, 1200 / fullText.length)); // adaptive speed

    const interval = setInterval(() => {
      charIndex += 2; // 2 chars at a time for speed
      if (charIndex >= fullText.length) {
        charIndex = fullText.length;
        clearInterval(interval);
        setMessages((prev) => {
          const updated = [...prev];
          const lastBot = updated.findLastIndex((m) => m.sender === "bot");
          if (lastBot >= 0) {
            updated[lastBot] = { ...updated[lastBot], text: fullText, isTyping: false };
          }
          return updated;
        });
      } else {
        setMessages((prev) => {
          const updated = [...prev];
          const lastBot = updated.findLastIndex((m) => m.sender === "bot");
          if (lastBot >= 0) {
            updated[lastBot] = { ...updated[lastBot], text: fullText.slice(0, charIndex) };
          }
          return updated;
        });
      }
    }, speed);
  }, []);

  // ─── Smart Command Engine ────────────────────────────────────
  const getBotResponse = useCallback((input: string): { text: string; action?: () => void; isDiagnostic?: boolean } => {
    const raw = input.toLowerCase().trim();

    // ── Search command ──
    if (raw.startsWith("search ") || raw.startsWith("find ")) {
      const query = raw.replace(/^(search|find)\s+/, "").trim();
      const results = deepSearch(query);
      markDiscussed("search");
      if (results.length === 0) {
        return { text: `🔍 No results found for "${query}". Try searching for a technology, project name, or course!` };
      }
      return {
        text: `🔍 Found **${results.length}** result(s) for "${query}":\n\n${results.slice(0, 8).join("\n")}\n${results.length > 8 ? `\n...and ${results.length - 8} more` : ""}`,
      };
    }

    // ── Compare command ──
    if (raw.includes("compare") || raw.includes(" vs ") || raw.includes(" versus ")) {
      const allSkills = skills.flatMap((c) => c.items.map((s) => ({ ...s, category: c.category })));
      // Extract two skill names
      const cleanedInput = raw.replace("compare", "").replace("versus", "vs").trim();
      const parts = cleanedInput.split(/\s+vs\s+|\s+and\s+|\s*,\s*/);

      if (parts.length >= 2) {
        const find = (name: string) => allSkills.find((s) => s.name.toLowerCase().includes(name.trim()));
        const skillA = find(parts[0]);
        const skillB = find(parts[1]);

        if (skillA && skillB) {
          markDiscussed("compare");
          const barA = "█".repeat(Math.round(skillA.level / 10)) + "░".repeat(10 - Math.round(skillA.level / 10));
          const barB = "█".repeat(Math.round(skillB.level / 10)) + "░".repeat(10 - Math.round(skillB.level / 10));
          return {
            text: `⚔️ **Skill Comparison**\n\n**${skillA.name}** (${skillA.category})\n${barA} ${skillA.level}%\n\n**${skillB.name}** (${skillB.category})\n${barB} ${skillB.level}%\n\n${skillA.level > skillB.level ? `🏆 ${skillA.name} leads by ${skillA.level - skillB.level}%` : skillA.level < skillB.level ? `🏆 ${skillB.name} leads by ${skillB.level - skillA.level}%` : "🤝 Both skills are equally matched!"}`,
          };
        }
        return { text: `Couldn't find both skills. Available: ${allSkills.map((s) => s.name).slice(0, 15).join(", ")}...` };
      }
      return { text: `Try: "compare React vs Angular" or "compare Python vs Java"` };
    }

    // ── Stats command ──
    if (raw.includes("stats") || raw.includes("statistics") || raw.includes("metrics") || raw.includes("overview")) {
      markDiscussed("stats");
      const stats = getPortfolioStats();
      return {
        text: `📊 **Portfolio Analytics Dashboard**\n\n📂 Total Projects: **${stats.totalProjects}** (${stats.featuredProjects} featured)\n💻 Skills Tracked: **${stats.totalSkills}** across ${skills.length} categories\n📈 Average Proficiency: **${stats.avgSkillLevel}%**\n🛠️ Unique Technologies: **${stats.uniqueTechs}**\n🏆 Certifications: **${stats.totalCerts}**\n\n🔝 **Top 5 Skills:**\n${stats.topSkills.map((s, i) => `${["🥇", "🥈", "🥉", "4️⃣", "5️⃣"][i]} ${s.name} - ${s.level}%`).join("\n")}`,
        action: () => setShowStats(true),
      };
    }

    // ── Recommend project ──
    if (raw.includes("recommend") || raw.includes("suggestion") || raw.includes("what project") || raw.includes("best project")) {
      markDiscussed("recommend");
      const featured = projects.filter((p) => p.featured);
      const pick = featured[Math.floor(Math.random() * featured.length)];
      return {
        text: `🎯 **Project Spotlight: ${pick.title}**\n\n${pick.description}\n\n🛠️ Tech: ${pick.tech.join(", ")}\n🏷️ Tags: ${pick.tags.join(", ")}\n${pick.github ? `🔗 GitHub: ${pick.github}` : ""}\n${pick.demo ? `🌐 Demo: ${pick.demo}` : ""}\n\nWant to see all projects? Just say "projects"!`,
        action: () => openWindow("projects"),
      };
    }

    // ── Quiz ──
    if (raw.includes("quiz") || raw.includes("game") || raw.includes("play") || raw.includes("trivia")) {
      markDiscussed("quiz");
      setQuizActive(true);
      setQuizIndex(0);
      setQuizScore(0);
      setQuizAnswered(false);
      return {
        text: `🎮 **Tech Quiz Challenge!**\n\nI'll ask you ${QUIZ_QUESTIONS.length} questions about tech. Ready?\n\n❓ **Q1:** ${QUIZ_QUESTIONS[0].q}\n\n${QUIZ_QUESTIONS[0].options.map((o, i) => `${["A", "B", "C", "D"][i]}. ${o}`).join("\n")}`,
      };
    }

    // ── Quiz answer handling ──
    if (quizActive && !quizAnswered) {
      const answerMap: Record<string, number> = { a: 0, b: 1, c: 2, d: 3, "1": 0, "2": 1, "3": 2, "4": 3 };
      const userAnswer = answerMap[raw.charAt(0)];

      if (userAnswer !== undefined) {
        const q = QUIZ_QUESTIONS[quizIndex];
        const correct = userAnswer === q.answer;
        const newScore = correct ? quizScore + 1 : quizScore;
        setQuizScore(newScore);
        setQuizAnswered(true);

        if (quizIndex + 1 >= QUIZ_QUESTIONS.length) {
          // Quiz complete
          setQuizActive(false);
          const pct = Math.round((newScore / QUIZ_QUESTIONS.length) * 100);
          return {
            text: `${correct ? "✅ Correct!" : `❌ Wrong! Answer: ${q.options[q.answer]}`}\n\n🏆 **Quiz Complete!**\n\nYour Score: **${newScore}/${QUIZ_QUESTIONS.length}** (${pct}%)\n\n${pct >= 80 ? "🌟 Outstanding! You really know your tech!" : pct >= 50 ? "👍 Not bad! Keep learning!" : "📚 Keep studying, you'll get there!"}`,
          };
        }

        // Next question
        const nextIdx = quizIndex + 1;
        setTimeout(() => {
          setQuizIndex(nextIdx);
          setQuizAnswered(false);
        }, 100);

        const nextQ = QUIZ_QUESTIONS[nextIdx];
        return {
          text: `${correct ? "✅ Correct!" : `❌ Wrong! Answer: ${q.options[q.answer]}`}\n\nScore: ${newScore}/${quizIndex + 1}\n\n❓ **Q${nextIdx + 1}:** ${nextQ.q}\n\n${nextQ.options.map((o, i) => `${["A", "B", "C", "D"][i]}. ${o}`).join("\n")}`,
        };
      }
    }

    // ── Session info ──
    if (raw.includes("session") || raw.includes("uptime") || raw.includes("how long")) {
      return {
        text: `⏱️ **Session Info**\n\nDuration: ${getSessionDuration(sessionStart.current)}\nTopics discussed: ${discussedTopics.size > 0 ? Array.from(discussedTopics).join(", ") : "None yet"}\nMessages exchanged: ${messages.length + 1}`,
      };
    }

    // ── Copy contact ──
    if (raw.includes("copy email") || raw.includes("copy mail")) {
      return {
        text: `📋 Email copied to clipboard! → ${profile.email}`,
        action: () => copyToClipboard(profile.email, "email"),
      };
    }
    if (raw.includes("copy github") || raw.includes("copy git")) {
      return {
        text: `📋 GitHub copied! → ${profile.socials[0].url}`,
        action: () => copyToClipboard(profile.socials[0].url, "github"),
      };
    }
    if (raw.includes("copy linkedin")) {
      return {
        text: `📋 LinkedIn copied! → ${profile.socials[1].url}`,
        action: () => copyToClipboard(profile.socials[1].url, "linkedin"),
      };
    }

    // ── Standard portfolio navigation commands ──
    if (raw.includes("project")) {
      markDiscussed("projects");
      const alreadySaid = discussedTopics.has("projects");
      return {
        text: alreadySaid
          ? `Opening Projects again! 📂 Gihan has ${projects.length} projects including ${projects.filter(p => p.featured).length} featured ones.`
          : `Opening the Projects Application. 📂\n\nGihan has worked on **${projects.length} projects** including:\n${projects.filter(p => p.featured).slice(0, 4).map(p => `• **${p.title}** - ${p.tech.slice(0, 3).join(", ")}`).join("\n")}\n\nCheck them out in the window I just opened!`,
        action: () => openWindow("projects"),
      };
    }

    if (raw.includes("skill") || raw.includes("tech") || raw.includes("language") || raw.includes("react") || raw.includes("stack")) {
      markDiscussed("skills");
      return {
        text: `Opening the Skills App. 💻\n\nGihan tracks **${skills.reduce((a, c) => a + c.items.length, 0)} skills** across ${skills.length} categories:\n${skills.map(c => `• ${c.category} (${c.items.length} skills)`).join("\n")}\n\nPro tip: Try "compare React vs Angular" for a head-to-head!`,
        action: () => openWindow("skills"),
      };
    }

    if (raw.includes("education") || raw.includes("sliit") || raw.includes("university") || raw.includes("degree")) {
      markDiscussed("education");
      return {
        text: `Opening the Education App. 🎓\n\nGihan is a **${profile.year} Software Engineering Undergraduate** at **${profile.university}**.\n📊 GPA: ${education[0].details.split("·")[0].replace("GPA:", "").trim()}\n🏆 Certifications: ${education[0].certificates.length}`,
        action: () => openWindow("education"),
      };
    }

    if (raw.includes("resume") || raw.includes("cv")) {
      markDiscussed("resume");
      return {
        text: `Opening the Resume App. 📄\n\nView and download Gihan's resume directly!`,
        action: () => openWindow("resume"),
      };
    }

    if (raw.includes("terminal") || raw.includes("cmd") || raw.includes("shell") || raw.includes("console")) {
      markDiscussed("terminal");
      return {
        text: `Opening Terminal Console. 📟\n\nTry commands like 'about', 'skills', 'matrix', or 'sudo hire-me' 😉`,
        action: () => openWindow("terminal"),
      };
    }

    if (raw.includes("contact") || raw.includes("email") || raw.includes("hire") || raw.includes("mail")) {
      markDiscussed("contact");
      return {
        text: `Opening Contact Form. 📬\n\nGihan is actively seeking opportunities!\n\n📧 ${profile.email}\n🔗 GitHub: ${profile.socials[0].handle}\n💼 LinkedIn: ${profile.socials[1].handle}\n\n💡 Quick tip: Say "copy email" to copy to clipboard!`,
        action: () => openWindow("contact"),
      };
    }

    if (raw.includes("about") || raw.includes("who is") || raw.includes("whoareyou") || raw.includes("gihan")) {
      markDiscussed("about");
      return {
        text: `Opening About Me. 👤\n\n**${profile.fullName}** - ${profile.title}\n\n${profile.bio.trim().slice(0, 160)}...`,
        action: () => openWindow("about"),
      };
    }

    if (raw.includes("settings") || raw.includes("config") || raw.includes("preference")) {
      markDiscussed("settings");
      return {
        text: `Opening System Settings. ⚙️\n\nCustomize wallpaper, theme, performance, and more!`,
        action: () => openWindow("settings"),
      };
    }

    if (raw.includes("wallpaper") || raw.includes("theme") || raw.includes("background")) {
      markDiscussed("wallpaper");
      const wallpapers: WallpaperId[] = ["starfield", "nebula_pulse", "black_hole", "cosmic_dust", "aurora_galaxy"];
      const nextWp = wallpapers[Math.floor(Math.random() * wallpapers.length)];
      return {
        text: `Desktop reconfiguration complete! 🎨\n\nWallpaper set to **"${nextWp.replace(/_/g, " ").toUpperCase()}"**.\n\nThere are ${wallpapers.length} cosmic wallpapers available!`,
        action: () => updateSetting("wallpaper", nextWp),
      };
    }

    if (raw.includes("joke")) {
      markDiscussed("joke");
      const jokes = [
        "Why do programmers wear glasses? Because they can't C#! 😂",
        "There are 10 types of people: Those who understand binary, and those who don't. 🤖",
        "How many programmers does it take to change a light bulb? None, that's a hardware problem! 💡",
        "['hip', 'hip'] → hip hip array! 🤭",
        "A SQL query goes into a bar, walks up to two tables and asks, 'Can I join you?' 📊",
        "!false - It's funny because it's true 😆",
        "A programmer's wife says: 'Go to the store, buy a carton of milk. If they have eggs, get 6.' He comes back with 6 cartons of milk. 🥛",
        "Why did the developer go broke? Because he used up all his cache! 💸",
      ];
      return {
        text: jokes[Math.floor(Math.random() * jokes.length)],
        action: () => {
          const danceAnim = availableAnimations.find((n) =>
            n.toLowerCase().includes("dance") ||
            n.toLowerCase().includes("jump") ||
            n.toLowerCase().includes("wave")
          );
          if (danceAnim) triggerAnimation(danceAnim);
        },
      };
    }

    if (raw.includes("hello") || raw.includes("hi") || raw.includes("hey") || raw.includes("sup") || raw.includes("yo")) {
      return {
        text: `${getTimeGreeting()} 👋\n\nI'm **Byte**, your AI-powered portfolio guide! Session active for ${getSessionDuration(sessionStart.current)}.\n\nWhat would you like to explore? Try "stats", "quiz", "search react", or "recommend a project"!`,
        action: () => {
          const waveAnim = availableAnimations.find((n) => n.toLowerCase().includes("wave"));
          if (waveAnim) triggerAnimation(waveAnim);
        },
      };
    }

    if (raw.includes("clear")) {
      return { text: "__CLEAR__" };
    }

    if (raw.includes("sound") || raw.includes("audio") || raw.includes("mute")) {
      const nextSound = !settings.soundEnabled;
      return {
        text: `Audio Feed: **${nextSound ? "ENABLED 🔊" : "DISABLED 🔇"}**`,
        action: () => updateSetting("soundEnabled", nextSound),
      };
    }

    if (raw.includes("certificate") || raw.includes("cert") || raw.includes("achievement")) {
      markDiscussed("certificates");
      return {
        text: `🏆 **Certifications & Achievements**\n\n${education[0].certificates.map(c => `• **${c.title}** — ${c.issuer} (${c.year}) ${c.verified ? "✅" : ""}`).join("\n")}`,
      };
    }

    if (raw.includes("help") || raw.includes("command") || raw.includes("what can")) {
      return {
        text: `📖 **Byte Command Center**\n\n**Navigation:**\n• "projects" / "skills" / "about" / "contact" / "education" / "resume" / "terminal" / "settings"\n\n**Smart Features:**\n• "search [query]" - Deep search portfolio\n• "compare X vs Y" - Skill comparison\n• "stats" - Portfolio analytics\n• "recommend" - Random project spotlight\n• "quiz" - Tech trivia game\n• "experience" - Work history\n• "certificates" - Achievements\n\n**Utilities:**\n• "copy email" / "copy github" / "copy linkedin"\n• "wallpaper" - Random wallpaper swap\n• "joke" - Developer humor\n• "session" - Session info\n• "sound" - Toggle audio\n• "clear" - Reset chat`,
      };
    }

    // ── Fuzzy fallback – try to match project names ──
    const bestProject = projects.reduce<{ project: typeof projects[0]; score: number } | null>((best, p) => {
      const score = fuzzyScore(raw, p.title);
      if (score > 0.5 && (!best || score > best.score)) return { project: p, score };
      return best;
    }, null);

    if (bestProject) {
      markDiscussed("projects");
      const p = bestProject.project;
      return {
        text: `I found a matching project!\n\n🎯 **${p.title}**\n${p.description}\n\n🛠️ Tech: ${p.tech.join(", ")}\n${p.github ? `🔗 [GitHub](${p.github})` : ""}`,
        action: () => openWindow("projects"),
      };
    }

    // ── Default response ──
    return {
      text: `I registered your query: "${input}" 📡\n\nI'm still upgrading my neural networks! Try:\n• **"help"** for all commands\n• **"search [keyword]"** to find anything\n• **"stats"** for portfolio overview\n• **"quiz"** for a fun challenge`,
    };
  }, [availableAnimations, triggerAnimation, discussedTopics, markDiscussed, messages.length, openWindow, updateSetting, settings.soundEnabled, quizActive, quizAnswered, quizIndex, quizScore, copyToClipboard]);

  // ─── Send Handler ────────────────────────────────────────────
  const handleSend = useCallback((textToSend = inputText) => {
    if (!textToSend.trim()) return;
    hasInteracted.current = true;

    playSound("click");
    setMessages((prev) => [...prev, { sender: "user", text: textToSend }]);
    setInputText("");
    setIsTyping(true);

    setTimeout(() => {
      const response = getBotResponse(textToSend);
      setIsTyping(false);

      if (response.text === "__CLEAR__") {
        setMessages([{ sender: "bot", text: "Chat database cleared. Ready for new input! 🤖" }]);
        playSound("laser");
        return;
      }

      addBotMessage(response.text, { isDiagnostic: response.isDiagnostic });
      playSound("reply");

      if (response.action) {
        setTimeout(() => {
          response.action!();
          playSound("success");
        }, 300);
      }
    }, 600);
  }, [inputText, getBotResponse, playSound, addBotMessage]);

  // ─── Pre-built Scripts ───────────────────────────────────────
  const runTour = useCallback(() => {
    playSound("click");
    setMessages((prev) => [...prev, { sender: "user", text: "Start System Tour" }]);
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      addBotMessage(`🌌 **Welcome to GihanOS Portfolio!** 🌌\n\nThis is a Web Desktop styled as an operating system. Here's a tour:\n\n1️⃣ **About Me & Skills**: Who Gihan is + tech competency charts\n2️⃣ **Projects & Resume**: Interactive cards with live demos + downloadable CV\n3️⃣ **Notepad / Terminal**: Functional notepad & Unix-like mock terminal\n4️⃣ **AI Byte (Me!)**: I can search, compare, recommend, and play games!\n\n💡 **Pro Tips:**\n• Say "compare React vs Angular" for skill battles\n• Say "quiz" for a tech trivia challenge\n• Say "search [anything]" to find portfolio items\n\nClick icons to start exploring!`);
      playSound("reply");
      markDiscussed("tour");
    }, 800);
  }, [playSound, addBotMessage, markDiscussed]);

  const runDiagnostics = useCallback(() => {
    playSound("laser");
    setMessages((prev) => [...prev, { sender: "user", text: "Run System Diagnostics" }]);
    setIsTyping(true);

    const stats = getPortfolioStats();
    const scanLines = [
      "⚡ Initializing deep system telemetry sweep...",
      "🔍 Testing 3D WebGL Canvas core: OK",
      `🔋 CPU Load: ${Math.floor(Math.random() * 15 + 5)}% | RAM: ${(Math.random() * 4 + 3).toFixed(1)}GB`,
      `🧬 Avatar Anim Mixer: ${availableAnimations.length} animations loaded`,
      "🟢 Audio Synth Node via Web Audio API: ONLINE",
      `📊 Portfolio Status: ${stats.totalProjects} projects · ${stats.totalSkills} skills · ${stats.totalCerts} certifications`,
      `⏱️ Session uptime: ${getSessionDuration(sessionStart.current)}`,
      "🤖 All systems operational. Byte is at peak performance!",
    ];

    setTimeout(() => {
      setIsTyping(false);
      const reaction = availableAnimations.find((n) =>
        n.toLowerCase().includes("wave") || n.toLowerCase().includes("spin") || n.toLowerCase().includes("jump")
      );
      if (reaction) triggerAnimation(reaction);

      addBotMessage(scanLines.join("\n"), { isDiagnostic: true });
      playSound("success");
      markDiscussed("diagnostics");
    }, 1200);
  }, [playSound, availableAnimations, triggerAnimation, addBotMessage, markDiscussed]);

  // ─── Dynamic Suggestions ─────────────────────────────────────
  const dynamicSuggestions = useMemo(() => {
    const base = [
      { label: "🚀 System Tour", action: () => runTour() },
      { label: "📊 Portfolio Stats", action: () => handleSend("Show me portfolio stats") },
    ];

    if (!discussedTopics.has("quiz")) {
      base.push({ label: "🎮 Tech Quiz", action: () => handleSend("Start a tech quiz") });
    }
    if (!discussedTopics.has("projects")) {
      base.push({ label: "📂 Projects", action: () => handleSend("Open Projects App") });
    }
    if (!discussedTopics.has("compare")) {
      base.push({ label: "⚔️ Compare Skills", action: () => handleSend("Compare React vs Angular") });
    }
    if (!discussedTopics.has("recommend")) {
      base.push({ label: "🎯 Recommend", action: () => handleSend("Recommend a project") });
    }
    if (!discussedTopics.has("search")) {
      base.push({ label: "🔍 Deep Search", action: () => handleSend("Search MongoDB") });
    }
    if (!discussedTopics.has("joke")) {
      base.push({ label: "🎭 Dev Joke", action: () => handleSend("Tell me a developer joke!") });
    }

    // Always have diagnostics and help
    base.push({ label: "🛠️ Diagnostics", action: () => runDiagnostics() });


    return base.slice(0, 8); // max 8 suggestions
  }, [discussedTopics, runTour, runDiagnostics, handleSend]);

  // ─── Stats Panel ─────────────────────────────────────────────
  const stats = useMemo(() => getPortfolioStats(), []);

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
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{
                backgroundColor: "#22d3ee",
                animation: "ping 2s cubic-bezier(0, 0, 0.2, 1) infinite",
              }}
            />
            ONLINE
          </div>

          {/* Session timer badge */}
          <div className="absolute right-3 top-3 z-20 flex items-center gap-1 rounded-full bg-slate-900/80 px-2 py-1 text-[10px] font-mono tracking-wide text-slate-500 border border-slate-800/50 backdrop-blur-md">
            <Clock size={9} />
            <SessionTimer start={sessionStart.current} />
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 1 }}
            animate={{ opacity: 1, scale: 2 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="w-[120px] h-[120px]">
              <RobotScene
                interactive={true}
                activeAnimation={activeAnimation}
                onAnimationsLoaded={handleAnimationsLoaded}
              />
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

          {/* Quick Contact Copy */}
          <div>
            <span className="mb-2 block text-[11px] text-slate-500 uppercase tracking-wide flex items-center gap-1">
              <Copy size={11} /> Quick Copy
            </span>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => copyToClipboard(profile.email, "email")}
                className="flex items-center gap-1 rounded bg-slate-950/60 hover:bg-slate-800 text-[10px] py-1 px-2 text-slate-400 hover:text-white border border-slate-800/50 transition"
                title="Copy Email"
              >
                <Mail size={10} />
                {copiedField === "email" ? <Check size={10} className="text-emerald-400" /> : "Email"}
              </button>
              <button
                onClick={() => copyToClipboard(profile.socials[0].url, "github")}
                className="flex items-center gap-1 rounded bg-slate-950/60 hover:bg-slate-800 text-[10px] py-1 px-2 text-slate-400 hover:text-white border border-slate-800/50 transition"
                title="Copy GitHub"
              >
                <Code size={10} />
                {copiedField === "github" ? <Check size={10} className="text-emerald-400" /> : "GitHub"}
              </button>
              <button
                onClick={() => copyToClipboard(profile.socials[1].url, "linkedin")}
                className="flex items-center gap-1 rounded bg-slate-950/60 hover:bg-slate-800 text-[10px] py-1 px-2 text-slate-400 hover:text-white border border-slate-800/50 transition"
                title="Copy LinkedIn"
              >
                <User size={10} />
                {copiedField === "linkedin" ? <Check size={10} className="text-emerald-400" /> : "LinkedIn"}
              </button>
            </div>
          </div>

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
          <div className="flex-1">
            <h4 className="text-xs font-semibold text-white tracking-wide flex items-center gap-1.5">
              Byte OS Assistant
              <span
                className="inline-block h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: "#22d3ee" }}
              />
            </h4>
            <p className="text-[10px] text-slate-500">
              {quizActive ? `🎮 Quiz Mode - Q${quizIndex + 1}/${QUIZ_QUESTIONS.length}` : "Autonomous Guidance · Search · Compare · Quiz"}
            </p>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowStats(!showStats)}
              className={`rounded p-1.5 transition ${showStats ? "bg-cyan-500/20 text-cyan-400" : "hover:bg-slate-800 text-slate-500 hover:text-white"}`}
              title="Toggle Stats Panel"
            >
              <BarChart3 size={13} />
            </button>
          </div>
        </div>

        {/* Stats Panel Slide-out */}
        <AnimatePresence>
          {showStats && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden border-b border-slate-800"
            >
              <div className="p-3 bg-slate-900/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold flex items-center gap-1">
                    <BarChart3 size={10} className="text-cyan-400" /> Live Analytics
                  </span>
                  <button onClick={() => setShowStats(false)} className="text-slate-600 hover:text-white transition">
                    <X size={12} />
                  </button>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { label: "Projects", value: stats.totalProjects, color: "text-cyan-400" },
                    { label: "Skills", value: stats.totalSkills, color: "text-emerald-400" },
                    { label: "Avg Level", value: `${stats.avgSkillLevel}%`, color: "text-amber-400" },
                    { label: "Techs", value: stats.uniqueTechs, color: "text-purple-400" },
                  ].map((s) => (
                    <div key={s.label} className="text-center rounded bg-slate-950/60 border border-slate-800/40 py-1.5">
                      <div className={`text-sm font-bold ${s.color}`}>{s.value}</div>
                      <div className="text-[8px] text-slate-600 uppercase">{s.label}</div>
                    </div>
                  ))}
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] text-slate-500 uppercase tracking-widest">Top Skills</span>
                  {stats.topSkills.map((s) => (
                    <div key={s.name} className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400 w-[70px] truncate">{s.name}</span>
                      <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${s.level}%` }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                          className="h-full rounded-full"
                          style={{ background: `linear-gradient(90deg, ${themeHexStr}66, ${themeHexStr})` }}
                        />
                      </div>
                      <span className="text-[10px] text-slate-500 w-[28px] text-right">{s.level}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 scrollbar-thin">
          {messages.map((msg, index) => {
            const isBot = msg.sender === "bot";
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
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
                  style={{ whiteSpace: "pre-line" }}
                >
                  {msg.text}
                  {msg.isTyping && (
                    <span className="inline-block ml-0.5 w-[2px] h-[14px] bg-cyan-400 animate-pulse align-text-bottom" />
                  )}
                </div>
              </motion.div>
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

        {/* Quick Actions Suggestions — Dynamic */}
        <div className="p-2 border-t border-slate-900 bg-slate-950/20">
          <span className="px-2 mb-1.5 block text-[10px] text-slate-600 uppercase tracking-widest font-semibold flex items-center gap-1">
            <Sparkles size={10} className="text-cyan-400" /> {quizActive ? "Answer with A, B, C, or D" : "Smart Suggestions"}
          </span>
          <div className="flex flex-wrap gap-1 px-1 max-h-[70px] overflow-y-auto">
            {!quizActive &&
              dynamicSuggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={s.action}
                  className="rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-800 px-2.5 py-1 text-[11px] text-slate-300 hover:text-white transition flex items-center gap-1"
                >
                  {s.label}
                </button>
              ))}
            {quizActive && !quizAnswered && (
              <>
                {["A", "B", "C", "D"].map((letter) => (
                  <button
                    key={letter}
                    onClick={() => handleSend(letter)}
                    className="rounded-full bg-slate-900 hover:bg-indigo-600/60 border border-slate-800 hover:border-indigo-500/40 px-3.5 py-1 text-[11px] text-slate-300 hover:text-white transition font-mono font-bold"
                  >
                    {letter}
                  </button>
                ))}
              </>
            )}
          </div>
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex gap-2 border-t border-slate-900 bg-slate-950 p-3"
        >
          <input
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={quizActive ? "Type A, B, C, or D..." : "Try 'help', 'search react', 'compare', 'quiz'..."}
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

// ─── Session Timer (live) ──────────────────────────────────────
function SessionTimer({ start }: { start: number }) {
  const [, setTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);
  return <span>{getSessionDuration(start)}</span>;
}
