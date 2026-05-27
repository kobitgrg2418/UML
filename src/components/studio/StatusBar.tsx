"use client";

import { DiagramType } from "@/lib/generate";

interface StatusBarProps {
  saved: boolean;
  diagramType: DiagramType;
}

const TYPE_LANG: Record<string, string> = {
  usecase: "Mermaid",
  class: "Mermaid",
  sequence: "Mermaid",
  er: "Mermaid",
  flowchart: "Mermaid",
};

export default function StatusBar({ saved, diagramType }: StatusBarProps) {
  return (
    <div className="flex items-center h-[26px] px-3 border-t border-border bg-bg-1 text-[11px] text-fg-mute font-mono gap-3.5">
      <span className="flex items-center gap-1.5">
        <span
          className="w-1.5 h-1.5 rounded-full"
          style={{ background: saved ? "#34d399" : "#fbbf24" }}
        />
        {saved ? "All changes saved" : "Saving..."}
      </span>
      <span>·</span>
      <span>main</span>
      <span>·</span>
      <span>{diagramType}</span>
      <span>·</span>
      <span>UTF-8</span>
      <span>·</span>
      <span>{TYPE_LANG[diagramType] || "Mermaid"}</span>
      <span className="flex-1" />
      <span className="flex items-center gap-1">
        <span className="kbd h-3.5 text-[9px]">?</span> shortcuts
      </span>
    </div>
  );
}
