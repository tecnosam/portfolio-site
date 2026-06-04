"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function LoginForm() {
  const searchParams = useSearchParams();
  const isUnauthorized = searchParams.get("error") === "unauthorized";

  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(isUnauthorized ? "Access denied for that email." : "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { error: err } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/admin/auth/callback` },
    });
    if (err) setError(err.message);
    else setSent(true);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-neutral flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        {/* Wordmark */}
        <div className="mb-10 text-center">
          <span className="font-mono text-3xl font-bold text-neutral-content tracking-tight">
            SA<span className="text-primary">.</span>
          </span>
          <p className="text-neutral-content/40 text-xs mt-2 tracking-widest uppercase">Admin</p>
        </div>

        <div className="bg-neutral-content/5 border border-neutral-content/10 rounded-2xl p-8 backdrop-blur-sm">
          {sent ? (
            <div className="text-center space-y-4">
              <div className="size-12 rounded-full bg-primary/15 flex items-center justify-center mx-auto">
                <svg className="size-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-neutral-content font-semibold text-sm">Check your inbox</p>
                <p className="text-neutral-content/50 text-xs mt-1">Magic link sent to <span className="text-neutral-content/80">{email}</span></p>
              </div>
              <button onClick={() => { setSent(false); setEmail(""); }} className="text-xs text-neutral-content/40 hover:text-neutral-content/70 transition-colors">
                Use a different email
              </button>
            </div>
          ) : (
            <>
              <p className="text-neutral-content/60 text-sm mb-6 leading-relaxed">
                Enter your email to receive a one-time login link. Access is restricted.
              </p>
              <form onSubmit={handleSubmit} className="space-y-3">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  className="w-full bg-neutral-content/8 border border-neutral-content/15 rounded-lg px-4 py-3 text-sm text-neutral-content placeholder:text-neutral-content/25 focus:outline-none focus:border-primary/60 focus:bg-primary/5 transition-all"
                />
                {error && (
                  <p className="text-xs text-error">{error}</p>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-content rounded-lg py-3 text-sm font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {loading ? (
                    <span className="size-4 border-2 border-primary-content/30 border-t-primary-content rounded-full animate-spin" />
                  ) : "Send magic link"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
