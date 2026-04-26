"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Invoice } from "@/types";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Modal } from "@/components/ui/Modal";
import { InvoiceForm } from "@/components/invoices/InvoiceForm";
import { Plus, Receipt, Clock, Copy, Check, ExternalLink } from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/utils";
import Link from "next/link";

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const supabase = createClient();

  async function load() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from("invoices")
      .select("*, client:clients(name), items:invoice_items(*)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setInvoices(data || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function updateStatus(id: string, status: string) {
    await supabase.from("invoices").update({ status }).eq("id", id);
    load();
  }

  function copyLink(token: string, id: string) {
    navigator.clipboard.writeText(`${window.location.origin}/portal/invoice/${token}`);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  const totalOwed = invoices
    .filter((i) => ["sent", "partial", "overdue"].includes(i.status))
    .reduce((sum, i) => sum + (i.total - i.amount_paid), 0);

  return (
    <div>
      <PageHeader
        title="Invoices"
        description={`${invoices.length} total`}
        action={
          <Button onClick={() => setShowAdd(true)} size="sm">
            <Plus size={16} /> New Invoice
          </Button>
        }
      />

      {/* Summary */}
      {invoices.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { label: "Total Sent", value: invoices.filter(i => i.status !== "draft").length },
            { label: "Paid", value: invoices.filter(i => i.status === "paid").length },
            { label: "Outstanding", value: `Rs ${totalOwed.toLocaleString()}` },
          ].map((s) => (
            <Card key={s.label} className="text-center">
              <div className="text-lg font-bold text-text-primary">{s.value}</div>
              <div className="text-xs text-text-muted mt-0.5">{s.label}</div>
            </Card>
          ))}
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-24 rounded-2xl shimmer" />)}
        </div>
      ) : invoices.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="No invoices yet"
          description="Create your first invoice and share it with your client as a link."
          action={{ label: "New Invoice", onClick: () => setShowAdd(true) }}
        />
      ) : (
        <div className="space-y-3">
          {invoices.map((inv) => (
            <Card key={inv.id} hover>
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-mono text-xs text-text-muted">{inv.invoice_number}</p>
                    <Badge label={inv.status} status={inv.status} />
                  </div>
                  <p className="font-semibold text-text-primary mt-0.5">
                    {(inv as any).client?.name || "No client"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-accent text-base">
                    {formatCurrency(inv.total, inv.currency)}
                  </p>
                  {inv.amount_paid > 0 && inv.amount_paid < inv.total && (
                    <p className="text-xs text-text-muted">
                      Paid: {formatCurrency(inv.amount_paid, inv.currency)}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-text-muted mb-3">
                <Clock size={11} />
                Due {formatDate(inv.due_date)}
              </div>

              <div className="flex gap-2 flex-wrap">
                {inv.status === "draft" && (
                  <Button size="sm" variant="outline" onClick={() => updateStatus(inv.id, "sent")}>
                    Mark Sent
                  </Button>
                )}
                {["sent", "partial", "overdue"].includes(inv.status) && (
                  <Button size="sm" onClick={() => updateStatus(inv.id, "paid")}>
                    Mark Paid
                  </Button>
                )}
                {inv.status !== "draft" && (
                  <Button size="sm" variant="ghost" onClick={() => copyLink((inv as any).portal_token, inv.id)}>
                    {copiedId === inv.id ? <Check size={13} className="text-success" /> : <Copy size={13} />}
                    {copiedId === inv.id ? "Copied!" : "Share Link"}
                  </Button>
                )}
                <Link href={`/invoices/${inv.id}`}>
                  <Button size="sm" variant="ghost">
                    <ExternalLink size={13} /> View
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="New Invoice" size="lg">
        <InvoiceForm
          onSuccess={() => { setShowAdd(false); load(); }}
          onCancel={() => setShowAdd(false)}
        />
      </Modal>
    </div>
  );
}
