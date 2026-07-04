import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Save,
  FilePlus2,
  Scissors,
  Copy,
  ClipboardPaste,
  MousePointerSquareDashed,
  WrapText,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Check,
  FileText,
  X,
  Plus,
} from "lucide-react";

type MenuKey = "file" | "edit" | "view" | null;

interface Tab {
  id: string;
  name: string;
  content: string;
  savedContent: string;
}

const STORAGE_KEY = "notepad_tabs";
const LEGACY_KEY = "notepad_text";
const MIN_ZOOM = 60;
const MAX_ZOOM = 200;

const makeId = () => Math.random().toString(36).slice(2, 9);

export default function NotepadApp() {
  const [tabs, setTabs] = useState<Tab[]>([
    { id: "guestbook", name: "guestbook.txt", content: "", savedContent: "" },
  ]);
  const [activeId, setActiveId] = useState("guestbook");
  const [justSaved, setJustSaved] = useState(false);
  const [wordWrap, setWordWrap] = useState(true);
  const [zoom, setZoom] = useState(100);
  const [openMenu, setOpenMenu] = useState<MenuKey>(null);
  const [cursor, setCursor] = useState({ line: 1, col: 1 });
  const [untitledCount, setUntitledCount] = useState(1);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const activeTab = tabs.find((t) => t.id === activeId) ?? tabs[0];
  const isDirty = activeTab.content !== activeTab.savedContent;

  // Load persisted tabs (or migrate from the old single-file storage) on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed: Tab[] = JSON.parse(stored);
        if (parsed.length > 0) {
          setTabs(parsed);
          setActiveId(parsed[0].id);
          return;
        }
      } catch {
        /* fall through to legacy migration */
      }
    }
    const legacy = localStorage.getItem(LEGACY_KEY);
    if (legacy !== null) {
      setTabs([{ id: "guestbook", name: "guestbook.txt", content: legacy, savedContent: legacy }]);
    }
  }, []);

  const persist = (nextTabs: Tab[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextTabs));
  };

  const setActiveContent = (val: string) => {
    setTabs((prev) => prev.map((t) => (t.id === activeId ? { ...t, content: val } : t)));
  };

  const handleSave = useCallback(() => {
    setTabs((prev) => {
      const next = prev.map((t) => (t.id === activeId ? { ...t, savedContent: t.content } : t));
      persist(next);
      return next;
    });
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 1600);
  }, [activeId]);

  // Ctrl/Cmd+S shortcut
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleSave]);

  const updateCursor = () => {
    const el = textareaRef.current;
    if (!el) return;
    const pos = el.selectionStart;
    const before = el.value.slice(0, pos);
    const lines = before.split("\n");
    setCursor({ line: lines.length, col: lines[lines.length - 1].length + 1 });
  };

  // Recompute cursor position whenever the active tab changes
  useEffect(() => {
    updateCursor();
    textareaRef.current?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId]);

  const closeMenu = () => setOpenMenu(null);

  const handleNewTab = () => {
    const id = makeId();
    const name = `Untitled-${untitledCount}.txt`;
    const tab: Tab = { id, name, content: "", savedContent: "" };
    setTabs((prev) => [...prev, tab]);
    setUntitledCount((n) => n + 1);
    setActiveId(id);
    closeMenu();
  };

  const closeTab = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const target = tabs.find((t) => t.id === id);
    if (target && target.content !== target.savedContent) {
      if (!window.confirm(`Discard unsaved changes in "${target.name}"?`)) return;
    }
    setTabs((prev) => {
      const next = prev.filter((t) => t.id !== id);
      if (next.length === 0) {
        const fresh: Tab = { id: "guestbook", name: "guestbook.txt", content: "", savedContent: "" };
        persist([fresh]);
        setActiveId(fresh.id);
        return [fresh];
      }
      if (activeId === id) setActiveId(next[0].id);
      persist(next);
      return next;
    });
  };

  const focusThen = (fn: () => void) => {
    textareaRef.current?.focus();
    fn();
    closeMenu();
  };

  const handleCut = () => focusThen(() => document.execCommand("cut"));
  const handleCopy = () => focusThen(() => document.execCommand("copy"));
  const handlePaste = () =>
    focusThen(async () => {
      try {
        const clip = await navigator.clipboard.readText();
        const el = textareaRef.current;
        if (!el) return;
        const start = el.selectionStart;
        const end = el.selectionEnd;
        setActiveContent(activeTab.content.slice(0, start) + clip + activeTab.content.slice(end));
      } catch {
        document.execCommand("paste");
      }
    });
  const handleSelectAll = () => focusThen(() => textareaRef.current?.select());

  const wordCount = activeTab.content.trim() ? activeTab.content.trim().split(/\s+/).length : 0;
  const charCount = activeTab.content.length;

  const zoomIn = () => {
    setZoom((z) => Math.min(MAX_ZOOM, z + 10));
    closeMenu();
  };
  const zoomOut = () => {
    setZoom((z) => Math.max(MIN_ZOOM, z - 10));
    closeMenu();
  };
  const zoomReset = () => {
    setZoom(100);
    closeMenu();
  };
  const toggleWordWrap = () => {
    setWordWrap((w) => !w);
    closeMenu();
  };

  const menuBtnClass = (key: MenuKey) =>
    `relative z-30 px-2.5 py-1 text-xs rounded-md transition-colors ${
      openMenu === key
        ? "bg-blue-500/15 text-blue-600 dark:text-blue-400"
        : "text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200/60 dark:hover:bg-white/[0.06]"
    }`;

  const itemClass =
    "flex w-full items-center justify-between gap-6 px-3 py-1.5 text-left text-xs text-zinc-700 dark:text-zinc-200 hover:bg-blue-50 dark:hover:bg-white/[0.06] transition-colors";

  return (
    <div className="relative flex h-full flex-col bg-white dark:bg-[#0e0e11] text-zinc-900 dark:text-zinc-100">
      {/* Click-outside overlay: confined to this app's own container (not `fixed`,
          which would escape the window's stacking context and can end up
          painting over the toolbar itself inside a transformed/draggable window). */}
      {openMenu && (
        <div className="absolute inset-0 z-20" onClick={closeMenu} aria-hidden="true" />
      )}

      {/* Menu bar — `relative z-30` here is required: `backdrop-blur-xl` creates its
          own stacking context, which would otherwise trap the buttons' z-30 locally
          and let the overlay's z-20 paint over the whole bar from outside. */}
      <div className="relative z-30 flex items-center gap-0.5 border-b border-zinc-200/80 dark:border-white/[0.06] bg-zinc-50/80 dark:bg-white/[0.02] px-2 py-1.5 backdrop-blur-xl">
        <FileText size={14} className="relative z-30 mr-1.5 text-blue-500" />

        {/* File menu */}
        <div className="relative z-30">
          <button
            className={menuBtnClass("file")}
            onClick={() => setOpenMenu((m) => (m === "file" ? null : "file"))}
          >
            File
          </button>
          {openMenu === "file" && (
            <div className="absolute left-0 top-full z-30 mt-1 w-48 overflow-hidden rounded-lg border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-[#1a1a1f] py-1 shadow-xl">
              <button className={itemClass} onClick={handleNewTab}>
                <span className="flex items-center gap-2">
                  <FilePlus2 size={13} /> New Tab
                </span>
                <span className="text-zinc-400">Ctrl+N</span>
              </button>
              <button className={itemClass} onClick={() => focusThen(handleSave)}>
                <span className="flex items-center gap-2">
                  <Save size={13} /> Save
                </span>
                <span className="text-zinc-400">Ctrl+S</span>
              </button>
            </div>
          )}
        </div>

        {/* Edit menu */}
        <div className="relative z-30">
          <button
            className={menuBtnClass("edit")}
            onClick={() => setOpenMenu((m) => (m === "edit" ? null : "edit"))}
          >
            Edit
          </button>
          {openMenu === "edit" && (
            <div className="absolute left-0 top-full z-30 mt-1 w-48 overflow-hidden rounded-lg border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-[#1a1a1f] py-1 shadow-xl">
              <button className={itemClass} onClick={handleCut}>
                <span className="flex items-center gap-2">
                  <Scissors size={13} /> Cut
                </span>
                <span className="text-zinc-400">Ctrl+X</span>
              </button>
              <button className={itemClass} onClick={handleCopy}>
                <span className="flex items-center gap-2">
                  <Copy size={13} /> Copy
                </span>
                <span className="text-zinc-400">Ctrl+C</span>
              </button>
              <button className={itemClass} onClick={handlePaste}>
                <span className="flex items-center gap-2">
                  <ClipboardPaste size={13} /> Paste
                </span>
                <span className="text-zinc-400">Ctrl+V</span>
              </button>
              <div className="my-1 border-t border-zinc-100 dark:border-white/[0.06]" />
              <button className={itemClass} onClick={handleSelectAll}>
                <span className="flex items-center gap-2">
                  <MousePointerSquareDashed size={13} /> Select All
                </span>
                <span className="text-zinc-400">Ctrl+A</span>
              </button>
            </div>
          )}
        </div>

        {/* View menu */}
        <div className="relative z-30">
          <button
            className={menuBtnClass("view")}
            onClick={() => setOpenMenu((m) => (m === "view" ? null : "view"))}
          >
            View
          </button>
          {openMenu === "view" && (
            <div className="absolute left-0 top-full z-30 mt-1 w-52 overflow-hidden rounded-lg border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-[#1a1a1f] py-1 shadow-xl">
              <button className={itemClass} onClick={toggleWordWrap}>
                <span className="flex items-center gap-2">
                  <WrapText size={13} /> Word Wrap
                </span>
                {wordWrap && <Check size={13} className="text-blue-500" />}
              </button>
              <div className="my-1 border-t border-zinc-100 dark:border-white/[0.06]" />
              <button className={itemClass} onClick={zoomIn}>
                <span className="flex items-center gap-2">
                  <ZoomIn size={13} /> Zoom In
                </span>
                <span className="text-zinc-400">Ctrl++</span>
              </button>
              <button className={itemClass} onClick={zoomOut}>
                <span className="flex items-center gap-2">
                  <ZoomOut size={13} /> Zoom Out
                </span>
                <span className="text-zinc-400">Ctrl+-</span>
              </button>
              <button className={itemClass} onClick={zoomReset}>
                <span className="flex items-center gap-2">
                  <RotateCcw size={13} /> Reset Zoom
                </span>
                <span className="text-zinc-400">Ctrl+0</span>
              </button>
            </div>
          )}
        </div>

        {/* Save button */}
        <button
          onClick={handleSave}
          className={`relative z-30 ml-auto flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium transition-all ${
            justSaved ? "bg-emerald-500 text-white" : "bg-blue-600 hover:bg-blue-700 text-white"
          }`}
        >
          {justSaved ? <Check size={13} /> : <Save size={13} />}
          {justSaved ? "Saved" : "Save"}
        </button>
      </div>

      {/* Tab strip */}
      <div className="flex items-center gap-1 overflow-x-auto border-b border-zinc-200/80 dark:border-white/[0.06] bg-zinc-100/60 dark:bg-white/[0.015] px-2 pt-1.5">
        {tabs.map((tab) => {
          const active = tab.id === activeId;
          const dirty = tab.content !== tab.savedContent;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveId(tab.id)}
              className={`group flex shrink-0 items-center gap-2 rounded-t-lg border border-b-0 px-3 py-1.5 text-xs font-medium transition-colors ${
                active
                  ? "border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-[#0e0e11] text-zinc-800 dark:text-zinc-100"
                  : "border-transparent text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200/50 dark:hover:bg-white/[0.04]"
              }`}
            >
              <FileText size={12} className="text-zinc-400" />
              {tab.name}
              {dirty ? (
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400" title="Unsaved changes" />
              ) : (
                <span className="h-1.5 w-1.5 rounded-full bg-transparent" />
              )}
              {tabs.length > 1 && (
                <span
                  onClick={(e) => closeTab(e, tab.id)}
                  className="ml-0.5 grid h-4 w-4 place-items-center rounded opacity-0 group-hover:opacity-100 hover:bg-zinc-200 dark:hover:bg-white/10 transition-opacity"
                  aria-label={`Close ${tab.name}`}
                >
                  <X size={11} />
                </span>
              )}
            </button>
          );
        })}
        <button
          onClick={handleNewTab}
          className="grid h-6 w-6 shrink-0 place-items-center rounded-md text-zinc-400 hover:bg-zinc-200/60 dark:hover:bg-white/[0.06] hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
          aria-label="New tab"
        >
          <Plus size={14} />
        </button>
      </div>

      {/* Editor */}
      <div className="relative flex-1 overflow-hidden">
        <textarea
          ref={textareaRef}
          value={activeTab.content}
          onChange={(e) => setActiveContent(e.target.value)}
          onSelect={updateCursor}
          onKeyUp={updateCursor}
          onClick={updateCursor}
          className="h-full w-full resize-none bg-transparent p-4 font-mono text-sm outline-none"
          style={{
            whiteSpace: wordWrap ? "pre-wrap" : "pre",
            overflowWrap: wordWrap ? "break-word" : "normal",
            overflowX: wordWrap ? "hidden" : "auto",
            fontSize: `${zoom}%`,
            lineHeight: 1.6,
          }}
          placeholder="Leave a message here..."
          spellCheck={false}
        />
      </div>

      {/* Status bar */}
      <div className="flex items-center gap-3 border-t border-zinc-200/80 dark:border-white/[0.06] bg-zinc-50/80 dark:bg-white/[0.02] px-3 py-1 text-[11px] text-zinc-500 dark:text-zinc-400">
        <span>
          Ln {cursor.line}, Col {cursor.col}
        </span>
        <span className="h-3 w-px bg-zinc-300 dark:bg-white/10" />
        <span>{wordCount} words</span>
        <span className="h-3 w-px bg-zinc-300 dark:bg-white/10" />
        <span>{charCount} characters</span>
        <span className="h-3 w-px bg-zinc-300 dark:bg-white/10" />
        <span>{wordWrap ? "Wrap On" : "Wrap Off"}</span>

        <div className="ml-auto flex items-center gap-2">
          <span>{isDirty ? "Unsaved" : "Saved"}</span>
          <span className="h-3 w-px bg-zinc-300 dark:bg-white/10" />
          <button
            onClick={() => setZoom((z) => Math.max(MIN_ZOOM, z - 10))}
            className="grid h-4 w-4 place-items-center rounded hover:bg-zinc-200 dark:hover:bg-white/10"
            aria-label="Zoom out"
          >
            <ZoomOut size={11} />
          </button>
          <button
            onClick={() => setZoom(100)}
            className="w-9 text-center tabular-nums hover:text-zinc-700 dark:hover:text-zinc-200"
            title="Reset zoom"
          >
            {zoom}%
          </button>
          <button
            onClick={() => setZoom((z) => Math.min(MAX_ZOOM, z + 10))}
            className="grid h-4 w-4 place-items-center rounded hover:bg-zinc-200 dark:hover:bg-white/10"
            aria-label="Zoom in"
          >
            <ZoomIn size={11} />
          </button>
        </div>
      </div>
    </div>
  );
}