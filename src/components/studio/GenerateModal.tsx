"use client";

import { useEffect } from "react";
import { X, Sparkles, Users, Box, GitBranch, Database, Workflow, Check } from "@/components/ui/Icons";

interface GenerateModalProps {
  onClose: () => void;
  onSubmit: (types: string[]) => void;
  prompt: string;
}

const DIAGRAM_OPTIONS = [
  { key: "class", label: "Class Diagram", Icon: Box, desc: "Entities, attributes, relationships" },
  { key: "sequence", label: "Sequence Diagram", Icon: GitBranch, desc: "Request/response flows between actors" },
  { key: "er", label: "ER Diagram", Icon: Database, desc: "Tables, columns, foreign keys" },
  { key: "flowchart", label: "Flowchart", Icon: Workflow, desc: "Decision trees and process flows" },
  { key: "usecase", label: "Use Case", Icon: Users, desc: "Actor-goal relationships" },
];

export default function GenerateModal({ onClose, onSubmit, prompt }: GenerateModalProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      className="absolute inset-0 z-[60] flex items-center justify-center animate-fade-in"
      style={{ background: "rgba(4,5,8,0.55)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="glass-strong w-full max-w-[520px] mx-4 max-h-[90vh] overflow-y-auto rounded-xl overflow-hidden"
        style={{ boxShadow: "0 1px 0 rgba(255,255,255,0.06) inset, 0 32px 80px rgba(0,0,0,0.6)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.2)" }}>
            <Sparkles size={16} className="text-accent-2" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-semibold">Generate Diagrams</h3>
            <p className="text-xs text-fg-mute mt-0.5">AI will analyze your prompt and create diagrams</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-md bg-transparent border-0 text-fg-mute cursor-pointer hover:text-fg-dim">
            <X size={16} />
          </button>
        </div>

        <div className="p-5">
          <div className="mb-4 p-3 rounded-lg bg-bg-2 border border-border">
            <div className="text-[10px] font-mono text-fg-mute tracking-wider uppercase mb-1.5">Prompt</div>
            <p className="text-sm text-fg-dim leading-relaxed line-clamp-3">
              {prompt || "No prompt entered yet"}
            </p>
          </div>

          <div className="text-xs text-fg-mute mb-2 font-medium">Generate all diagram types:</div>
          <div className="flex flex-col gap-1.5">
            {DIAGRAM_OPTIONS.map((d) => (
              <div
                key={d.key}
                className="flex items-center gap-3 p-2.5 rounded-lg bg-bg-2/50 border border-border cursor-default hover:border-border-strong transition-colors"
              >
                <d.Icon size={15} className="text-accent-2" />
                <div className="flex-1 min-w-0">
                  <div className="text-[12.5px] font-medium">{d.label}</div>
                  <div className="text-[11px] text-fg-mute">{d.desc}</div>
                </div>
                <Check size={14} className="text-good" />
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 px-4 sm:px-5 py-4 border-t border-border">
          <span className="text-xs text-fg-mute hidden sm:inline">5 diagrams will be generated</span>
          <span className="flex-1" />
          <button onClick={onClose} className="px-4 py-2 rounded-lg bg-bg-3 border border-border text-sm text-fg-dim cursor-pointer hover:text-fg">
            Cancel
          </button>
          <button
            onClick={() => onSubmit(DIAGRAM_OPTIONS.map((d) => d.key))}
            className="btn-blue px-5 py-2 rounded-lg text-sm font-medium border-0 cursor-pointer flex items-center gap-2"
          >
            <Sparkles size={13} /> Generate All
          </button>
        </div>
      </div>
    </div>
  );
}
