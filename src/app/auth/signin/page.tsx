"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Logo, ArrowRight } from "@/components/ui/Icons";

export default function SignInPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
      name,
      mode,
    });

    setLoading(false);

    if (res?.error) {
      setError(res.error);
    } else {
      router.push("/studio");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full opacity-15"
          style={{
            background:
              "radial-gradient(ellipse, rgba(99,102,241,0.4) 0%, rgba(139,92,246,0.15) 50%, transparent 70%)",
          }}
        />
      </div>

      <div className="w-full max-w-sm relative">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 text-fg font-semibold mb-6">
            <Logo size={28} />
            <span className="text-xl">Schemata</span>
          </Link>
          <h1 className="text-2xl font-bold mb-1">
            {mode === "signin" ? "Welcome back" : "Create your account"}
          </h1>
          <p className="text-fg-mute text-sm">
            {mode === "signin"
              ? "Sign in to your account to continue"
              : "Get started with Schemata for free"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "signup" && (
            <div>
              <label className="block text-xs text-fg-mute mb-1.5 font-medium">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-bg-2 border border-border text-fg text-sm placeholder:text-fg-faint focus:outline-none focus:border-accent transition-colors"
                placeholder="Your name"
              />
            </div>
          )}
          <div>
            <label className="block text-xs text-fg-mute mb-1.5 font-medium">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-lg bg-bg-2 border border-border text-fg text-sm placeholder:text-fg-faint focus:outline-none focus:border-accent transition-colors"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-xs text-fg-mute mb-1.5 font-medium">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-3.5 py-2.5 rounded-lg bg-bg-2 border border-border text-fg text-sm placeholder:text-fg-faint focus:outline-none focus:border-accent transition-colors"
              placeholder="Min. 6 characters"
            />
          </div>

          {error && (
            <div className="text-sm text-bad bg-bad/10 border border-bad/20 rounded-lg px-3.5 py-2.5">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-blue px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? (
              <span className="ai-shimmer">Processing...</span>
            ) : (
              <>
                {mode === "signin" ? "Sign in" : "Create account"}
                <ArrowRight size={14} />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-sm text-fg-mute mt-6">
          {mode === "signin" ? (
            <>
              Don&apos;t have an account?{" "}
              <button onClick={() => { setMode("signup"); setError(""); }} className="text-accent-2 hover:underline">
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button onClick={() => { setMode("signin"); setError(""); }} className="text-accent-2 hover:underline">
                Sign in
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
