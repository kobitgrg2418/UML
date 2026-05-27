"use client";

import { Logo, Sparkles, Grid, History, Folder, Users, Chat, Settings } from "@/components/ui/Icons";

interface ActivityBarProps {
  section: string;
  setSection: (s: string) => void;
  onHome: () => void;
}

const NAV_ITEMS = [
  { key: "studio", Icon: Sparkles, label: "Studio" },
  { key: "projects", Icon: Folder, label: "Projects" },
  { key: "templates", Icon: Grid, label: "Templates" },
  { key: "history", Icon: History, label: "History" },
  { key: "team", Icon: Users, label: "Team" },
];

export default function ActivityBar({ section, setSection, onHome }: ActivityBarProps) {
  return (
    <div className="w-12 shrink-0 flex flex-col border-r border-border bg-bg-1">
      <div className="h-12 flex items-center justify-center border-b border-border">
        <button
          onClick={onHome}
          className="bg-transparent border-0 text-fg cursor-pointer p-0"
          title="Home"
        >
          <Logo size={20} />
        </button>
      </div>
      <div className="p-1.5 flex flex-col gap-0.5">
        {NAV_ITEMS.map((it) => {
          const active = it.key === section;
          return (
            <button
              key={it.key}
              title={it.label}
              onClick={() => setSection(it.key)}
              className={`h-9 rounded-md border-0 flex items-center justify-center cursor-pointer relative transition-all duration-100 ${
                active ? "bg-bg-3 text-fg" : "bg-transparent text-fg-mute hover:text-fg-dim"
              }`}
            >
              <it.Icon size={17} />
              {active && (
                <span className="absolute left-0 top-2 bottom-2 w-0.5 rounded-sm bg-accent-2" />
              )}
            </button>
          );
        })}
      </div>
      <div className="flex-1" />
      <div className="p-1.5 flex flex-col gap-0.5">
        <button
          title="Help"
          className="h-9 rounded-md border-0 bg-transparent text-fg-mute flex items-center justify-center cursor-pointer hover:text-fg-dim"
        >
          <Chat size={15} />
        </button>
        <button
          title="Settings"
          className="h-9 rounded-md border-0 bg-transparent text-fg-mute flex items-center justify-center cursor-pointer hover:text-fg-dim"
        >
          <Settings size={15} />
        </button>
        <div className="w-[30px] h-[30px] rounded-md mx-auto mt-2 mb-1 bg-gradient-to-br from-accent-2 to-c-purple text-[11px] font-semibold text-bg flex items-center justify-center">
          U
        </div>
      </div>
    </div>
  );
}
