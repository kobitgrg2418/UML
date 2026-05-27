"use client";

import { Sparkles, Wand, FileText, Layers, ChevronDown } from "@/components/ui/Icons";

interface PromptBarProps {
  value: string;
  onChange: (v: string) => void;
  onGenerate: () => void;
  generating: boolean;
}

export default function PromptBar({ value, onChange, onGenerate, generating }: PromptBarProps) {
  return (
    <div className="border-b border-border bg-bg-1 p-4 flex flex-col gap-2.5">
      <div className="flex items-center gap-2 text-[11px] text-fg-mute">
        <Sparkles size={11} className="text-accent-2" />
        <span className="font-mono tracking-wider">PROMPT</span>
        <span className="flex-1" />
        <span className="font-mono">{value.length} / 4000</span>
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={2}
        placeholder="Describe your system architecture, data model, or workflow..."
        className="w-full resize-none bg-transparent border-0 outline-none text-fg text-sm leading-relaxed placeholder:text-fg-faint"
        onKeyDown={(e) => {
          if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
            e.preventDefault();
            onGenerate();
          }
        }}
      />
      <div className="flex items-center gap-1.5">
        <button className="chip text-xs"><Wand size={11} /> Refine</button>
        <button className="chip text-xs"><FileText size={11} /> Attach</button>
        <button className="chip text-xs"><Layers size={11} /> Template</button>
        <span className="flex-1" />
        <span className="font-mono text-[10.5px] text-fg-mute mr-2">
          <span className="kbd text-[9px]">⌘</span>{" "}
          <span className="kbd text-[9px]">↵</span> to generate
        </span>
        <button
          onClick={onGenerate}
          disabled={generating || !value.trim()}
          className={`flex items-center justify-center gap-1.5 min-w-[130px] px-4 py-1.5 rounded-lg text-sm font-medium border-0 cursor-pointer disabled:opacity-50 ${
            generating
              ? "bg-bg-3 text-fg-mute"
              : "btn-blue"
          }`}
        >
          {generating ? (
            <span className="ai-shimmer font-semibold">Generating...</span>
          ) : (
            <><Sparkles size={12} /> Generate</>
          )}
        </button>
      </div>
    </div>
  );
}
