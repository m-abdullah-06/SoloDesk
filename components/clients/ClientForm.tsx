"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Input, Select, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Tag } from "@/components/ui/Badge";
import { Client } from "@/types";

const PLATFORM_OPTIONS = [
  { value: "upwork", label: "Upwork" },
  { value: "fiverr", label: "Fiverr" },
  { value: "local", label: "Local" },
  { value: "direct", label: "Direct" },
  { value: "other", label: "Other" },
];

const TAG_OPTIONS = ["active", "repeat", "vip", "difficult", "prospect"];

interface ClientFormProps {
  client?: Client;
  onSuccess: () => void;
  onCancel: () => void;
}

export function ClientForm({ client, onSuccess, onCancel }: ClientFormProps) {
  const [form, setForm] = useState({
    name: client?.name || "",
    company: client?.company || "",
    email: client?.email || "",
    whatsapp: client?.whatsapp || "",
    platform: client?.platform || "direct",
    country: client?.country || "",
    notes: client?.notes || "",
  });
  const [tags, setTags] = useState<string[]>(client?.tags || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const supabase = createClient();

  function toggleTag(tag: string) {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }

  async function handleSubmit() {
    if (!form.name.trim()) { setError("Name is required"); return; }
    setLoading(true);
    setError("");
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const payload = { ...form, tags, user_id: user.id };

    if (client) {
      const { error: err } = await supabase.from("clients").update(payload).eq("id", client.id);
      if (err) { setError(err.message); setLoading(false); return; }
    } else {
      const { error: err } = await supabase.from("clients").insert(payload);
      if (err) { setError(err.message); setLoading(false); return; }
    }
    onSuccess();
  }

  return (
    <div className="space-y-4">
      <Input
        label="Full Name *"
        placeholder="Ahmed Khan"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
      />
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Company"
          placeholder="Acme Corp"
          value={form.company}
          onChange={(e) => setForm({ ...form, company: e.target.value })}
        />
        <Select
          label="Platform"
          value={form.platform}
          onChange={(v) => setForm({ ...form, platform: v as Client["platform"] })}
          options={PLATFORM_OPTIONS}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Email"
          type="email"
          placeholder="ahmed@example.com"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <Input
          label="WhatsApp"
          placeholder="+92 300 1234567"
          value={form.whatsapp}
          onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
        />
      </div>
      <Input
        label="Country"
        placeholder="Pakistan"
        value={form.country}
        onChange={(e) => setForm({ ...form, country: e.target.value })}
      />
      <div>
        <p className="text-sm font-medium text-foreground mb-2">Tags</p>
        <div className="flex gap-2 flex-wrap">
          {TAG_OPTIONS.map((tag) => (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-all capitalize ${
                tags.includes(tag)
                  ? "bg-accent text-white border-accent"
                  : "bg-background text-muted-foreground border-border hover:border-accent"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
      <Textarea
        label="Notes (private)"
        placeholder="Internal notes about this client..."
        value={form.notes}
        onChange={(e) => setForm({ ...form, notes: e.target.value })}
        rows={3}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="flex gap-3 pt-2">
        <Button variant="outline" onClick={onCancel} className="flex-1">Cancel</Button>
        <Button onClick={handleSubmit} loading={loading} className="flex-1">
          {client ? "Update Client" : "Add Client"}
        </Button>
      </div>
    </div>
  );
}
