"use client";

import { Search, Sparkles, Download, Share, Bell, ChevronDown } from "@/components/ui/Icons";

interface TopBarProps {
  projectName: string;
  onOpenCmd: () => void;
  onOpenGenerate: () => void;
  onOpenExport: () => void;
  saved: boolean;
}

export default function TopBar({ projectName, onOpenCmd, onOpenGenerate, onOpenExport, saved }: TopBarProps) {
  return (
    <div className="h-12 flex items-center gap-3 px-3.5 border-b border-border bg-bg">
      <div className="flex items-center gap-2 text-[13px] min-w-0">
        <button className="flex items-center gap-1.5 px-1.5 h-6 rounded bg-transparent border-0 text-fg-dim cursor-pointer hover:text-fg">
          <div className="w-4 h-4 rounded bg-gradient-to-br from-accent to-c-purple" />
          <span className="text-fg-dim">workspace</span>
          <ChevronDown size={11} className="text-fg-mute" />
        </button>
        <span className="text-fg-faint">/</span>
        <span className="text-fg font-medium truncate">{projectName}</span>
        <span className="chip h-[18px] text-[10px] px-1.5 ml-1">
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: saved ? "var(--tw-colors-good, #34d399)" : "#fbbf24" }}
          />
          {saved ? "Saved" : "Saving..."}
        </span>
      </div>

      <span className="flex-1" />

      <button
        onClick={onOpenCmd}
        className="flex items-center gap-2 w-64 h-8 px-3 rounded-lg bg-bg-1 border border-border text-fg-mute text-sm cursor-pointer hover:border-border-strong transition-colors"
      >
        <Search size={12} />
        <span className="flex-1 text-left">Search commands...</span>
        <span className="kbd">⌘K</span>
      </button>

      <div className="w-px h-[18px] bg-border" />

      <button onClick={onOpenGenerate} className="btn-blue flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border-0 cursor-pointer">
        <Sparkles size={12} /> Generate
      </button>
      <button onClick={onOpenExport} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-fg-dim bg-bg-2 border border-border cursor-pointer hover:text-fg hover:border-border-strong transition-colors">
        <Download size={12} /> Export
      </button>
      <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-fg-dim bg-bg-2 border border-border cursor-pointer hover:text-fg hover:border-border-strong transition-colors">
        <Share size={12} /> Share
      </button>

      <div className="w-px h-[18px] bg-border" />

      <button className="p-1.5 rounded-md bg-transparent border-0 text-fg-mute cursor-pointer hover:text-fg-dim">
        <Bell size={14} />
      </button>
    </div>
  );
}
