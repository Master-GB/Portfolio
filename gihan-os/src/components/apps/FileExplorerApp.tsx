import React, { useMemo, useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Folder,
  FileText,
  Monitor,
  Image as ImageIcon,
  Video,
  Download as DownloadIcon,
  Music,
  User,
  Settings,
  Mail,
  Terminal,
  Edit3,
  GraduationCap,
  FolderKanban,
  ChevronRight,
  Search,
  LayoutGrid,
  List as ListIcon,
  ArrowUpDown,
  Star,
  Clock,
  HardDrive,
  ChevronDown,
  FolderOpen,
  Code,
  Bot,
} from "lucide-react";
import { useOS } from "@/contexts/OSContext";
import { apps } from "@/data/portfolio";
import type { AppId } from "@/data/portfolio";

const ICON_THEMES: Record<
  AppId,
  { gradient: string; shadow: string }
> = {
  about: {
    gradient: "from-sky-400 to-blue-600",
    shadow: "shadow-blue-900/50",
  },
  projects: {
    gradient: "from-amber-300 to-orange-500",
    shadow: "shadow-orange-900/50",
  },
  skills: {
    gradient: "from-emerald-400 to-green-600",
    shadow: "shadow-green-900/50",
  },
  resume: {
    gradient: "from-rose-400 to-red-600",
    shadow: "shadow-red-900/50",
  },
  education: {
    gradient: "from-violet-400 to-purple-600",
    shadow: "shadow-purple-900/50",
  },
  contact: {
    gradient: "from-cyan-400 to-teal-600",
    shadow: "shadow-teal-900/50",
  },
  terminal: {
    gradient: "from-slate-500 to-slate-800",
    shadow: "shadow-black/50",
  },
  settings: {
    gradient: "from-zinc-400 to-zinc-600",
    shadow: "shadow-zinc-900/50",
  },
  explorer: {
    gradient: "from-yellow-300 to-yellow-500",
    shadow: "shadow-yellow-900/50",
  },
  notepad: {
    gradient: "from-amber-200 to-amber-400",
    shadow: "shadow-amber-900/50",
  },
  robot_assistant: {
    gradient: "from-indigo-500 to-purple-600",
    shadow: "shadow-purple-900/50",
  },
};

type EntryType = "folder" | "app" | "doc" | "media";

interface FileEntry {
  name: string;
  appId?: AppId;
  icon: any;
  type: EntryType;
  meta: string; // date modified
  size?: string;
  accent: string; // tailwind gradient classes for icon chip
}

// Sidebar sections. "Desktop" and "Recent" are the only ones with content;
// everything else renders an empty-folder state, matching a fresh OS install.
type SectionKey =
  | "Desktop"
  | "Documents"
  | "Pictures"
  | "Video"
  | "Download"
  | "Music"
  | "Recent"
  | "Starred";

const QUICK_ACCESS: { name: SectionKey; icon: any }[] = [
  { name: "Desktop", icon: Monitor },
  { name: "Documents", icon: FileText },
  { name: "Pictures", icon: ImageIcon },
  { name: "Video", icon: Video },
  { name: "Download", icon: DownloadIcon },
  { name: "Music", icon: Music },
];

const FAVORITES: { name: SectionKey; icon: any }[] = [
  { name: "Recent", icon: Clock },
  { name: "Starred", icon: Star },
];

// Note: "Skills.exe" assumes an AppId of "skills" exists in your portfolio
// data. Adjust the appId (or remove the entry) if that's not the case.
const ENTRIES: FileEntry[] = [
  { name: "About Me.txt", appId: "about", icon: User, type: "doc", meta: "Today, 09:14", size: "2 KB", accent: ICON_THEMES.about.gradient },
  { name: "Resume.pdf", appId: "resume", icon: FileText, type: "doc", meta: "Today, 09:14", size: "184 KB", accent: ICON_THEMES.resume.gradient },
  { name: "Skills.exe", appId: "skills" as AppId, icon: apps.find(a => a.id === "skills")?.icon || GraduationCap, type: "app", meta: "Today, 08:50", size: "760 KB", accent: ICON_THEMES.skills.gradient },
  { name: "Contact.exe", appId: "contact", icon: apps.find(a => a.id === "contact")?.icon || Mail, type: "app", meta: "Yesterday, 18:02", size: "1.2 MB", accent: ICON_THEMES.contact.gradient },
  { name: "Projects.exe", appId: "projects", icon: apps.find(a => a.id === "projects")?.icon || FolderKanban, type: "app", meta: "Yesterday, 17:41", size: "3.4 MB", accent: ICON_THEMES.projects.gradient },
  { name: "Terminal.exe", appId: "terminal", icon: apps.find(a => a.id === "terminal")?.icon || Terminal, type: "app", meta: "2 days ago", size: "890 KB", accent: ICON_THEMES.terminal.gradient },
  { name: "Settings.exe", appId: "settings", icon: apps.find(a => a.id === "settings")?.icon || Settings, type: "app", meta: "2 days ago", size: "640 KB", accent: ICON_THEMES.settings.gradient },
  { name: "Notepad.exe", appId: "notepad", icon: apps.find(a => a.id === "notepad")?.icon || Edit3, type: "app", meta: "3 days ago", size: "512 KB", accent: ICON_THEMES.notepad.gradient },
  { name: "Education.exe", appId: "education", icon: apps.find(a => a.id === "education")?.icon || GraduationCap, type: "app", meta: "3 days ago", size: "1.1 MB", accent: ICON_THEMES.education.gradient },
];

