"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  Logo, Sparkles, ArrowRight, Zap, Shield, Code, Box, GitBranch, Database,
  Workflow, Users, Terminal, Globe,
} from "@/components/ui/Icons";

const FEATURES = [
  {
    icon: Sparkles,
    title: "AI-Powered Generation",
    desc: "Describe your system in plain English. Get production-ready UML diagrams in seconds.",
  },
  {
    icon: Code,
    title: "Multiple Formats",
    desc: "PlantUML, Mermaid, and native — export to PNG, SVG, or raw code for any tool.",
  },
  {
    icon: Zap,
    title: "5 Diagram Types",
    desc: "Class, Sequence, ER, Flowchart, and Use Case diagrams from a single prompt.",
  },
  {
    icon: Shield,
    title: "Version History",
    desc: "Every change is tracked. Branch, compare, and roll back across diagram versions.",
  },
  {
    icon: Users,
    title: "Real-time Collaboration",
    desc: "Share projects with your team. Edit together with live cursors and instant sync.",
  },
  {
    icon: Terminal,
    title: "Developer-First",
    desc: "Keyboard shortcuts, command palette, split views — built for the way developers work.",
  },
];

const DIAGRAM_TYPES = [
  { icon: Users, label: "Use Case", color: "#60a5fa" },
  { icon: Box, label: "Class", color: "#a78bfa" },
  { icon: GitBranch, label: "Sequence", color: "#34d399" },
  { icon: Database, label: "ER", color: "#fbbf24" },
  { icon: Workflow, label: "Flowchart", color: "#f87171" },
];

export default function LandingPage() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-bg">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-strong">
        <div className="max-w-6xl mx-auto flex items-center h-14 px-6 gap-8">
          <Link href="/" className="flex items-center gap-2.5 text-fg font-semibold">
            <Logo size={22} />
            <span>Schemata</span>
          </Link>
          <div className="flex-1" />
          <div className="hidden md:flex items-center gap-6 text-sm text-fg-dim">
            <a href="#features" className="hover:text-fg transition-colors">Features</a>
            <a href="#diagrams" className="hover:text-fg transition-colors">Diagrams</a>
            <a href="#pricing" className="hover:text-fg transition-colors">Pricing</a>
          </div>
          <div className="flex items-center gap-3">
            {session ? (
              <Link
                href="/studio"
                className="btn-blue px-4 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2"
              >
                Open Studio <ArrowRight size={14} />
              </Link>
            ) : (
              <>
                <Link href="/auth/signin" className="text-sm text-fg-dim hover:text-fg transition-colors">
                  Sign in
                </Link>
                <Link
                  href="/auth/signin"
                  className="btn-blue px-4 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2"
                >
                  Get started <ArrowRight size={14} />
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full opacity-20"
            style={{
              background: "radial-gradient(ellipse, rgba(99,102,241,0.3) 0%, rgba(139,92,246,0.1) 50%, transparent 70%)",
            }}
          />
          <div
            className="absolute top-40 left-1/4 w-[300px] h-[300px] rounded-full opacity-10"
            style={{
              background: "radial-gradient(circle, rgba(34,211,238,0.4) 0%, transparent 60%)",
            }}
          />
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass mb-8 text-sm text-fg-dim">
            <Sparkles size={14} className="text-accent-2" />
            <span>AI-powered system design — now in beta</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-[1.1]">
            <span className="text-fg">Diagrams from</span>
            <br />
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage: "linear-gradient(135deg, #818cf8 0%, #c084fc 40%, #22d3ee 100%)",
              }}
            >
              plain English
            </span>
          </h1>

          <p className="text-lg md:text-xl text-fg-dim max-w-2xl mx-auto mb-10 leading-relaxed">
            Describe your architecture, data model, or workflow in natural language.
            Schemata generates five production-ready UML diagrams instantly.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href={session ? "/studio" : "/auth/signin"}
              className="btn-blue px-8 py-3 rounded-xl text-base font-semibold flex items-center gap-2.5 shadow-lg shadow-accent/20"
            >
              <Sparkles size={16} />
              Start generating — free
            </Link>
            <a
              href="#features"
              className="px-8 py-3 rounded-xl text-base font-medium text-fg-dim border border-border hover:border-border-strong hover:text-fg transition-all"
            >
              See how it works
            </a>
          </div>

          {/* Hero preview card */}
          <div className="mt-16 relative">
            <div className="glass-strong rounded-2xl overflow-hidden shadow-2xl shadow-black/40 border border-border">
              <div className="flex items-center gap-2 px-4 h-10 border-b border-border">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                  <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                  <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
                </div>
                <span className="text-xs text-fg-mute ml-2 font-mono">schemata — studio</span>
              </div>
              <div className="p-6 dotgrid">
                <div className="bg-bg-1 rounded-lg p-4 border border-border mb-4">
                  <div className="flex items-center gap-2 text-xs text-fg-mute mb-2">
                    <Sparkles size={12} className="text-accent-2" />
                    <span className="font-mono tracking-wider">PROMPT</span>
                  </div>
                  <p className="text-sm text-fg-dim leading-relaxed">
                    An e-commerce checkout flow: users browse a catalog, add items to cart,
                    and pay via Stripe. Guests can buy, but only signed-in users track orders.
                  </p>
                </div>
                <div className="flex gap-3 flex-wrap">
                  {DIAGRAM_TYPES.map((d) => (
                    <div
                      key={d.label}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-bg-2 border border-border text-xs"
                    >
                      <d.icon size={13} style={{ color: d.color }} />
                      <span className="text-fg-dim">{d.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything you need to design systems
            </h2>
            <p className="text-fg-dim text-lg max-w-xl mx-auto">
              A complete workspace for architects, developers, and teams who think in diagrams.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f) => (
              <div key={f.title} className="card p-6 group">
                <div className="w-10 h-10 rounded-lg bg-accent-glow border border-accent/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <f.icon size={18} className="text-accent-2" />
                </div>
                <h3 className="text-base font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-fg-mute leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Diagram types */}
      <section id="diagrams" className="py-24 px-6 border-t border-border">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Five diagrams, one prompt</h2>
          <p className="text-fg-dim text-lg mb-12">
            Every perspective of your system, generated simultaneously.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {DIAGRAM_TYPES.map((d) => (
              <div
                key={d.label}
                className="card px-6 py-5 flex flex-col items-center gap-3 min-w-[140px] group cursor-default"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
                  style={{ background: `${d.color}15`, border: `1px solid ${d.color}30` }}
                >
                  <d.icon size={22} style={{ color: d.color }} />
                </div>
                <span className="text-sm font-medium">{d.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 border-t border-border">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to start designing?</h2>
          <p className="text-fg-dim text-lg mb-8">
            Join developers who are already generating system diagrams with AI.
          </p>
          <Link
            href={session ? "/studio" : "/auth/signin"}
            className="btn-blue inline-flex items-center gap-2.5 px-8 py-3 rounded-xl text-base font-semibold shadow-lg shadow-accent/20"
          >
            <Sparkles size={16} />
            Open Schemata
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-fg-mute">
          <div className="flex items-center gap-2">
            <Logo size={16} />
            <span>Schemata</span>
          </div>
          <div className="flex items-center gap-6">
            <Globe size={13} />
            <span>Built for developers, by developers.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
