import React from "react";
import { motion } from "framer-motion";
import { Briefcase } from "lucide-react";

interface Project {
  id: string;
  title: string;
  description: string;
  tech: string[];
  github: string;
  demo?: string;
  featured?: boolean;
}

interface Props {
  projects: Project[];
}

export default function ProjectCarousel({ projects }: Props) {
  // Simple manual carousel (no external lib) using state
  const [index, setIndex] = React.useState(0);
  const total = projects.length;

  const next = () => setIndex((i) => (i + 1) % total);
  const prev = () => setIndex((i) => (i - 1 + total) % total);

  const project = projects[index];

  return (
    <div className="relative w-full max-w-md mx-auto">
      <motion.div
        key={project.id}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.4 }}
        className="p-4 bg-slate-800/40 backdrop-blur-sm rounded-xl border border-slate-700"
      >
        <h4 className="text-lg font-medium text-white flex items-center gap-1">
          <Briefcase size={16} className="text-indigo-400" /> {project.title}
        </h4>
        <p className="mt-2 text-sm text-slate-300">{project.description}</p>
        <div className="mt-2 flex flex-wrap gap-1">
          {project.tech.map((t) => (
            <span key={t} className="px-2 py-1 text-xs bg-indigo-500/15 text-indigo-200 rounded">
              {t}
            </span>
          ))}
        </div>
        <div className="mt-3 flex gap-2">
          {project.demo && (
            <a
              href={project.demo}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1 text-xs bg-indigo-500/20 text-indigo-100 rounded hover:bg-indigo-500/30 transition"
            >
              Demo
            </a>
          )}
          {project.github && (
            <a
              href={project.github}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1 text-xs bg-slate-600/20 text-slate-200 rounded hover:bg-slate-600/30 transition"
            >
              GitHub
            </a>
          )}
        </div>
      </motion.div>
      {/* Navigation Arrows */}
      <button
        onClick={prev}
        className="absolute left-0 top-1/2 -translate-y-1/2 p-2 rounded-full bg-slate-800/60 hover:bg-slate-700/80 transition"
        aria-label="Previous project"
      >
        ◀
      </button>
      <button
        onClick={next}
        className="absolute right-0 top-1/2 -translate-y-1/2 p-2 rounded-full bg-slate-800/60 hover:bg-slate-700/80 transition"
        aria-label="Next project"
      >
        ▶
      </button>
    </div>
  );
}
