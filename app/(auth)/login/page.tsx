"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const supabase = createClient();

  async function handleLogin() {
    if (!email || !password) { setError("Please fill in all fields"); return; }
    setLoading(true);
    setError("");
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    if (err) { setError(err.message); setLoading(false); return; }
    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen bg-hero-gradient flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-2xl bg-accent flex items-center justify-center shadow-orange">
            <span className="text-white font-bold text-lg">S</span>
          </div>
          <span className="font-display text-2xl font-bold text-text-primary">SoloDesk</span>
        </div>

        <div className="bg-white rounded-2xl shadow-card border border-border p-6">
          <h1 className="font-display text-xl font-bold text-text-primary mb-1">Welcome back</h1>
          <p className="text-sm text-text-muted mb-5">Sign in to your workspace</p>

          <div className="space-y-3">
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {error && <p className="text-sm text-danger">{error}</p>}
            <Button onClick={handleLogin} loading={loading} className="w-full" size="lg">
              Sign In
            </Button>
          </div>

          <p className="text-center text-sm text-text-muted mt-4">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-accent font-medium hover:underline">
              Sign up free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
