"use client";

import { useEffect, useRef, useState } from "react";

interface MermaidRendererProps {
  code: string;
  className?: string;
}

export default function MermaidRenderer({ code, className = "" }: MermaidRendererProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function render() {
      if (!ref.current || !code.trim()) return;
      setLoading(true);
      setError(null);

      try {
        const mermaid = (await import("mermaid")).default;
        mermaid.initialize({
          startOnLoad: false,
          theme: "dark",
          themeVariables: {
            darkMode: true,
            background: "#111116",
            primaryColor: "#6366f1",
            primaryTextColor: "#f4f4f5",
            primaryBorderColor: "#3f3f46",
            lineColor: "#71717a",
            secondaryColor: "#18181e",
            tertiaryColor: "#1e1e26",
            fontFamily: "Geist, system-ui, sans-serif",
            fontSize: "13px",
          },
          flowchart: { curve: "basis", padding: 12 },
          sequence: { mirrorActors: false },
        });

        const id = `mermaid-${Date.now()}`;
        const { svg } = await mermaid.render(id, code);

        if (!cancelled && ref.current) {
          ref.current.innerHTML = svg;
          const svgEl = ref.current.querySelector("svg");
          if (svgEl) {
            svgEl.style.maxWidth = "100%";
            svgEl.style.height = "auto";
          }
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to render diagram");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    render();
    return () => { cancelled = true; };
  }, [code]);

  if (!code.trim()) {
    return (
      <div className={`flex items-center justify-center text-fg-mute text-sm ${className}`}>
        No diagram code to render
      </div>
    );
  }

  return (
    <div className={className}>
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-accent-2 animate-pulse" />
            <span className="text-sm text-fg-mute font-mono">Rendering...</span>
          </div>
        </div>
      )}
      {error && (
        <div className="p-4 rounded-lg bg-bad/10 border border-bad/20 text-sm text-bad">
          <p className="font-medium mb-1">Render error</p>
          <p className="font-mono text-xs opacity-75">{error}</p>
        </div>
      )}
      <div ref={ref} className={loading ? "opacity-0 h-0 overflow-hidden" : "animate-fade-in"} />
    </div>
  );
}
