"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Proposal } from "@/types";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Modal } from "@/components/ui/Modal";
import { ProposalForm } from "@/components/proposals/ProposalForm";
import { Plus, FileText, Copy, Check, ExternalLink } from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/utils";
import Link from "next/link";

export default function ProposalsPage() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const supabase = createClient();

  async function load() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from("proposals")
      .select("*, client:clients(name)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setProposals(data || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function copyLink(token: string, id: string) {
    navigator.clipboard.writeText(`${window.location.origin}/proposal/${token}`);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  return (
    <div>
      <PageHeader
        title="Proposals"
        description={`${proposals.length} total`}
        action={
          <Button onClick={() => setShowAdd(true)} size="sm">
            <Plus size={16} /> New Proposal
          </Button>
        }
      />

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map(i => <div key={i} className="h-28 rounded-2xl shimmer" />)}
        </div>
      ) : proposals.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No proposals yet"
          description="Create a professional proposal and share it as a link. Clients can accept directly."
          action={{ label: "New Proposal", onClick: () => setShowAdd(true) }}
        />
      ) : (
        <div className="space-y-3">
          {proposals.map((p) => (
            <Card key={p.id} hover>
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-text-primary truncate">{p.title}</p>
                  <p className="text-xs text-text-muted mt-0.5">
                    {(p as any).client?.name || "No client"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {p.total_amount > 0 && (
                    <span className="text-sm font-bold text-accent">
                      {formatCurrency(p.total_amount, p.currency)}
                    </span>
                  )}
                  <Badge label={p.status} status={p.status} />
                </div>
              </div>

              {p.valid_until && (
                <p className="text-xs text-text-muted mb-3">Valid until {formatDate(p.valid_until)}</p>
              )}

              <div className="flex gap-2">
                {p.status !== "draft" && (
                  <Button size="sm" variant="ghost" onClick={() => copyLink(p.portal_token, p.id)}>
                    {copiedId === p.id ? <Check size={13} className="text-success" /> : <Copy size={13} />}
                    {copiedId === p.id ? "Copied!" : "Share"}
                  </Button>
                )}
                <Link href={`/proposals/${p.id}`}>
                  <Button size="sm" variant="outline">
                    <ExternalLink size={13} /> View
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="New Proposal" size="lg">
        <ProposalForm
          onSuccess={() => { setShowAdd(false); load(); }}
          onCancel={() => setShowAdd(false)}
        />
      </Modal>
    </div>
  );
}
