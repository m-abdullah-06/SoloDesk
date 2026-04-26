"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Client, Project } from "@/types";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { ClientForm } from "@/components/clients/ClientForm";
import { getPlatformLabel, formatDate, formatCurrency } from "@/lib/utils";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Mail, Phone, Globe, Edit, Trash2, Sparkles, FolderKanban } from "lucide-react";
import Link from "next/link";

export default function ClientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [client, setClient] = useState<Client | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEdit, setShowEdit] = useState(false);
  const supabase = createClient();

  async function load() {
    const [{ data: c }, { data: p }] = await Promise.all([
      supabase.from("clients").select("*").eq("id", id).single(),
      supabase.from("projects").select("*, milestones(*)").eq("client_id", id).order("created_at", { ascending: false }),
    ]);
    setClient(c);
    setProjects(p || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, [id]);

  async function handleDelete() {
    if (!confirm("Delete this client? Their projects will remain.")) return;
    await supabase.from("clients").delete().eq("id", id);
    router.push("/clients");
  }

  if (loading) return (
    <div className="space-y-4">
      <div className="h-32 rounded-2xl shimmer" />
      <div className="h-48 rounded-2xl shimmer" />
    </div>
  );

  if (!client) return <div className="text-center py-16 text-text-muted">Client not found.</div>;

  const totalEarned = projects
    .filter((p) => p.payment_status === "paid")
    .reduce((sum, p) => sum + (p.budget || 0), 0);

  return (
    <div className="space-y-5">
      {/* Back */}
      <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-text-muted hover:text-text-primary transition-colors">
        <ArrowLeft size={16} /> Clients
      </button>

      {/* Profile Card */}
      <Card glow>
        <div className="flex items-start gap-4">
          <Avatar name={client.name} size="lg" />
          <div className="flex-1 min-w-0">
            <h1 className="font-display text-xl font-bold text-text-primary">{client.name}</h1>
            {client.company && <p className="text-sm text-text-muted">{client.company}</p>}
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <Badge label={getPlatformLabel(client.platform)} />
              {client.tags?.map((tag) => <Badge key={tag} label={tag} status="active" />)}
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowEdit(true)}>
              <Edit size={14} /> Edit
            </Button>
            <Button variant="ghost" size="sm" onClick={handleDelete}>
              <Trash2 size={14} className="text-danger" />
            </Button>
          </div>
        </div>

        {/* Contact */}
        <div className="mt-4 pt-4 border-t border-border grid grid-cols-1 md:grid-cols-3 gap-3">
          {client.email && (
            <a href={`mailto:${client.email}`} className="flex items-center gap-2 text-sm text-text-secondary hover:text-accent transition-colors">
              <Mail size={14} /> {client.email}
            </a>
          )}
          {client.whatsapp && (
            <a href={`https://wa.me/${client.whatsapp.replace(/[^0-9]/g, "")}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-text-secondary hover:text-accent transition-colors">
              <Phone size={14} /> {client.whatsapp}
            </a>
          )}
          {client.country && (
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <Globe size={14} /> {client.country}
            </div>
          )}
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Projects", value: projects.length },
          { label: "Active", value: projects.filter((p) => p.status === "active").length },
          { label: "Earned", value: totalEarned > 0 ? `Rs ${totalEarned.toLocaleString()}` : "—" },
        ].map((stat) => (
          <Card key={stat.label} className="text-center">
            <div className="text-xl font-bold text-text-primary">{stat.value}</div>
            <div className="text-xs text-text-muted mt-0.5">{stat.label}</div>
          </Card>
        ))}
      </div>

      {/* Quick actions */}
      <div className="flex gap-2">
        <Link href={`/ai?client_id=${client.id}`} className="flex-1">
          <Button variant="outline" className="w-full" size="sm">
            <Sparkles size={14} /> AI Message
          </Button>
        </Link>
        <Link href={`/projects?client_id=${client.id}`} className="flex-1">
          <Button variant="outline" className="w-full" size="sm">
            <FolderKanban size={14} /> New Project
          </Button>
        </Link>
      </div>

      {/* Notes */}
      {client.notes && (
        <Card>
          <h3 className="font-semibold text-text-primary text-sm mb-2">Private Notes</h3>
          <p className="text-sm text-text-secondary whitespace-pre-line">{client.notes}</p>
        </Card>
      )}

      {/* Projects */}
      <div>
        <h2 className="font-semibold text-text-primary mb-3">Projects</h2>
        {projects.length === 0 ? (
          <Card className="text-center py-8">
            <p className="text-sm text-text-muted">No projects with this client yet.</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {projects.map((p) => (
              <Link key={p.id} href={`/projects/${p.id}`}>
                <Card hover className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-text-primary text-sm">{p.name}</p>
                    <p className="text-xs text-text-muted mt-0.5">{formatDate(p.deadline)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {p.budget && (
                      <span className="text-xs font-medium text-accent">
                        {formatCurrency(p.budget, p.currency)}
                      </span>
                    )}
                    <Badge label={p.status} status={p.status} />
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>

      <Modal open={showEdit} onClose={() => setShowEdit(false)} title="Edit Client">
        <ClientForm
          client={client}
          onSuccess={() => { setShowEdit(false); load(); }}
          onCancel={() => setShowEdit(false)}
        />
      </Modal>
    </div>
  );
}
