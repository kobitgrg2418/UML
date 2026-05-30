"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { DiagramType } from "@/lib/generate";
import ActivityBar from "@/components/studio/ActivityBar";
import TopBar from "@/components/studio/TopBar";
import PromptBar from "@/components/studio/PromptBar";
import TabRow from "@/components/studio/TabRow";
import PreviewPanel from "@/components/studio/PreviewPanel";
import CodePanel from "@/components/studio/CodePanel";
import ProjectExplorer from "@/components/studio/ProjectExplorer";
import SuggestionPanel from "@/components/studio/SuggestionPanel";
import StatusBar from "@/components/studio/StatusBar";
import CommandPalette from "@/components/studio/CommandPalette";
import GenerateModal from "@/components/studio/GenerateModal";
import ExportModal from "@/components/studio/ExportModal";
import ProfileSettingsModal from "@/components/studio/ProfileSettingsModal";
import DrawingCanvas from "@/components/studio/DrawingCanvas";
import {
  Logo, Sparkles, Folder, Grid, History, Users, Chat, Settings, X,
} from "@/components/ui/Icons";

interface ProjectData {
  id: string;
  name: string;
  prompt: string;
  diagrams: { id: string; type: string; code: string; label: string }[];
}

const SAMPLE_PROMPT = `An e-commerce checkout flow: users browse a catalog, add items to a cart, and pay via Stripe. Guests can buy, but only signed-in users can track orders or request refunds. Use webhooks to handle payment events.`;

