"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Folder, Plus, Trash, Check, X } from "@/components/ui/Icons";

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
  onDelete?: (id: string) => void;
  onRename?: (id: string, name: string) => void;
}

export default function ProjectExplorer({
  projects,
  activeId,
  onSelect,
  onNew,
  onCollapse,
  onDelete,
  onRename,
}: ProjectExplorerProps) {
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  function startRename(id: string, currentName: string) {
    setEditingId(id);
    setEditName(currentName);
  }

  function commitRename(id: string) {
    if (editName.trim() && onRename) {
      onRename(id, editName.trim());
    }
    setEditingId(null);
  }

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
          <span className="ml-auto text-[10px] text-fg-faint font-mono">{projects.length}</span>
        </div>
        {projects.map((p) => (
          <div key={p.id} className="group relative">
            {confirmDeleteId === p.id ? (
              <div className="flex items-center gap-1 pl-6 pr-2 py-1.5 rounded bg-bad/10 border border-bad/20 text-[11px]">
                <span className="text-bad flex-1 truncate">Delete &ldquo;{p.name}&rdquo;?</span>
                <button
                  onClick={() => { onDelete?.(p.id); setConfirmDeleteId(null); }}
                  className="px-1.5 py-0.5 rounded bg-bad text-white text-[10px] border-0 cursor-pointer font-medium"
                >
                  Yes
                </button>
                <button
                  onClick={() => setConfirmDeleteId(null)}
                  className="px-1.5 py-0.5 rounded bg-bg-3 text-fg-dim text-[10px] border border-border cursor-pointer"
                >
                  No
                </button>
              </div>
            ) : editingId === p.id ? (
              <div className="flex items-center gap-1 pl-6 pr-2 py-0.5">
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") commitRename(p.id);
                    if (e.key === "Escape") setEditingId(null);
                  }}
                  autoFocus
                  className="flex-1 min-w-0 px-1.5 py-0.5 rounded bg-bg-2 border border-accent text-fg text-[12px] outline-none"
                />
                <button
                  onClick={() => commitRename(p.id)}
                  className="p-0.5 bg-transparent border-0 text-good cursor-pointer"
                >
                  <Check size={12} />
                </button>
                <button
                  onClick={() => setEditingId(null)}
                  className="p-0.5 bg-transparent border-0 text-fg-mute cursor-pointer"
                >
                  <X size={12} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => onSelect(p.id)}
                onDoubleClick={() => startRename(p.id, p.name)}
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
                <span className="truncate flex-1">{p.name}</span>
                {onDelete && (
                  <span
                    onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(p.id); }}
                    className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-bad/20 text-fg-mute hover:text-bad transition-all cursor-pointer"
                    title="Delete project"
                  >
                    <Trash size={11} />
                  </span>
                )}
              </button>
            )}
          </div>
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
