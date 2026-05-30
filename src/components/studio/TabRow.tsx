"use client";

import { Users, Box, GitBranch, Database, Workflow, Code, Refresh } from "@/components/ui/Icons";
import { DiagramType } from "@/lib/generate";

interface TabRowProps {
  tab: DiagramType;
  setTab: (t: DiagramType) => void;
  showCode: boolean;
  setShowCode: (v: boolean) => void;
  drawMode: boolean;
  setDrawMode: (v: boolean) => void;
}

const TABS: { key: DiagramType; label: string; Icon: React.ComponentType<{ size?: number }> }[] = [
  { key: "usecase", label: "Use Case", Icon: Users },
  { key: "class", label: "Class", Icon: Box },
  { key: "sequence", label: "Sequence", Icon: GitBranch },
  { key: "er", label: "ER", Icon: Database },
  { key: "flowchart", label: "Flowchart", Icon: Workflow },
];

function PenIcon({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  );
}

export default function TabRow({ tab, setTab, showCode, setShowCode, drawMode, setDrawMode }: TabRowProps) {
  return (
    <div className="flex items-center border-b border-border bg-bg pr-2 overflow-x-auto scrollbar-hide">
      {TABS.map((t) => {
        const active = !drawMode && tab === t.key;
        return (
          <button
            key={t.key}
            onClick={() => { setTab(t.key); setDrawMode(false); }}
            className={`flex items-center gap-1.5 h-9 px-3.5 border-0 border-r border-border text-[12.5px] cursor-pointer relative transition-colors duration-100 shrink-0 whitespace-nowrap ${
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

      {/* separator */}
      <div className="w-px h-5 bg-border mx-1 shrink-0" />

      {/* Draw tab */}
      <button
        onClick={() => setDrawMode(true)}
        className={`flex items-center gap-1.5 h-9 px-3.5 border-0 text-[12.5px] cursor-pointer relative transition-colors duration-100 shrink-0 whitespace-nowrap ${
          drawMode
            ? "bg-bg-1 text-fg"
            : "bg-transparent text-fg-mute hover:text-fg-dim"
        }`}
      >
        <PenIcon size={13} /> Draw
        {drawMode && (
          <span className="absolute left-0 right-0 -top-px h-px bg-accent-2" />
        )}
      </button>

      <span className="flex-1" />
      {!drawMode && (
        <>
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
        </>
      )}
    </div>
  );
}
