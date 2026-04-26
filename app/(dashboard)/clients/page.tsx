"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Client } from "@/types";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { EmptyState } from "@/components/ui/EmptyState";
import { Modal } from "@/components/ui/Modal";
import { Plus, Users, Search, MessageSquare, Trash2, ExternalLink } from "lucide-react";
import { getPlatformLabel, formatRelative } from "@/lib/utils";
import Link from "next/link";
import { ClientForm } from "@/components/clients/ClientForm";

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const supabase = createClient();

  async function loadClients() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from("clients")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setClients(data || []);
    setLoading(false);
  }

  useEffect(() => { loadClients(); }, []);

  const filtered = clients.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.company || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <PageHeader
        title="Clients"
        description={`${clients.length} client${clients.length !== 1 ? "s" : ""} total`}
        action={
          <Button onClick={() => setShowAdd(true)} size="sm">
            <Plus size={16} /> Add Client
          </Button>
        }
      />

      {/* Search */}
      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search clients..."
          className="w-full h-10 pl-9 pr-4 rounded-xl border border-border bg-white text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent"
        />
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-2xl shimmer" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No clients yet"
          description="Add your first client to start tracking projects and communication."
          action={{ label: "Add Client", onClick: () => setShowAdd(true) }}
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((client) => (
            <Link key={client.id} href={`/clients/${client.id}`}>
              <Card hover className="flex items-center gap-4">
                <Avatar name={client.name} size="md" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="font-medium text-text-primary text-sm truncate">{client.name}</p>
                    {client.tags?.includes("vip") && (
                      <Badge label="VIP" className="bg-amber-50 text-amber-700" />
                    )}
                  </div>
                  <p className="text-xs text-text-muted">
                    {client.company && `${client.company} · `}
                    {getPlatformLabel(client.platform)}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge label={client.platform} status="active" />
                  {client.tags?.filter((t) => t !== "vip").slice(0, 1).map((tag) => (
                    <Badge key={tag} label={tag} />
                  ))}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add Client">
        <ClientForm
          onSuccess={() => { setShowAdd(false); loadClients(); }}
          onCancel={() => setShowAdd(false)}
        />
      </Modal>
    </div>
  );
}
