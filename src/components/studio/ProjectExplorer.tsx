"use client";

import { ChevronDown, ChevronRight, Folder, Plus } from "@/components/ui/Icons";

interface ProjectItem {
  id: string;
  name: string;
}

interface ProjectExplorerProps {
  projects: ProjectItem[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onCollapse: () => void;
}

export default function ProjectExplorer({
  projects,
  activeId,
  onSelect,
  onNew,
  onCollapse,
}: ProjectExplorerProps) {
  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Header */}
      <div className="h-8 flex items-center gap-1.5 px-2.5 border-b border-border/50 text-[11px] font-mono tracking-wider uppercase text-fg-mute">
        <span>Explorer</span>
        <span className="flex-1" />
        <button
          onClick={onNew}
          className="flex items-center justify-center h-[22px] px-1.5 rounded bg-transparent border-0 text-fg-mute cursor-pointer hover:text-fg-dim"
          title="New project"
        >
          <Plus size={12} />
        </button>
        <button
          onClick={onCollapse}
          className="flex items-center justify-center h-[22px] px-1 rounded bg-transparent border-0 text-fg-mute cursor-pointer hover:text-fg-dim"
          title="Collapse"
        >
          <ChevronRight size={11} style={{ transform: "rotate(180deg)" }} />
        </button>
      </div>

      {/* Project list */}
      <div className="flex-1 overflow-y-auto p-1.5">
        <div className="flex items-center gap-1.5 px-1.5 py-1 text-fg-dim text-[12.5px] cursor-default">
          <ChevronDown size={11} className="text-fg-mute" />
          <Folder size={12} className="text-fg-mute" />
          <span>My Projects</span>
        </div>
        {projects.map((p) => (
          <button
            key={p.id}
            onClick={() => onSelect(p.id)}
            className={`w-full flex items-center gap-1.5 pl-6 pr-2 py-1 rounded text-[12.5px] border-0 cursor-pointer text-left relative transition-colors ${
              p.id === activeId ? "bg-bg-3 text-fg" : "bg-transparent text-fg-dim hover:bg-bg-2"
            }`}
          >
            {p.id === activeId && (
              <span className="absolute left-0 top-1 bottom-1 w-0.5 rounded-sm bg-accent-2" />
            )}
            <span className="font-mono text-[9.5px] px-1 py-px rounded bg-bg-3 border border-border text-c-purple tracking-wide">
              UML
            </span>
            <span className="truncate">{p.name}</span>
          </button>
        ))}
        {projects.length === 0 && (
          <div className="text-center text-fg-faint text-xs py-8">
            No projects yet.
            <br />
            <button onClick={onNew} className="text-accent-2 bg-transparent border-0 cursor-pointer mt-1 hover:underline">
              Create one
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
