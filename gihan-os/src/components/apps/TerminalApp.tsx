"use client";

import { useEffect, useRef, useState } from "react";

import { terminalCommands } from "@/data/portfolio";
import { profile } from "@/data/portfolio";
import { useOS } from "@/contexts/OSContext";

interface Line {
  type: "input" | "output" | "system";
  text: string;
}

export default function TerminalApp() {
  const { openWindow } = useOS();
  const [lines, setLines] = useState<Line[]>([
    { type: "system", text: `GihanOS Terminal-type 'help' for commands` },
    { type: "system", text: `Logged in as ${profile.name.toLowerCase()}@gihan-os` },
  ]);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [lines]);

  const runCommand = async (raw: string) => {
    const cmd = raw.trim().toLowerCase();
    const newLines: Line[] = [{ type: "input", text: `$ ${raw}` }];

    if (!cmd) {
      setLines((prev) => [...prev, ...newLines]);
      return;
    }

    if (cmd === "clear") {
      setLines([]);
      return;
    }

    // Handle async commands
   

    if (cmd === "joke") {
      newLines.push({ type: "output", text: "Fetching a joke..." });
      setLines((prev) => [...prev, ...newLines]);
      try {
        const res = await fetch("https://official-joke-api.appspot.com/random_joke");
        const data = await res.json();
        setLines((prev) => [...prev, { type: "output", text: `${data.setup}\n${data.punchline}` }]);
      } catch (e) {
        setLines((prev) => [...prev, { type: "output", text: "Failed to fetch joke." }]);
      }
      return;
    }

    if (cmd === "matrix") {
      newLines.push({
        type: "output",
        text: "Initiating matrix protocol...\nWake up, Neo...\nThe Matrix has you...\nFollow the white rabbit.\nKnock, knock, Neo.",
      });
      setLines((prev) => [...prev, ...newLines]);
      return;
    }

    if (cmd === "robo" || cmd === "ai") {
      newLines.push({
        type: "output",
        text: "Opening Byte AI OS Assistant Node... 🤖",
      });
      setLines((prev) => [...prev, ...newLines]);
      setTimeout(()=>openWindow("robot_assistant"),1000);
      return;
    }

    if (cmd === "sudo hire-me") {
      newLines.push({
        type: "output",
        text: "Permission granted. Let's connect! → Opening Contact app 📬",
      });
      setLines((prev) => [...prev, ...newLines]);
      setTimeout(() => openWindow("contact"), 1000);
      return;
    }

    const response = terminalCommands[cmd];

    if (response) {
      const output = Array.isArray(response) ? response.join("\n") : response;
      newLines.push({ type: "output", text: output });
    } else {
      newLines.push({
        type: "output",
        text: `Command not found: ${cmd}. Type 'help' for available commands.`,
      });
    }

    setLines((prev) => [...prev, ...newLines]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    runCommand(input);
    setInput("");
  };

  return (
    <div className="flex h-full min-h-[280px] flex-col bg-[#0c0c0c] font-mono text-xs ring-1 ring-white/10">
      <div className="flex-1 overflow-auto p-3 space-y-1">
        {lines.map((line, i) => (
          <p
            key={i}
            className={
              line.type === "input"
                ? "text-emerald-400"
                : line.type === "system"
                  ? "text-slate-500"
                  : "text-slate-300 whitespace-pre-wrap"
            }
          >
            {line.text}
          </p>
        ))}
        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 border-t border-white/10 p-2"
      >
        <span className="text-emerald-400">$</span>
        <input
          autoFocus
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 bg-transparent outline-none text-slate-200"
          placeholder="Type a command..."
          spellCheck={false}
        />
      </form>
    </div>
  );
}
