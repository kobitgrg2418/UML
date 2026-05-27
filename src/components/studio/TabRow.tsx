"use client";

import { Users, Box, GitBranch, Database, Workflow, Code, Layers, Refresh } from "@/components/ui/Icons";
import { DiagramType } from "@/lib/generate";

interface TabRowProps {
  tab: DiagramType;
  setTab: (t: DiagramType) => void;
  showCode: boolean;
  setShowCode: (v: boolean) => void;
}

const TABS: { key: DiagramType; label: string; Icon: React.ComponentType<{ size?: number }> }[] = [
  { key: "usecase", label: "Use Case", Icon: Users },
  { key: "class", label: "Class", Icon: Box },
  { key: "sequence", label: "Sequence", Icon: GitBranch },
  { key: "er", label: "ER", Icon: Database },
  { key: "flowchart", label: "Flowchart", Icon: Workflow },
];

export default function TabRow({ tab, setTab, showCode, setShowCode }: TabRowProps) {
  return (
    <div className="flex items-center border-b border-border bg-bg pr-2">
      {TABS.map((t) => {
        const active = tab === t.key;
        return (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 h-9 px-3.5 border-0 border-r border-border text-[12.5px] cursor-pointer relative transition-colors duration-100 ${
              active ? "bg-bg-1 text-fg" : "bg-transparent text-fg-mute hover:text-fg-dim"
            }`}
            style={{ borderRight: "1px solid rgba(255,255,255,0.06)" }}
          >
            <t.Icon size={13} /> {t.label}
            {active && (
              <span className="absolute left-0 right-0 -top-px h-px bg-accent-2" />
            )}
          </button>
        );
      })}
      <span className="flex-1" />
      <button
        onClick={() => setShowCode(!showCode)}
        className={`p-1.5 rounded-md bg-transparent border-0 cursor-pointer transition-colors ${
          showCode ? "text-fg" : "text-fg-mute hover:text-fg-dim"
        }`}
        title="Toggle code panel"
      >
        <Code size={12} />
      </button>
      <button className="p-1.5 rounded-md bg-transparent border-0 text-fg-mute cursor-pointer hover:text-fg-dim" title="Refresh">
        <Refresh size={12} />
      </button>
    </div>
  );
}
