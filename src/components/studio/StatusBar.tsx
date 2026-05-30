"use client";

import { DiagramType } from "@/lib/generate";

interface StatusBarProps {
  saved: boolean;
  diagramType: DiagramType;
  drawMode?: boolean;
}

const TYPE_LANG: Record<string, string> = {
  usecase: "Mermaid",
  class: "Mermaid",
  sequence: "Mermaid",
  er: "Mermaid",
  flowchart: "Mermaid",
};

export default function StatusBar({ saved, diagramType, drawMode }: StatusBarProps) {
  return (
    <div className="flex items-center h-[26px] px-2 sm:px-3 border-t border-border bg-bg-1 text-[11px] text-fg-mute font-mono gap-2 sm:gap-3.5">
      <span className="flex items-center gap-1.5">
        <span
          className="w-1.5 h-1.5 rounded-full"
          style={{ background: saved ? "#34d399" : "#fbbf24" }}
        />
        <span className="hidden sm:inline">{saved ? "All changes saved" : "Saving..."}</span>
        <span className="sm:hidden">{saved ? "Saved" : "..."}</span>
      </span>
      <span className="hidden sm:inline">·</span>
      <span className="hidden sm:inline">main</span>
      <span>·</span>
      <span>{drawMode ? "draw" : diagramType}</span>
      <span className="hidden md:inline">·</span>
      <span className="hidden md:inline">UTF-8</span>
      <span className="hidden md:inline">·</span>
      <span className="hidden md:inline">{drawMode ? "SVG Canvas" : (TYPE_LANG[diagramType] || "Mermaid")}</span>
      <span className="flex-1" />
      <span className="hidden sm:flex items-center gap-1">
        <span className="kbd h-3.5 text-[9px]">?</span> shortcuts
      </span>
    </div>
  );
}
