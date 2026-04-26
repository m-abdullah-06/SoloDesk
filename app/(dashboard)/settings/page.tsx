"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { PageHeader } from "@/components/layout/PageHeader";
import { Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { useRouter } from "next/navigation";
import { LogOut, Save } from "lucide-react";

export default function SettingsPage() {
  const [profile, setProfile] = useState({ name: "", tagline: "", avatar_url: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("users").select("*").eq("id", user.id).single();
      if (data) setProfile({ name: data.name || "", tagline: data.tagline || "", avatar_url: data.avatar_url || "" });
      setLoading(false);
    }
    load();
  }, []);

  async function save() {
    setSaving(true);
    setError("");
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error: err } = await supabase.from("users").update({
      name: profile.name,
      tagline: profile.tagline,
      avatar_url: profile.avatar_url,
    }).eq("id", user.id);
    if (err) { setError(err.message); } else { setSaved(true); setTimeout(() => setSaved(false), 2000); }
    setSaving(false);
  }

  async function signOut() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  if (loading) return <div className="space-y-4">{[1, 2].map(i => <div key={i} className="h-28 rounded-2xl shimmer" />)}</div>;

  return (
    <div className="space-y-5 max-w-lg">
      <PageHeader title="Settings" />

      {/* Profile */}
      <Card>
        <h2 className="font-semibold text-text-primary mb-4">Your Profile</h2>
        <div className="flex items-center gap-4 mb-5">
          <Avatar name={profile.name || "User"} src={profile.avatar_url} size="xl" />
          <div className="flex-1">
            <p className="text-sm font-medium text-text-primary">{profile.name || "Your Name"}</p>
            <p className="text-xs text-text-muted">{profile.tagline || "No tagline set"}</p>
          </div>
        </div>
        <div className="space-y-3">
          <Input
            label="Full Name"
            value={profile.name}
            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
            placeholder="Muhammad Abdullah"
          />
          <Input
            label="Tagline"
            value={profile.tagline}
            onChange={(e) => setProfile({ ...profile, tagline: e.target.value })}
            placeholder="Freelance Web Developer based in Karachi"
            hint="Shown on your client portal. Max 120 characters."
          />
          <Input
            label="Avatar URL"
            value={profile.avatar_url}
            onChange={(e) => setProfile({ ...profile, avatar_url: e.target.value })}
            placeholder="https://..."
            hint="Paste a public image URL"
          />
          {error && <p className="text-sm text-danger">{error}</p>}
          <Button onClick={save} loading={saving} className="w-full">
            <Save size={16} />
            {saved ? "Saved!" : "Save Changes"}
          </Button>
        </div>
      </Card>

      {/* Danger Zone */}
      <Card className="border-danger/20">
        <h2 className="font-semibold text-text-primary mb-1">Account</h2>
        <p className="text-xs text-text-muted mb-4">Manage your account settings</p>
        <Button variant="danger" onClick={signOut} className="w-full">
          <LogOut size={16} /> Sign Out
        </Button>
      </Card>
    </div>
  );
}
