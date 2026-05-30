"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  X, User, Key, Palette, Mail, Calendar, Folder, Save, Check,
} from "@/components/ui/Icons";

type Tab = "profile" | "security" | "preferences";

interface ProfileSettingsModalProps {
  onClose: () => void;
  initialTab?: Tab;
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  _count: { projects: number };
}

export default function ProfileSettingsModal({ onClose, initialTab = "profile" }: ProfileSettingsModalProps) {
  const { update } = useSession();
  const [tab, setTab] = useState<Tab>(initialTab);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const [curPass, setCurPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [passMsg, setPassMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [passLoading, setPassLoading] = useState(false);

  const [prefs, setPrefs] = useState({
    autoSave: true,
    fontSize: 14,
    defaultDiagram: "class",
    showMinimap: false,
  });

  useEffect(() => {
    const saved = localStorage.getItem("schemata-prefs");
    if (saved) {
      try { setPrefs(JSON.parse(saved)); } catch {}
    }
  }, []);

  useEffect(() => {
    fetch("/api/user/profile")
      .then((r) => r.json())
      .then((data) => {
        setProfile(data);
        setName(data.name || "");
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleSaveProfile() {
    setSaving(true);
    setProfileMsg(null);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Failed to update");
      }
      const updated = await res.json();
      setProfile((p) => p ? { ...p, name: updated.name } : p);
      setProfileMsg({ type: "ok", text: "Profile updated" });
      await update({ name: updated.name });
    } catch (e: unknown) {
      setProfileMsg({ type: "err", text: e instanceof Error ? e.message : "Failed to update" });
    } finally {
      setSaving(false);
    }
  }

  async function handleChangePassword() {
    setPassMsg(null);
    if (newPass.length < 6) {
      setPassMsg({ type: "err", text: "Password must be at least 6 characters" });
      return;
    }
    if (newPass !== confirmPass) {
      setPassMsg({ type: "err", text: "Passwords do not match" });
      return;
    }
    setPassLoading(true);
    try {
      const res = await fetch("/api/user/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: curPass, newPassword: newPass }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Failed to change password");
      }
      setPassMsg({ type: "ok", text: "Password changed successfully" });
      setCurPass("");
      setNewPass("");
      setConfirmPass("");
    } catch (e: unknown) {
      setPassMsg({ type: "err", text: e instanceof Error ? e.message : "Failed" });
    } finally {
      setPassLoading(false);
    }
  }

  function handleSavePrefs() {
    localStorage.setItem("schemata-prefs", JSON.stringify(prefs));
    setProfileMsg({ type: "ok", text: "Preferences saved" });
  }

  const tabs: { key: Tab; label: string; Icon: typeof User }[] = [
    { key: "profile", label: "Profile", Icon: User },
    { key: "security", label: "Security", Icon: Key },
    { key: "preferences", label: "Preferences", Icon: Palette },
  ];

  const initial = (profile?.name || profile?.email || "U")[0].toUpperCase();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div
        className="relative w-full max-w-2xl max-h-[85vh] rounded-2xl glass-strong shadow-2xl shadow-black/50 flex flex-col overflow-hidden"
        style={{ animation: "slideUp 200ms ease" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-lg font-semibold text-fg">Settings</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md bg-transparent border-0 text-fg-mute cursor-pointer hover:text-fg-dim hover:bg-bg-3 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-1 min-h-0">
          {/* Sidebar */}
          <div className="w-48 shrink-0 border-r border-border p-2 hidden sm:block">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => { setTab(t.key); setProfileMsg(null); setPassMsg(null); }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg border-0 text-sm cursor-pointer transition-colors ${
                  tab === t.key
                    ? "bg-bg-3 text-fg"
                    : "bg-transparent text-fg-mute hover:text-fg-dim hover:bg-bg-2"
                }`}
              >
                <t.Icon size={15} />
                {t.label}
              </button>
            ))}
          </div>

          {/* Mobile tabs */}
          <div className="sm:hidden border-b border-border flex">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => { setTab(t.key); setProfileMsg(null); setPassMsg(null); }}
                className={`flex-1 py-2.5 text-xs border-0 cursor-pointer transition-colors ${
                  tab === t.key
                    ? "bg-bg-3 text-fg border-b-2 border-b-accent"
                    : "bg-transparent text-fg-mute"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-2 h-2 rounded-full bg-accent-2 animate-pulse" />
                <span className="ml-3 text-fg-mute text-sm">Loading...</span>
              </div>
            ) : tab === "profile" ? (
              <div className="space-y-6">
                {/* Avatar & info */}
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-2 to-c-purple text-2xl font-bold text-bg flex items-center justify-center">
                    {initial}
                  </div>
                  <div>
                    <p className="text-fg font-semibold text-lg">{profile?.name || "User"}</p>
                    <p className="text-fg-mute text-sm">{profile?.email}</p>
                  </div>
                </div>

                {/* Name field */}
                <div>
                  <label className="block text-xs text-fg-mute mb-1.5 font-medium">Display Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-bg-2 border border-border text-fg text-sm placeholder:text-fg-faint focus:outline-none focus:border-accent transition-colors"
                    placeholder="Your name"
                  />
                </div>

                {/* Email (read-only) */}
                <div>
                  <label className="block text-xs text-fg-mute mb-1.5 font-medium">Email</label>
                  <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-lg bg-bg-2 border border-border text-fg-dim text-sm">
                    <Mail size={14} className="text-fg-faint shrink-0" />
                    {profile?.email}
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="px-3.5 py-3 rounded-lg bg-bg-2 border border-border">
                    <div className="flex items-center gap-2 text-fg-mute text-xs mb-1">
                      <Calendar size={12} />
                      Member since
                    </div>
                    <p className="text-fg text-sm font-medium">
                      {profile?.createdAt
                        ? new Date(profile.createdAt).toLocaleDateString("en-US", {
                            month: "long",
                            year: "numeric",
                          })
                        : "—"}
                    </p>
                  </div>
                  <div className="px-3.5 py-3 rounded-lg bg-bg-2 border border-border">
                    <div className="flex items-center gap-2 text-fg-mute text-xs mb-1">
                      <Folder size={12} />
                      Projects
                    </div>
                    <p className="text-fg text-sm font-medium">{profile?._count?.projects ?? 0}</p>
                  </div>
                </div>

                {profileMsg && (
                  <div
                    className={`text-sm px-3.5 py-2.5 rounded-lg border ${
                      profileMsg.type === "ok"
                        ? "text-good bg-good/10 border-good/20"
                        : "text-bad bg-bad/10 border-bad/20"
                    }`}
                  >
                    {profileMsg.text}
                  </div>
                )}

                <button
                  onClick={handleSaveProfile}
                  disabled={saving || name === profile?.name}
                  className="btn-blue flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border-0 cursor-pointer disabled:opacity-50"
                >
                  {saving ? (
                    <span className="ai-shimmer">Saving...</span>
                  ) : (
                    <>
                      <Save size={14} />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            ) : tab === "security" ? (
              <div className="space-y-6">
                <div>
                  <h3 className="text-fg font-semibold mb-1">Change Password</h3>
                  <p className="text-fg-mute text-sm">Update your password to keep your account secure.</p>
                </div>

                <div>
                  <label className="block text-xs text-fg-mute mb-1.5 font-medium">Current Password</label>
                  <input
                    type="password"
                    value={curPass}
                    onChange={(e) => setCurPass(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-bg-2 border border-border text-fg text-sm placeholder:text-fg-faint focus:outline-none focus:border-accent transition-colors"
                    placeholder="Enter current password"
                  />
                </div>

                <div>
                  <label className="block text-xs text-fg-mute mb-1.5 font-medium">New Password</label>
                  <input
                    type="password"
                    value={newPass}
                    onChange={(e) => setNewPass(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-bg-2 border border-border text-fg text-sm placeholder:text-fg-faint focus:outline-none focus:border-accent transition-colors"
                    placeholder="Min. 6 characters"
                  />
                </div>

                <div>
                  <label className="block text-xs text-fg-mute mb-1.5 font-medium">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPass}
                    onChange={(e) => setConfirmPass(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-bg-2 border border-border text-fg text-sm placeholder:text-fg-faint focus:outline-none focus:border-accent transition-colors"
                    placeholder="Repeat new password"
                  />
                </div>

                {passMsg && (
                  <div
                    className={`text-sm px-3.5 py-2.5 rounded-lg border ${
                      passMsg.type === "ok"
                        ? "text-good bg-good/10 border-good/20"
                        : "text-bad bg-bad/10 border-bad/20"
                    }`}
                  >
                    {passMsg.text}
                  </div>
                )}

                <button
                  onClick={handleChangePassword}
                  disabled={passLoading || !curPass || !newPass || !confirmPass}
                  className="btn-blue flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border-0 cursor-pointer disabled:opacity-50"
                >
                  {passLoading ? (
                    <span className="ai-shimmer">Updating...</span>
                  ) : (
                    <>
                      <Key size={14} />
                      Update Password
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <h3 className="text-fg font-semibold mb-1">Preferences</h3>
                  <p className="text-fg-mute text-sm">Customize your studio experience.</p>
                </div>

                {/* Auto-save */}
                <div className="flex items-center justify-between py-3 border-b border-border">
                  <div>
                    <p className="text-sm text-fg font-medium">Auto-save</p>
                    <p className="text-xs text-fg-mute mt-0.5">Automatically save projects while editing</p>
                  </div>
                  <button
                    onClick={() => setPrefs((p) => ({ ...p, autoSave: !p.autoSave }))}
                    className={`w-10 h-[22px] rounded-full border-0 cursor-pointer transition-colors relative ${
                      prefs.autoSave ? "bg-accent" : "bg-bg-4"
                    }`}
                  >
                    <span
                      className={`absolute top-[3px] w-4 h-4 rounded-full bg-white transition-transform ${
                        prefs.autoSave ? "left-[22px]" : "left-[3px]"
                      }`}
                    />
                  </button>
                </div>

                {/* Editor font size */}
                <div className="flex items-center justify-between py-3 border-b border-border">
                  <div>
                    <p className="text-sm text-fg font-medium">Editor Font Size</p>
                    <p className="text-xs text-fg-mute mt-0.5">Font size for the code editor</p>
                  </div>
                  <select
                    value={prefs.fontSize}
                    onChange={(e) => setPrefs((p) => ({ ...p, fontSize: Number(e.target.value) }))}
                    className="px-2.5 py-1.5 rounded-lg bg-bg-2 border border-border text-fg text-sm focus:outline-none focus:border-accent cursor-pointer"
                  >
                    {[12, 13, 14, 15, 16, 18].map((s) => (
                      <option key={s} value={s}>
                        {s}px
                      </option>
                    ))}
                  </select>
                </div>

                {/* Default diagram */}
                <div className="flex items-center justify-between py-3 border-b border-border">
                  <div>
                    <p className="text-sm text-fg font-medium">Default Diagram</p>
                    <p className="text-xs text-fg-mute mt-0.5">Default diagram type for new projects</p>
                  </div>
                  <select
                    value={prefs.defaultDiagram}
                    onChange={(e) => setPrefs((p) => ({ ...p, defaultDiagram: e.target.value }))}
                    className="px-2.5 py-1.5 rounded-lg bg-bg-2 border border-border text-fg text-sm focus:outline-none focus:border-accent cursor-pointer"
                  >
                    {["class", "sequence", "erd", "flowchart", "state", "mindmap"].map((t) => (
                      <option key={t} value={t}>
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Show minimap */}
                <div className="flex items-center justify-between py-3 border-b border-border">
                  <div>
                    <p className="text-sm text-fg font-medium">Show Minimap</p>
                    <p className="text-xs text-fg-mute mt-0.5">Show a minimap in the code editor</p>
                  </div>
                  <button
                    onClick={() => setPrefs((p) => ({ ...p, showMinimap: !p.showMinimap }))}
                    className={`w-10 h-[22px] rounded-full border-0 cursor-pointer transition-colors relative ${
                      prefs.showMinimap ? "bg-accent" : "bg-bg-4"
                    }`}
                  >
                    <span
                      className={`absolute top-[3px] w-4 h-4 rounded-full bg-white transition-transform ${
                        prefs.showMinimap ? "left-[22px]" : "left-[3px]"
                      }`}
                    />
                  </button>
                </div>

                {profileMsg && (
                  <div
                    className={`text-sm px-3.5 py-2.5 rounded-lg border ${
                      profileMsg.type === "ok"
                        ? "text-good bg-good/10 border-good/20"
                        : "text-bad bg-bad/10 border-bad/20"
                    }`}
                  >
                    {profileMsg.text}
                  </div>
                )}

                <button
                  onClick={handleSavePrefs}
                  className="btn-blue flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border-0 cursor-pointer"
                >
                  <Check size={14} />
                  Save Preferences
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
