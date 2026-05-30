"use client";

import { useEffect } from "react";
import { X, Download, FileText, Code, Globe } from "@/components/ui/Icons";

interface ExportModalProps {
  onClose: () => void;
  code: string;
}

const FORMATS = [
  { key: "png", label: "PNG Image", desc: "High-res raster, perfect for docs", Icon: Download },
  { key: "svg", label: "SVG Vector", desc: "Scalable, ideal for web embedding", Icon: Globe },
  { key: "mermaid", label: "Mermaid Code", desc: "Raw .mmd source file", Icon: Code },
  { key: "md", label: "Markdown", desc: "Embed code block in .md file", Icon: FileText },
];

export default function ExportModal({ onClose, code }: ExportModalProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  function handleExport(format: string) {
    const blob = new Blob([code], { type: "text/plain" });
    const ext = format === "mermaid" ? "mmd" : format;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `diagram.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
    onClose();
  }

  return (
    <div
      className="absolute inset-0 z-[60] flex items-center justify-center animate-fade-in"
      style={{ background: "rgba(4,5,8,0.55)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="glass-strong w-full max-w-[440px] mx-4 max-h-[90vh] overflow-y-auto rounded-xl overflow-hidden"
        style={{ boxShadow: "0 1px 0 rgba(255,255,255,0.06) inset, 0 32px 80px rgba(0,0,0,0.6)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
          <Download size={18} className="text-fg" />
          <div className="flex-1">
            <h3 className="text-base font-semibold">Export Diagram</h3>
            <p className="text-xs text-fg-mute mt-0.5">Choose a format for your diagram</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-md bg-transparent border-0 text-fg-mute cursor-pointer hover:text-fg-dim">
            <X size={16} />
          </button>
        </div>

        <div className="p-5 flex flex-col gap-2">
          {FORMATS.map((f) => (
            <button
              key={f.key}
              onClick={() => handleExport(f.key)}
              className="flex items-center gap-3.5 p-3.5 rounded-lg bg-bg-2/50 border border-border cursor-pointer hover:border-border-strong hover:bg-bg-3 transition-all text-left w-full"
            >
              <div className="w-9 h-9 rounded-lg bg-bg-3 border border-border flex items-center justify-center shrink-0">
                <f.Icon size={16} className="text-fg-dim" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-medium text-fg">{f.label}</div>
                <div className="text-[11.5px] text-fg-mute">{f.desc}</div>
              </div>
              <span className="text-xs text-fg-faint">.{f.key === "mermaid" ? "mmd" : f.key}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
