"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignupPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleSignup() {
    if (!form.name || !form.email || !form.password) { setError("Please fill in all fields"); return; }
    if (form.password.length < 6) { setError("Password must be at least 6 characters"); return; }
    setLoading(true);
    setError("");

    const { error: err } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { 
        data: { name: form.name },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (err) { setError(err.message); setLoading(false); return; }
    // Auto sign in after signup
    const { error: loginErr } = await supabase.auth.signInWithPassword({ email: form.email, password: form.password });
    if (!loginErr) { router.push("/dashboard"); return; }
    setSuccess(true);
    setLoading(false);
  }

  if (success) return (
    <div className="min-h-screen bg-hero-gradient flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl border border-border p-8 text-center max-w-sm w-full">
        <div className="w-14 h-14 rounded-2xl bg-accent-light flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">✉️</span>
        </div>
        <h2 className="font-display text-xl font-bold text-text-primary mb-2">Check your email</h2>
        <p className="text-sm text-text-muted">We sent a confirmation link to <strong>{form.email}</strong>. Click it to activate your account.</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-hero-gradient flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-2xl bg-accent flex items-center justify-center shadow-orange">
            <span className="text-white font-bold text-lg">S</span>
          </div>
          <span className="font-display text-2xl font-bold text-text-primary">SoloDesk</span>
        </div>

        <div className="bg-white rounded-2xl shadow-card border border-border p-6">
          <h1 className="font-display text-xl font-bold text-text-primary mb-1">Create your workspace</h1>
          <p className="text-sm text-text-muted mb-5">Free forever. No credit card needed.</p>

          <div className="space-y-3">
            <Input
              label="Your Name"
              placeholder="Muhammad Abdullah"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <Input
              label="Password"
              type="password"
              placeholder="Min. 6 characters"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            {error && <p className="text-sm text-danger">{error}</p>}
            <Button onClick={handleSignup} loading={loading} className="w-full" size="lg">
              Create Account
            </Button>
          </div>

          <p className="text-center text-sm text-text-muted mt-4">
            Already have an account?{" "}
            <Link href="/login" className="text-accent font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