const RECENT_NAMES = ["About Me.txt", "Skills.exe", "Projects.exe"];

type ViewMode = "grid" | "list";
type SortKey = "name" | "meta" | "size";

export default function FileExplorerApp() {
  const { openWindow } = useOS();
  const [query, setQuery] = useState("");
  const [view, setView] = useState<ViewMode>("grid");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [selected, setSelected] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<SectionKey>("Desktop");
  const [sortOpen, setSortOpen] = useState(false);
  const sortButtonRef = useRef<HTMLButtonElement>(null);
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number } | null>(null);

  useEffect(() => {
    if (sortOpen && sortButtonRef.current) {
      const rect = sortButtonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 4,
        left: rect.right - 128, // 128 is the width of the dropdown
      });
    } else {
      setDropdownPosition(null);
    }
  }, [sortOpen]);

  const sectionEntries = useMemo(() => {
    if (activeSection === "Desktop") return ENTRIES;
    if (activeSection === "Recent") return ENTRIES.filter((e) => RECENT_NAMES.includes(e.name));
    return []; // Documents, Pictures, Video, Download, Music, Starred -> empty folder
  }, [activeSection]);

  const filtered = useMemo(() => {
    const list = sectionEntries.filter((e) =>
      e.name.toLowerCase().includes(query.toLowerCase())
    );
    return [...list].sort((a, b) => {
      if (sortKey === "name") return a.name.localeCompare(b.name);
      if (sortKey === "size") return (a.size ?? "").localeCompare(b.size ?? "");
      return a.meta.localeCompare(b.meta);
    });
  }, [sectionEntries, query, sortKey]);

  const handleOpen = (entry: FileEntry) => {
    if (entry.appId) openWindow(entry.appId);
  };

  const goToSection = (name: SectionKey) => {
    setActiveSection(name);
    setSelected(null);
    setQuery("");
  };

  const isEmptySection = sectionEntries.length === 0;

  return (
    <div className="flex h-full w-full flex-col bg-white text-zinc-800 dark:bg-[#0e0e11] dark:text-zinc-100 select-none">
      {/* Top toolbar */}
      <div className="flex items-center gap-2 border-b border-zinc-200/80 dark:border-white/[0.06] bg-zinc-50/80 dark:bg-white/[0.02] px-3 py-2 backdrop-blur-xl">
        <div className="flex items-center gap-1">
          <button
            disabled
            className="grid h-7 w-7 place-items-center rounded-md text-zinc-400 dark:text-zinc-600 opacity-50"
            aria-label="Back"
          >
            <ChevronRight size={15} className="rotate-180" />
          </button>
          <button
            disabled
            className="grid h-7 w-7 place-items-center rounded-md text-zinc-400 dark:text-zinc-600 opacity-50"
            aria-label="Forward"
          >
            <ChevronRight size={15} />
          </button>
        </div>

        {/* Breadcrumb */}
        <div className="flex flex-1 items-center gap-1 rounded-lg border border-zinc-200 dark:border-white/[0.07] bg-white dark:bg-white/[0.03] px-2.5 py-1.5 text-sm">
          <HardDrive size={14} className="text-blue-500 dark:text-blue-400 shrink-0" />
          {["Gihan", activeSection].map((crumb, i, arr) => (
            <React.Fragment key={crumb}>
              <span
                className={
                  i === arr.length - 1
                    ? "font-medium text-zinc-800 dark:text-zinc-100"
                    : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 cursor-pointer"
                }
              >
                {crumb}
              </span>
              {i < arr.length - 1 && (
                <ChevronRight size={13} className="text-zinc-400 dark:text-zinc-600 shrink-0" />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-48 shrink-0">
          <Search
            size={14}
            className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search ${activeSection}`}
            className="w-full rounded-lg border border-zinc-200 dark:border-white/[0.07] bg-white dark:bg-white/[0.03] py-1.5 pl-8 pr-2.5 text-xs text-zinc-700 dark:text-zinc-200 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 outline-none ring-blue-500/40 focus:ring-2 transition-shadow"
          />
        </div>

        {/* Sort */}
        <div className="relative shrink-0">
          <button
            ref={sortButtonRef}
            onClick={() => setSortOpen((v) => !v)}
            className="flex h-8 items-center gap-1 rounded-lg border border-zinc-200 dark:border-white/[0.07] bg-white dark:bg-white/[0.03] px-2.5 text-xs text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-white/[0.06] transition-colors"
          >
            <ArrowUpDown size={13} />
            <span className="capitalize">{sortKey}</span>
            <ChevronDown size={12} className={`transition-transform ${sortOpen ? "rotate-180" : ""}`} />
          </button>
          {sortOpen && dropdownPosition && typeof document !== "undefined" && createPortal(
            <div
              className="fixed z-[9999] w-32 overflow-hidden rounded-lg border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-[#1a1a1f] shadow-xl"
              style={{
                top: `${dropdownPosition.top}px`,
                left: `${dropdownPosition.left}px`,
              }}
            >
              {(["name", "meta", "size"] as SortKey[]).map((k) => (
                <button
                  key={k}
                  onClick={() => {
                    setSortKey(k);
                    setSortOpen(false);
                  }}
                  className={`block w-full px-3 py-1.5 text-left text-xs capitalize hover:bg-zinc-100 dark:hover:bg-white/[0.06] ${
                    sortKey === k ? "text-blue-500 font-medium" : "text-zinc-600 dark:text-zinc-300"
                  }`}
                >
                  {k === "meta" ? "date modified" : k}
                </button>
              ))}
            </div>,
            document.body
          )}
        </div>

        {/* View toggle */}
        <div className="flex shrink-0 items-center gap-0.5 rounded-lg border border-zinc-200 dark:border-white/[0.07] bg-white dark:bg-white/[0.03] p-0.5">
          <button
            onClick={() => setView("grid")}
            className={`grid h-7 w-7 place-items-center rounded-md transition-colors ${
              view === "grid"
                ? "bg-blue-500 text-white shadow-sm"
                : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/[0.06]"
            }`}
            aria-label="Grid view"
          >
            <LayoutGrid size={14} />
          </button>
          <button
            onClick={() => setView("list")}
            className={`grid h-7 w-7 place-items-center rounded-md transition-colors ${
              view === "list"
                ? "bg-blue-500 text-white shadow-sm"
                : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/[0.06]"
            }`}
            aria-label="List view"
          >
            <ListIcon size={14} />
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="flex w-52 shrink-0 flex-col gap-4 border-r border-zinc-200/80 dark:border-white/[0.06] bg-zinc-50/60 dark:bg-white/[0.015] p-3">
          <div>
            <div className="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              Favorites
            </div>
            {FAVORITES.map((item) => {
              const isActive = activeSection === item.name;
              return (
                <button
                  key={item.name}
                  onClick={() => goToSection(item.name)}
                  className={`flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left text-sm transition-colors ${
                    isActive
                      ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 font-medium"
                      : "text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200/60 dark:hover:bg-white/[0.06]"
                  }`}
                >
                  <item.icon
                    size={15}
                    className={isActive ? "text-blue-500" : "text-zinc-400 dark:text-zinc-500"}
                  />
                  {item.name}
                  {isActive && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-blue-500" />}
                </button>
              );
            })}
          </div>

          <div>
            <div className="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              Quick Access
            </div>
            <div className="flex flex-col gap-0.5">
              {QUICK_ACCESS.map((folder) => {
                const isActive = activeSection === folder.name;
                return (
                  <button
                    key={folder.name}
                    onClick={() => goToSection(folder.name)}
                    className={`flex items-center gap-2.5 rounded-md px-2 py-1.5 text-left text-sm transition-colors ${
                      isActive
                        ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 font-medium"
                        : "text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200/60 dark:hover:bg-white/[0.06]"
                    }`}
                  >
                    <folder.icon
                      size={15}
                      className={isActive ? "text-blue-500" : "text-blue-400/80 dark:text-blue-400/70"}
                    />
                    {folder.name}
                    {isActive && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-blue-500" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Storage widget */}
          <div className="mt-auto rounded-xl border border-zinc-200 dark:border-white/[0.07] bg-white dark:bg-white/[0.03] p-3">
            <div className="flex items-center gap-2 text-xs font-medium text-zinc-600 dark:text-zinc-300">
              <HardDrive size={13} className="text-blue-500" />
              Local Disk (C:)
            </div>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-white/[0.08]">
              <div className="h-full w-[42%] rounded-full bg-gradient-to-r from-blue-500 to-violet-500" />
            </div>
            <div className="mt-1.5 text-[10px] text-zinc-400 dark:text-zinc-500">168 GB free of 400 GB</div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4">
            {isEmptySection ? (
              <div className="flex h-full flex-col items-center justify-center gap-2 text-zinc-400 dark:text-zinc-600">
                <FolderOpen size={30} strokeWidth={1.5} />
                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-500">This folder is empty</p>
                <p className="text-xs text-zinc-400 dark:text-zinc-600">Nothing to see in {activeSection} yet</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center gap-2 text-zinc-400 dark:text-zinc-600">
                <Search size={28} />
                <p className="text-sm">No results for "{query}"</p>
              </div>
            ) : view === "grid" ? (
              <div className="grid grid-cols-4 gap-3 sm:grid-cols-5 md:grid-cols-6">
                {filtered.map((entry) => {
                  const isSelected = selected === entry.name;
                  return (
                    <button
                      key={entry.name}
                      onClick={() => setSelected(entry.name)}
                      onDoubleClick={() => handleOpen(entry)}
                      className={`group flex flex-col items-center gap-2 rounded-xl border p-3 text-center transition-all ${
                        isSelected
                          ? "border-blue-400/60 bg-blue-500/10 shadow-sm"
                          : "border-transparent hover:border-zinc-200 dark:hover:border-white/[0.08] hover:bg-zinc-100/70 dark:hover:bg-white/[0.04]"
                      }`}
                    >
                      <div
                        className={`grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br ${entry.accent} shadow-md shadow-black/10 transition-transform group-hover:scale-105 group-active:scale-95`}
                      >
                        <entry.icon size={22} className="text-white drop-shadow-sm" />
                      </div>
                      <span className="w-full truncate text-xs font-medium text-zinc-700 dark:text-zinc-200">
                        {entry.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="overflow-hidden rounded-lg border border-zinc-200 dark:border-white/[0.07]">
                <div className="grid grid-cols-[1fr_140px_90px] gap-2 border-b border-zinc-200 dark:border-white/[0.07] bg-zinc-50 dark:bg-white/[0.03] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
                  <span>Name</span>
                  <span>Date modified</span>
                  <span className="text-right">Size</span>
                </div>
                {filtered.map((entry, i) => {
                  const isSelected = selected === entry.name;
                  return (
                    <button
                      key={entry.name}
                      onClick={() => setSelected(entry.name)}
                      onDoubleClick={() => handleOpen(entry)}
                      className={`grid w-full grid-cols-[1fr_140px_90px] items-center gap-2 px-3 py-2 text-left text-xs transition-colors ${
                        isSelected
                          ? "bg-blue-500/10"
                          : i % 2 === 0
                          ? "bg-transparent hover:bg-zinc-100/70 dark:hover:bg-white/[0.04]"
                          : "bg-zinc-50/50 dark:bg-white/[0.015] hover:bg-zinc-100/70 dark:hover:bg-white/[0.04]"
                      }`}
                    >
                      <span className="flex items-center gap-2 truncate font-medium text-zinc-700 dark:text-zinc-200">
                        <span
                          className={`grid h-6 w-6 shrink-0 place-items-center rounded-md bg-gradient-to-br ${entry.accent}`}
                        >
                          <entry.icon size={12} className="text-white" />
                        </span>
                        <span className="truncate">{entry.name}</span>
                      </span>
                      <span className="text-zinc-400 dark:text-zinc-500">{entry.meta}</span>
                      <span className="text-right text-zinc-400 dark:text-zinc-500">{entry.size}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Status bar */}
          <div className="flex items-center justify-between border-t border-zinc-200/80 dark:border-white/[0.06] bg-zinc-50/80 dark:bg-white/[0.02] px-4 py-1.5 text-[11px] text-zinc-500 dark:text-zinc-400">
            <span>{filtered.length} items</span>
            <span>{selected ? `"${selected}" selected` : "\u00A0"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}