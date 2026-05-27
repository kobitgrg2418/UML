"use client";

import { useState } from "react";
import { Code, Copy, Download, X, Check } from "@/components/ui/Icons";

interface CodePanelProps {
  code: string;
  language: string;
  onClose: () => void;
  onCodeChange: (code: string) => void;
}

export default function CodePanel({ code, language, onClose, onCodeChange }: CodePanelProps) {
  const [copied, setCopied] = useState(false);
  const [editing, setEditing] = useState(false);
  const lines = code.split("\n");

  function handleCopy() {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="border-t border-border bg-bg-1 flex flex-col h-full min-h-0">
      <div className="flex items-center h-8 px-3 border-b border-border/50 bg-bg-1 gap-2.5">
        <Code size={12} className="text-fg-mute" />
        <span className="text-xs text-fg">Code</span>
        <span className="chip h-[18px] text-[10px] px-1.5">
          {language === "mermaid" ? "Mermaid" : "PlantUML"}
        </span>
        <span className="flex-1" />
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 px-1.5 h-[22px] rounded bg-transparent border-0 text-fg-mute text-[11px] cursor-pointer hover:text-fg-dim"
        >
          {copied ? <Check size={11} className="text-good" /> : <Copy size={11} />}
          {copied ? "Copied" : "Copy"}
        </button>
        <button className="flex items-center px-1.5 h-[22px] rounded bg-transparent border-0 text-fg-mute cursor-pointer hover:text-fg-dim">
          <Download size={11} />
        </button>
        <button
          onClick={onClose}
          className="flex items-center px-1.5 h-[22px] rounded bg-transparent border-0 text-fg-mute cursor-pointer hover:text-fg-dim"
          title="Close"
        >
          <X size={11} />
        </button>
      </div>
      <div className="flex-1 overflow-auto min-h-0">
        {editing ? (
          <textarea
            value={code}
            onChange={(e) => onCodeChange(e.target.value)}
            className="w-full h-full p-3 bg-transparent border-0 outline-none text-fg font-mono text-xs leading-relaxed resize-none"
            spellCheck={false}
          />
        ) : (
          <div
            className="py-2.5 cursor-text"
            onClick={() => setEditing(true)}
            title="Click to edit"
          >
            <table className="border-collapse w-full">
              <tbody>
                {lines.map((line, i) => (
                  <tr key={i}>
                    <td className="w-11 text-right pr-3 pl-3.5 text-fg-faint select-none font-mono text-xs tabular-nums">
                      {i + 1}
                    </td>
                    <td className="pr-3.5 font-mono text-xs whitespace-pre text-fg-dim">{line}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
