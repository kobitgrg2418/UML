"use client";

import { useEffect, useRef } from "react";
import {
  Search, Sparkles, Refresh, Download, Share, Box, GitBranch,
  Database, Workflow, Settings, Moon, Users,
} from "@/components/ui/Icons";

interface CommandPaletteProps {
  onClose: () => void;
  onAction?: (action: string) => void;
}

const GROUPS = [
  {
    label: "Suggested",
    items: [
      { Icon: Sparkles, label: "Generate diagram from prompt", kbd: "⌘↵" },
      { Icon: Refresh, label: "Regenerate current diagram", kbd: "⌘R" },
      { Icon: Download, label: "Export as PNG", kbd: "⌘E" },
      { Icon: Share, label: "Share project...", kbd: "⌘⇧S" },
    ],
  },
  {
    label: "Navigate",
    items: [
      { Icon: Box, label: "Open Class diagram", kbd: "⌘1" },
      { Icon: GitBranch, label: "Open Sequence diagram", kbd: "⌘2" },
      { Icon: Database, label: "Open ER diagram", kbd: "⌘3" },
      { Icon: Workflow, label: "Open Flowchart", kbd: "⌘4" },
    ],
  },
  {
    label: "Settings",
    items: [
      { Icon: Settings, label: "Open settings", kbd: "⌘," },
      { Icon: Moon, label: "Toggle theme", kbd: "⌘⇧L" },
      { Icon: Users, label: "Manage collaborators...", kbd: "" },
    ],
  },
];

export default function CommandPalette({ onClose }: CommandPaletteProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      className="absolute inset-0 z-[60] flex items-start justify-center pt-24 animate-fade-in"
      style={{ background: "rgba(4,5,8,0.55)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="glass-strong w-full max-w-[580px] mx-4 max-h-[80vh] sm:max-h-[480px] rounded-xl overflow-hidden flex flex-col"
        style={{ boxShadow: "0 1px 0 rgba(255,255,255,0.06) inset, 0 32px 80px rgba(0,0,0,0.6)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2.5 px-3.5 py-3 border-b border-border">
          <Search size={14} className="text-fg-mute" />
          <input
            ref={inputRef}
            placeholder="Search commands, files, projects..."
            className="flex-1 bg-transparent border-0 outline-none text-fg text-sm"
          />
          <span className="kbd">esc</span>
        </div>
        <div className="flex-1 overflow-y-auto py-2">
          {GROUPS.map((g, gi) => (
            <div key={gi}>
              <div className="font-mono px-3.5 pt-2 pb-1 text-[10px] text-fg-faint tracking-wider uppercase">
                {g.label}
              </div>
              {g.items.map((it, ii) => (
                <div
                  key={ii}
                  className={`flex items-center gap-3 px-3.5 py-2 cursor-default ${
                    gi === 0 && ii === 0 ? "bg-bg-3 border-l-2 border-accent-2" : "border-l-2 border-transparent"
                  } hover:bg-bg-3`}
                >
                  <it.Icon size={14} className="text-fg-dim" />
                  <span className="text-[13px] text-fg">{it.label}</span>
                  <span className="flex-1" />
                  {it.kbd && <span className="kbd">{it.kbd}</span>}
                </div>
              ))}
            </div>
          ))}
        </div>
        <div className="flex items-center h-[30px] px-3 border-t border-border text-[10.5px] text-fg-mute font-mono gap-3.5">
          <span><span className="kbd h-3.5 text-[9px]">↑↓</span> navigate</span>
          <span><span className="kbd h-3.5 text-[9px]">↵</span> run</span>
          <span className="flex-1" />
          <span>12 results</span>
        </div>
      </div>
    </div>
  );
}