export default function StudioPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [section, setSection] = useState("studio");
  const [tab, setTab] = useState<DiagramType>("class");
  const [prompt, setPrompt] = useState(SAMPLE_PROMPT);
  const [generating, setGenerating] = useState(false);
  const [showCode, setShowCode] = useState(true);
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(false);
  const [saved, setSaved] = useState(true);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [genOpen, setGenOpen] = useState(false);
  const [expOpen, setExpOpen] = useState(false);
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [diagrams, setDiagrams] = useState<Record<string, string>>({});
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [drawMode, setDrawMode] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/signin");
  }, [status, router]);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    if (mq.matches) {
      setLeftCollapsed(true);
      setRightCollapsed(true);
      setShowCode(false);
    }
    const handler = (e: MediaQueryListEvent) => {
      if (e.matches) {
        setLeftCollapsed(true);
        setRightCollapsed(true);
      }
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/projects")
        .then((r) => r.json())
        .then((data) => {
          if (Array.isArray(data)) setProjects(data);
        })
        .catch(() => {});
    }
  }, [status]);

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim() || generating) return;
    setGenerating(true);
    setSaved(false);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      if (data.diagrams) {
        const map: Record<string, string> = {};
        data.diagrams.forEach((d: { type: string; code: string }) => {
          map[d.type] = d.code;
        });
        setDiagrams(map);
      }
    } catch {
      // silent
    } finally {
      setGenerating(false);
    }
  }, [prompt, generating]);

  const handleSaveProject = useCallback(async () => {
    if (!prompt.trim()) return;
    setSaved(false);

    const diagramArray = Object.entries(diagrams).map(([type, code]) => ({
      type,
      code,
      label: type,
    }));

    try {
      if (activeProjectId) {
        const res = await fetch(`/api/projects/${activeProjectId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: projects.find((p) => p.id === activeProjectId)?.name || prompt.slice(0, 60).replace(/\n/g, " "),
            prompt,
            diagrams: diagramArray,
          }),
        });
        const updated = await res.json();
        setProjects((prev) =>
          prev.map((p) => (p.id === activeProjectId ? updated : p))
        );
      } else {
        const res = await fetch("/api/projects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: prompt.slice(0, 60).replace(/\n/g, " "),
            prompt,
            diagrams: diagramArray,
          }),
        });
        const project = await res.json();
        setProjects((prev) => [project, ...prev]);
        setActiveProjectId(project.id);
      }
    } catch {
      // silent
    } finally {
      setSaved(true);
    }
  }, [prompt, diagrams, activeProjectId, projects]);

  const handleDeleteProject = useCallback(async (id: string) => {
    try {
      await fetch(`/api/projects/${id}`, { method: "DELETE" });
      setProjects((prev) => prev.filter((p) => p.id !== id));
      if (activeProjectId === id) {
        setActiveProjectId(null);
        setPrompt(SAMPLE_PROMPT);
        setDiagrams({});
        setSaved(true);
      }
    } catch {
      // silent
    }
  }, [activeProjectId]);

  const handleRenameProject = useCallback(async (id: string, newName: string) => {
    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName }),
      });
      const updated = await res.json();
      setProjects((prev) =>
        prev.map((p) => (p.id === id ? { ...p, name: updated.name } : p))
      );
    } catch {
      // silent
    }
  }, []);

  const handleNewProject = useCallback(() => {
    setActiveProjectId(null);
    setPrompt("");
    setDiagrams({});
    setSaved(true);
  }, []);

  const handleSelectProject = useCallback((id: string) => {
    const project = projects.find((p) => p.id === id);
    if (!project) return;
    setActiveProjectId(id);
    setPrompt(project.prompt);
    const map: Record<string, string> = {};
    project.diagrams.forEach((d) => {
      map[d.type] = d.code;
    });
    setDiagrams(map);
    setSaved(true);
  }, [projects]);

  const handleCodeChange = useCallback((code: string) => {
    setDiagrams((prev) => ({ ...prev, [tab]: code }));
    setSaved(false);
  }, [tab]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCmdOpen(true);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        handleSaveProject();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleSaveProject]);

  const currentCode = diagrams[tab] || "";

  if (status === "loading") {
    return (
      <div className="h-screen flex items-center justify-center bg-bg">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-accent-2 animate-pulse" />
          <span className="text-fg-mute font-mono text-sm">Loading studio...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-bg relative">
      <div className="flex flex-1 min-h-0">
        <ActivityBar
          section={section}
          setSection={setSection}
          onHome={() => router.push("/")}
          onOpenSettings={() => setSettingsOpen(true)}
        />
        <div className="flex flex-col flex-1 min-w-0">
          <TopBar
            projectName={
              projects.find((p) => p.id === activeProjectId)?.name || "Untitled Project"
            }
            onOpenCmd={() => setCmdOpen(true)}
            onOpenGenerate={() => setGenOpen(true)}
            onOpenExport={() => setExpOpen(true)}
            saved={saved}
            onMobileMenu={() => setMobileMenuOpen(true)}
          />
          <div className="flex flex-1 min-h-0">
            {/* Left panel */}
            {!leftCollapsed && (
              <div className="hidden md:block w-[260px] shrink-0 bg-bg-1 border-r border-border min-h-0">
                <ProjectExplorer
                  projects={projects.map((p) => ({ id: p.id, name: p.name }))}
                  activeId={activeProjectId}
                  onSelect={handleSelectProject}
                  onNew={handleNewProject}
                  onCollapse={() => setLeftCollapsed(true)}
                  onDelete={handleDeleteProject}
                  onRename={handleRenameProject}
                />
              </div>
            )}
            {leftCollapsed && (
              <button
                onClick={() => setLeftCollapsed(false)}
                className="hidden md:flex w-[22px] h-auto rounded-none border-0 border-r border-border bg-transparent text-fg-mute cursor-pointer items-center justify-center hover:text-fg-dim"
                title="Show explorer"
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 6 15 12 9 18" />
                </svg>
              </button>
            )}

            {/* Center */}
            <div className="flex-1 flex flex-col min-w-0 min-h-0">
              <PromptBar
                value={prompt}
                onChange={(v) => { setPrompt(v); setSaved(false); }}
                onGenerate={handleGenerate}
                generating={generating}
                onSave={handleSaveProject}
                saved={saved}
                hasProject={!!activeProjectId}
              />
              <TabRow
                tab={tab}
                setTab={setTab}
                showCode={showCode}
                setShowCode={setShowCode}
                drawMode={drawMode}
                setDrawMode={setDrawMode}
              />
              <div className="flex flex-col flex-1 min-h-0">
                {drawMode ? (
                  <DrawingCanvas />
                ) : (
                  <>
                    <div className="flex flex-col flex-1 min-w-0 min-h-0">
                      <PreviewPanel
                        code={currentCode}
                        generating={generating}
                        diagramType={tab}
                      />
                    </div>
                    {showCode && currentCode && (
                      <div className="h-[160px] sm:h-[220px] shrink-0">
                        <CodePanel
                          code={currentCode}
                          language="mermaid"
                          onClose={() => setShowCode(false)}
                          onCodeChange={handleCodeChange}
                        />
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Right panel */}
            {!rightCollapsed && (
              <div className="hidden lg:block w-[300px] shrink-0 border-l border-border min-h-0">
                <SuggestionPanel onCollapse={() => setRightCollapsed(true)} />
              </div>
            )}
            {rightCollapsed && (
              <button
                onClick={() => setRightCollapsed(false)}
                className="hidden lg:flex w-[22px] h-auto rounded-none border-0 border-l border-border bg-transparent text-fg-mute cursor-pointer items-center justify-center hover:text-fg-dim"
                title="Show panel"
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ transform: "rotate(180deg)" }}>
                  <polyline points="9 6 15 12 9 18" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
      <StatusBar saved={saved} diagramType={tab} drawMode={drawMode} />

      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileMenuOpen(false)} />
          <div
            className="absolute left-0 top-0 bottom-0 w-72 bg-bg-1 border-r border-border flex flex-col"
            style={{ animation: "slideInLeft 200ms ease" }}
          >
            <div className="h-12 flex items-center justify-between px-4 border-b border-border">
              <div className="flex items-center gap-2 text-fg font-semibold">
                <Logo size={20} />
                <span className="text-sm">Schemata</span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-md bg-transparent border-0 text-fg-mute cursor-pointer hover:text-fg-dim"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-2 border-b border-border">
              {[
                { key: "studio", Icon: Sparkles, label: "Studio" },
                { key: "projects", Icon: Folder, label: "Projects" },
                { key: "templates", Icon: Grid, label: "Templates" },
                { key: "history", Icon: History, label: "History" },
                { key: "team", Icon: Users, label: "Team" },
              ].map((it) => (
                <button
                  key={it.key}
                  onClick={() => { setSection(it.key); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md border-0 text-sm cursor-pointer ${
                    it.key === section ? "bg-bg-3 text-fg" : "bg-transparent text-fg-dim hover:bg-bg-2"
                  }`}
                >
                  <it.Icon size={16} />
                  {it.label}
                </button>
              ))}
            </div>
            <div className="flex-1 overflow-y-auto min-h-0">
              <ProjectExplorer
                projects={projects.map((p) => ({ id: p.id, name: p.name }))}
                activeId={activeProjectId}
                onSelect={(id) => { handleSelectProject(id); setMobileMenuOpen(false); }}
                onNew={() => { handleNewProject(); setMobileMenuOpen(false); }}
                onCollapse={() => setMobileMenuOpen(false)}
                onDelete={handleDeleteProject}
                onRename={handleRenameProject}
              />
            </div>
            <div className="p-2 border-t border-border flex items-center gap-1">
              <button className="flex-1 flex items-center justify-center gap-2 py-2 rounded-md bg-transparent border-0 text-fg-mute text-xs cursor-pointer hover:text-fg-dim">
                <Chat size={14} /> Help
              </button>
              <button
                onClick={() => { setSettingsOpen(true); setMobileMenuOpen(false); }}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-md bg-transparent border-0 text-fg-mute text-xs cursor-pointer hover:text-fg-dim"
              >
                <Settings size={14} /> Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {cmdOpen && <CommandPalette onClose={() => setCmdOpen(false)} />}
      {genOpen && (
        <GenerateModal
          onClose={() => setGenOpen(false)}
          onSubmit={() => {
            setGenOpen(false);
            handleGenerate();
          }}
          prompt={prompt}
        />
      )}
      {expOpen && <ExportModal onClose={() => setExpOpen(false)} code={currentCode} />}
      {settingsOpen && <ProfileSettingsModal onClose={() => setSettingsOpen(false)} />}
    </div>
  );
}
