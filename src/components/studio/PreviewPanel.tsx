"use client";

import { useState } from "react";
import { Eye } from "@/components/ui/Icons";
import MermaidRenderer from "@/components/diagrams/MermaidRenderer";

interface PreviewPanelProps {
  code: string;
  generating: boolean;
  diagramType: string;
}

export default function PreviewPanel({ code, generating, diagramType }: PreviewPanelProps) {
  const [zoom, setZoom] = useState(100);

  return (
    <div className="flex-1 relative bg-bg-1 overflow-hidden flex flex-col min-h-0 dotgrid">
      <div className="flex items-center gap-2.5 px-3 py-1.5 border-b border-border/50 bg-bg/50 text-[11.5px]">
        <Eye size={12} className="text-fg-mute" />
        <span className="text-fg-mute">Preview</span>
        <span className="font-mono text-fg-mute">· {diagramType}</span>
        <span className="flex-1" />
      </div>

      <div className="flex-1 p-5 flex items-center justify-center relative min-h-0 overflow-auto">
        {!generating && code && (
          <div
            className="w-full max-w-[880px] animate-fade-in"
            style={{ transform: `scale(${zoom / 100})`, transformOrigin: "center center" }}
          >
            <MermaidRenderer code={code} />
          </div>
        )}
        {!generating && !code && (
          <div className="text-center text-fg-mute">
            <p className="text-sm">Enter a prompt and click Generate to create diagrams</p>
          </div>
        )}
        {generating && <SkeletonLoader />}
      </div>

      {/* Zoom toolbar */}
      <div className="absolute right-4 bottom-4 flex bg-bg-2 border border-border rounded-md overflow-hidden">
        <button
          className="h-[26px] px-2 bg-transparent border-0 border-r border-border text-fg-mute text-sm cursor-pointer hover:bg-bg-3"
          onClick={() => setZoom(Math.max(40, zoom - 10))}
        >
          −
        </button>
        <span className="font-mono text-[11px] text-fg-dim self-center px-2.5 min-w-[44px] text-center">
          {zoom}%
        </span>
        <button
          className="h-[26px] px-2 bg-transparent border-0 border-l border-border text-fg-mute text-sm cursor-pointer hover:bg-bg-3"
          onClick={() => setZoom(Math.min(200, zoom + 10))}
        >
          +
        </button>
        <button
          className="h-[26px] px-2 bg-transparent border-0 border-l border-border text-fg-mute text-[10px] font-mono cursor-pointer hover:bg-bg-3"
          onClick={() => setZoom(100)}
        >
          FIT
        </button>
      </div>

      {/* Keyboard hint */}
      <div className="absolute left-4 bottom-4 flex items-center gap-1.5 px-2.5 py-1.5 bg-bg-2 border border-border rounded-md text-[10.5px] text-fg-mute">
        <span className="kbd text-[9px]">Space</span> pan
        <span className="text-fg-faint mx-1">·</span>
        <span className="kbd text-[9px]">⌘</span>
        <span className="kbd text-[9px]">+</span> zoom
      </div>
    </div>
  );
}

function SkeletonLoader() {
  return (
    <div className="flex flex-col items-center gap-3.5">
      <div className="w-[640px] max-w-[90%] flex flex-col gap-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex gap-3.5">
            {[0, 1, 2].map((j) => (
              <div
                key={j}
                className="flex-1 h-14 rounded-md animate-shimmer"
                style={{
                  background: "linear-gradient(90deg, #111116 0%, #18181e 50%, #111116 100%)",
                  backgroundSize: "200% 100%",
                  opacity: 0.7 - i * 0.18,
                }}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 mt-3">
        <div className="w-1.5 h-1.5 rounded-full bg-accent-2 animate-pulse" />
        <span className="ai-shimmer font-mono text-xs tracking-wider">ANALYZING ENTITIES...</span>
      </div>
    </div>
  );
}
