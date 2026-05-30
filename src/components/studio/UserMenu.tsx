"use client";

import { useEffect, useRef } from "react";
import { signOut } from "next-auth/react";
import { User, Settings, LogOut } from "@/components/ui/Icons";

interface UserMenuProps {
  name: string;
  email: string;
  onClose: () => void;
  onOpenSettings: () => void;
}

export default function UserMenu({ name, email, onClose, onOpenSettings }: UserMenuProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [onClose]);

  const initial = (name || email || "U")[0].toUpperCase();

  return (
    <div
      ref={ref}
      className="absolute bottom-14 left-2 w-64 rounded-xl glass-strong shadow-2xl shadow-black/50 z-50 overflow-hidden"
      style={{ animation: "slideUp 150ms ease" }}
    >
      <div className="p-3 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-accent-2 to-c-purple text-sm font-semibold text-bg flex items-center justify-center shrink-0">
            {initial}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-fg truncate">{name || "User"}</p>
            <p className="text-xs text-fg-mute truncate">{email}</p>
          </div>
        </div>
      </div>

      <div className="p-1.5">
        <button
          onClick={() => { onOpenSettings(); onClose(); }}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg bg-transparent border-0 text-sm text-fg-dim cursor-pointer hover:bg-bg-3 hover:text-fg transition-colors"
        >
          <User size={15} />
          Profile & Settings
        </button>
        <button
          onClick={() => { onOpenSettings(); onClose(); }}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg bg-transparent border-0 text-sm text-fg-dim cursor-pointer hover:bg-bg-3 hover:text-fg transition-colors"
        >
          <Settings size={15} />
          Preferences
        </button>
      </div>

      <div className="p-1.5 border-t border-border">
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg bg-transparent border-0 text-sm text-bad/80 cursor-pointer hover:bg-bad/10 hover:text-bad transition-colors"
        >
          <LogOut size={15} />
          Sign out
        </button>
      </div>
    </div>
  );
}
