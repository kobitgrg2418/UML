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

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/signin");
  }, [status, router]);

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

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCmdOpen(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

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
      setSaved(true);
    }
  }, [prompt, generating]);

  const handleSaveProject = useCallback(async () => {
    if (!prompt.trim()) return;
    setSaved(false);
    try {
      const diagramArray = Object.entries(diagrams).map(([type, code]) => ({
        type,
        code,
        label: type,
      }));
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
    } catch {
      // silent
    } finally {
      setSaved(true);
    }
  }, [prompt, diagrams]);

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
  }, [projects]);

  const handleCodeChange = useCallback((code: string) => {
    setDiagrams((prev) => ({ ...prev, [tab]: code }));
    setSaved(false);
    setTimeout(() => setSaved(true), 800);
  }, [tab]);

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
          />
          <div className="flex flex-1 min-h-0">
            {/* Left panel */}
            {!leftCollapsed && (
              <div className="w-[260px] shrink-0 bg-bg-1 border-r border-border min-h-0">
                <ProjectExplorer
                  projects={projects.map((p) => ({ id: p.id, name: p.name }))}
                  activeId={activeProjectId}
                  onSelect={handleSelectProject}
                  onNew={handleSaveProject}
                  onCollapse={() => setLeftCollapsed(true)}
                />
              </div>
            )}
            {leftCollapsed && (
              <button
                onClick={() => setLeftCollapsed(false)}
                className="w-[22px] h-auto rounded-none border-0 border-r border-border bg-transparent text-fg-mute cursor-pointer flex items-center justify-center hover:text-fg-dim"
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
                onChange={setPrompt}
                onGenerate={handleGenerate}
                generating={generating}
              />
              <TabRow
                tab={tab}
                setTab={setTab}
                showCode={showCode}
                setShowCode={setShowCode}
              />
              <div className="flex flex-col flex-1 min-h-0">
                <div className="flex flex-col flex-1 min-w-0 min-h-0">
                  <PreviewPanel
                    code={currentCode}
                    generating={generating}
                    diagramType={tab}
                  />
                </div>
                {showCode && currentCode && (
                  <div className="h-[220px] shrink-0">
                    <CodePanel
                      code={currentCode}
                      language="mermaid"
                      onClose={() => setShowCode(false)}
                      onCodeChange={handleCodeChange}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Right panel */}
            {!rightCollapsed && (
              <div className="w-[300px] shrink-0 border-l border-border min-h-0">
                <SuggestionPanel onCollapse={() => setRightCollapsed(true)} />
              </div>
            )}
            {rightCollapsed && (
              <button
                onClick={() => setRightCollapsed(false)}
                className="w-[22px] h-auto rounded-none border-0 border-l border-border bg-transparent text-fg-mute cursor-pointer flex items-center justify-center hover:text-fg-dim"
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
      <StatusBar saved={saved} diagramType={tab} />

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
    </div>
  );
}
