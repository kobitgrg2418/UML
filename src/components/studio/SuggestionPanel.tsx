"use client";

import { useState } from "react";
import { Sparkles, Layers, Share, ChevronRight, Copy, Globe, Lock } from "@/components/ui/Icons";

interface SuggestionPanelProps {
  onCollapse: () => void;
}

const SUGGESTIONS = [
  {
    kind: "fix" as const,
    title: "Add error path for failed payments",
    body: "Webhooks for payment_intent.failed aren't represented.",
    confidence: 92,
  },
  {
    kind: "extend" as const,
    title: "Extract Cart as own aggregate",
    body: "Order is doing too much. Splitting Cart enables guest carts.",
    confidence: 78,
  },
  {
    kind: "polish" as const,
    title: "Rename Customer → Buyer",
    body: "Domain glossary prefers Buyer; aligns with billing service.",
    confidence: 64,
  },
  {
    kind: "data" as const,
    title: "Add idempotency_key to payments",
    body: "Stripe retries can double-charge without it.",
    confidence: 88,
  },
];

const KIND_COLORS: Record<string, string> = {
  fix: "#f87171",
  extend: "#818cf8",
  polish: "#fbbf24",
  data: "#34d399",
};

export default function SuggestionPanel({ onCollapse }: SuggestionPanelProps) {
  const [tab, setTab] = useState("suggest");

  return (
    <div className="flex flex-col h-full min-h-0 bg-bg-1">
      <div className="flex items-center h-8 px-1 pl-3 border-b border-border">
        {[
          { k: "suggest", label: "Suggestions", Icon: Sparkles, count: 4 },
          { k: "outline", label: "Outline", Icon: Layers },
          { k: "share", label: "Share", Icon: Share },
        ].map((t) => (
          <button
            key={t.k}
            onClick={() => setTab(t.k)}
            className={`flex items-center gap-1.5 px-2 h-[30px] bg-transparent border-0 text-[11.5px] cursor-pointer relative ${
              tab === t.k ? "text-fg" : "text-fg-mute"
            }`}
          >
            <t.Icon size={11} /> {t.label}
            {t.count != null && (
              <span className="font-mono text-[10px] text-fg-faint">{t.count}</span>
            )}
            {tab === t.k && (
              <span className="absolute left-1.5 right-1.5 -bottom-px h-px bg-accent-2" />
            )}
          </button>
        ))}
        <span className="flex-1" />
        <button
          onClick={onCollapse}
          className="flex items-center justify-center h-[22px] px-1 rounded bg-transparent border-0 text-fg-mute cursor-pointer hover:text-fg-dim"
        >
          <ChevronRight size={11} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2.5">
        {tab === "suggest" && (
          <div className="flex flex-col gap-1.5">
            {SUGGESTIONS.map((s, i) => (
              <div key={i} className="card p-2.5">
                <div className="flex items-center gap-2 mb-1.5">
                  <span
                    className="w-[5px] h-[5px] rounded-full"
                    style={{ background: KIND_COLORS[s.kind] }}
                  />
                  <span className="font-mono text-[9.5px] text-fg-mute tracking-wider uppercase">
                    {s.kind}
                  </span>
                  <span className="flex-1" />
                  <span className="font-mono text-[10px] text-fg-mute">{s.confidence}%</span>
                </div>
                <div className="text-[12.5px] font-medium mb-1 leading-snug">{s.title}</div>
                <div className="text-[11.5px] text-fg-mute leading-relaxed">{s.body}</div>
                <div className="flex items-center gap-1 mt-2">
                  <button className="px-2 py-0.5 rounded bg-bg-3 border border-border text-[11px] text-fg-dim cursor-pointer hover:text-fg">
                    Apply
                  </button>
                  <button className="px-2 py-0.5 rounded bg-transparent border-0 text-[11px] text-fg-mute cursor-pointer hover:text-fg-dim">
                    Dismiss
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        {tab === "share" && (
          <div className="pt-2">
            <div className="flex items-center px-2.5 py-1.5 bg-bg-2 border border-border rounded">
              <span className="flex-1 font-mono text-[11px] text-fg-dim truncate">
                schemata.dev/s/share-link
              </span>
              <button className="ml-2 p-1 bg-transparent border-0 text-fg-mute cursor-pointer">
                <Copy size={11} />
              </button>
            </div>
            <div className="flex gap-1.5 mt-2">
              <button className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded bg-bg-2 border border-border text-xs text-fg-dim cursor-pointer hover:text-fg">
                <Globe size={11} /> Public
              </button>
              <button className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded bg-bg-2 border border-border text-xs text-fg-dim cursor-pointer hover:text-fg">
                <Lock size={11} /> Invite
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
