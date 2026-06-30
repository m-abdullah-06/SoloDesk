"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatDate, formatCurrency } from "@/lib/utils";
import { useParams } from "next/navigation";
import { FileText, CheckCircle, Clock, Check } from "lucide-react";

export default function PublicProposalPage() {
  const { token } = useParams<{ token: string }>();
  const [proposal, setProposal] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from("proposals")
        .select("*, client:clients(name, email), user:users(name, email, tagline, avatar_url)")
        .eq("portal_token", token)
        .single();

      if (error || !data) {
        setNotFound(true);
      } else {
        setProposal(data);
      }
      setLoading(false);
    }
    load();
  }, [token]);

  if (loading) return (
    <div className="min-h-screen bg-bg-base flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (notFound) return (
    <div className="min-h-screen bg-bg-base flex flex-col items-center justify-center px-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-accent-light flex items-center justify-center mb-4">
        <FileText size={28} className="text-accent" />
      </div>
      <h1 className="font-display text-2xl font-bold text-text-primary mb-2">Proposal not found</h1>
      <p className="text-text-muted text-sm">The link may have expired or is incorrect.</p>
    </div>
  );

  const currSymbol = proposal.currency === "PKR" ? "Rs" : proposal.currency === "USD" ? "$" : "£";

  return (
    <div className="min-h-screen bg-bg-base py-10 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Branding */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-accent flex items-center justify-center shadow-orange">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <span className="font-display font-bold text-text-primary text-lg">SoloDesk</span>
          </div>
          <Badge label={proposal.status} status={proposal.status} />
        </div>

        <Card glow className="p-0 overflow-hidden border-none shadow-xl">
          {/* Cover */}
          <div className="bg-hero-gradient p-10 border-b border-border/50">
            <h1 className="font-display text-4xl font-bold text-text-primary mb-4">{proposal.title}</h1>
            <div className="flex flex-wrap gap-6 items-center">
              <div>
                <p className="text-xs font-semibold text-accent uppercase mb-1">Prepared For</p>
                <p className="font-medium text-text-primary">{proposal.client?.name || "Valued Client"}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-accent uppercase mb-1">Created By</p>
                <p className="font-medium text-text-primary">{proposal.user?.name || "The Freelancer"}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-accent uppercase mb-1">Date Issued</p>
                <p className="font-medium text-text-primary">{formatDate(proposal.created_at)}</p>
              </div>
            </div>
          </div>

          <div className="p-10 space-y-10">
            {/* Overview */}
            {proposal.overview && (
              <section>
                <h2 className="text-lg font-bold text-text-primary mb-3 flex items-center gap-2">
                  <span className="w-1 h-6 bg-accent rounded-full" /> Project Overview
                </h2>
                <p className="text-text-secondary leading-relaxed whitespace-pre-line">
                  {proposal.overview}
                </p>
              </section>
            )}

            {/* Scope */}
            {proposal.scope_items?.length > 0 && (
              <section>
                <h2 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
                  <span className="w-1 h-6 bg-accent rounded-full" /> Scope of Work
                </h2>
                <div className="grid gap-4">
                  {proposal.scope_items.map((item: any, i: number) => (
                    <div key={i} className="flex gap-4 p-4 bg-bg-elevated border border-border rounded-2xl shadow-sm">
                      <div className="w-6 h-6 rounded-full bg-accent-light flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check size={14} className="text-accent" />
                      </div>
                      <div>
                        <h3 className="font-bold text-text-primary">{item.title}</h3>
                        <p className="text-sm text-text-muted mt-1">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Timeline */}
            {proposal.timeline_items?.length > 0 && (
              <section>
                <h2 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
                  <span className="w-1 h-6 bg-accent rounded-full" /> Estimated Timeline
                </h2>
                <div className="space-y-3">
                  {proposal.timeline_items.map((item: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-bg-elevated rounded-2xl border border-border/50">
                      <span className="font-medium text-text-primary">{item.milestone}</span>
                      <span className="text-sm text-accent font-semibold flex items-center gap-1.5">
                        <Clock size={14} /> {item.duration}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Pricing */}
            {proposal.pricing_items?.length > 0 && (
              <section>
                <h2 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
                  <span className="w-1 h-6 bg-accent rounded-full" /> Financial Investment
                </h2>
                <div className="border border-border rounded-2xl overflow-hidden shadow-sm">
                  <table className="w-full text-sm">
                    <thead className="bg-bg-elevated border-b border-border">
                      <tr>
                        <th className="text-left px-6 py-4 font-bold text-text-primary">Description</th>
                        <th className="text-right px-6 py-4 font-bold text-text-primary">Investment</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {proposal.pricing_items.map((item: any, i: number) => (
                        <tr key={i}>
                          <td className="px-6 py-4 text-text-secondary">{item.description}</td>
                          <td className="px-6 py-4 text-right font-medium text-text-primary">
                            {formatCurrency(parseFloat(item.amount), proposal.currency)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-accent-light/30">
                      <tr>
                        <td className="px-6 py-4 font-bold text-text-primary">Total Investment</td>
                        <td className="px-6 py-4 text-right font-bold text-accent text-lg">
                          {formatCurrency(proposal.total_amount, proposal.currency)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </section>
            )}

            {/* Terms */}
            {proposal.terms && (
              <section className="bg-bg-elevated p-6 rounded-2xl border border-border/50">
                <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider mb-3">Terms & Conditions</h2>
                <p className="text-xs text-text-muted leading-relaxed whitespace-pre-line">
                  {proposal.terms}
                </p>
              </section>
            )}
          </div>
        </Card>

        {proposal.valid_until && (
          <p className="mt-6 text-center text-xs text-text-muted">
            This proposal is valid until {formatDate(proposal.valid_until)}
          </p>
        )}
      </div>
    </div>
  );
}
