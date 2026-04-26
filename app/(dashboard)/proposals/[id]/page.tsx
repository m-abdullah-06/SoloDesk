"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatDate, formatCurrency } from "@/lib/utils";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Copy, Check, Send } from "lucide-react";

export default function ProposalDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [proposal, setProposal] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("proposals")
        .select("*, client:clients(name)")
        .eq("id", id)
        .single();
      setProposal(data);
      setLoading(false);
    }
    load();
  }, [id]);

  async function updateStatus(status: string) {
    await supabase.from("proposals").update({ status }).eq("id", id);
    setProposal({ ...proposal, status });
  }

  function copyLink() {
    navigator.clipboard.writeText(`${window.location.origin}/proposal/${proposal.portal_token}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading) return <div className="h-64 rounded-2xl shimmer" />;
  if (!proposal) return <div className="text-center py-16 text-text-muted">Proposal not found.</div>;

  const currSymbol = proposal.currency === "PKR" ? "Rs" : proposal.currency === "USD" ? "$" : "£";

  return (
    <div className="space-y-5">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-text-muted hover:text-text-primary">
        <ArrowLeft size={16} /> Proposals
      </button>

      <Card glow>
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="font-display text-xl font-bold text-text-primary">{proposal.title}</h1>
            <p className="text-sm text-text-muted mt-0.5">{proposal.client?.name}</p>
          </div>
          <Badge label={proposal.status} status={proposal.status} />
        </div>

        {proposal.overview && (
          <div className="mb-4 p-3.5 bg-bg-elevated rounded-xl">
            <p className="text-sm text-text-secondary leading-relaxed">{proposal.overview}</p>
          </div>
        )}

        {/* Scope */}
        {proposal.scope_items?.length > 0 && (
          <div className="mb-5">
            <h3 className="font-semibold text-text-primary text-sm mb-2">Scope of Work</h3>
            <div className="space-y-2">
              {proposal.scope_items.map((item: any, i: number) => (
                <div key={i} className="flex gap-3 p-3 bg-white border border-border rounded-xl">
                  <div className="w-5 h-5 rounded-full bg-accent-light flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check size={11} className="text-accent" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-primary">{item.title}</p>
                    {item.description && <p className="text-xs text-text-muted mt-0.5">{item.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Timeline */}
        {proposal.timeline_items?.length > 0 && (
          <div className="mb-5">
            <h3 className="font-semibold text-text-primary text-sm mb-2">Timeline</h3>
            <div className="space-y-1.5">
              {proposal.timeline_items.map((item: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-3 bg-white border border-border rounded-xl text-sm">
                  <span className="text-text-primary">{item.milestone}</span>
                  <span className="text-text-muted text-xs">{item.duration}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pricing */}
        {proposal.pricing_items?.length > 0 && (
          <div className="mb-5">
            <h3 className="font-semibold text-text-primary text-sm mb-2">Investment</h3>
            <div className="border border-border rounded-xl overflow-hidden">
              {proposal.pricing_items.map((item: any, i: number) => (
                <div key={i} className={`flex items-center justify-between p-3 text-sm ${i > 0 ? "border-t border-border" : ""}`}>
                  <span className="text-text-secondary">{item.description}</span>
                  <span className="font-medium text-text-primary">{currSymbol} {parseFloat(item.amount).toLocaleString()}</span>
                </div>
              ))}
              <div className="flex items-center justify-between p-3 border-t border-border bg-bg-elevated">
                <span className="font-semibold text-text-primary">Total</span>
                <span className="font-bold text-accent text-base">{currSymbol} {proposal.total_amount.toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}

        {proposal.terms && (
          <div className="mb-4 p-3.5 bg-bg-elevated rounded-xl">
            <p className="text-xs font-medium text-text-muted mb-1">Terms & Conditions</p>
            <p className="text-xs text-text-secondary leading-relaxed">{proposal.terms}</p>
          </div>
        )}

        {proposal.valid_until && (
          <p className="text-xs text-text-muted">Valid until {formatDate(proposal.valid_until)}</p>
        )}
      </Card>

      <div className="flex gap-2 flex-wrap">
        {proposal.status === "draft" && (
          <Button onClick={() => updateStatus("sent")} className="flex-1">
            <Send size={14} /> Mark as Sent
          </Button>
        )}
        {proposal.status === "sent" && (
          <>
            <Button onClick={() => updateStatus("accepted")} className="flex-1">Mark Accepted</Button>
            <Button variant="outline" onClick={() => updateStatus("declined")} className="flex-1">Mark Declined</Button>
          </>
        )}
        {proposal.status !== "draft" && (
          <Button variant="outline" onClick={copyLink} className="flex-1">
            {copied ? <Check size={14} className="text-success" /> : <Copy size={14} />}
            {copied ? "Copied!" : "Copy Client Link"}
          </Button>
        )}
      </div>
    </div>
  );
}
