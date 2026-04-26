"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Invoice } from "@/types";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatDate, formatCurrency } from "@/lib/utils";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Copy, Check, ExternalLink } from "lucide-react";

export default function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("invoices")
        .select("*, client:clients(name, email), project:projects(name), items:invoice_items(*)")
        .eq("id", id)
        .single();
      setInvoice(data);
      setLoading(false);
    }
    load();
  }, [id]);

  async function updateStatus(status: string) {
    await supabase.from("invoices").update({ status, ...(status === "paid" ? { amount_paid: invoice.total } : {}) }).eq("id", id);
    setInvoice({ ...invoice, status, ...(status === "paid" ? { amount_paid: invoice.total } : {}) });
  }

  function copyLink() {
    navigator.clipboard.writeText(`${window.location.origin}/portal/invoice/${invoice.portal_token}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading) return <div className="h-64 rounded-2xl shimmer" />;
  if (!invoice) return <div className="text-center py-16 text-text-muted">Invoice not found.</div>;

  const currSymbol = invoice.currency === "PKR" ? "Rs" : invoice.currency === "USD" ? "$" : "£";
  const balance = invoice.total - invoice.amount_paid;

  return (
    <div className="space-y-5">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-text-muted hover:text-text-primary">
        <ArrowLeft size={16} /> Invoices
      </button>

      <Card glow>
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="font-mono text-sm text-text-muted">{invoice.invoice_number}</p>
            <h1 className="font-display text-xl font-bold text-text-primary mt-0.5">
              {invoice.client?.name}
            </h1>
            {invoice.project?.name && (
              <p className="text-sm text-text-muted">{invoice.project.name}</p>
            )}
          </div>
          <Badge label={invoice.status} status={invoice.status} />
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm mb-4">
          <div>
            <p className="text-xs text-text-muted">Issue Date</p>
            <p className="font-medium text-text-primary">{formatDate(invoice.issue_date)}</p>
          </div>
          <div>
            <p className="text-xs text-text-muted">Due Date</p>
            <p className="font-medium text-text-primary">{formatDate(invoice.due_date)}</p>
          </div>
        </div>

        {/* Line Items */}
        <div className="border border-border rounded-xl overflow-hidden mb-4">
          <table className="w-full text-sm">
            <thead className="bg-bg-elevated">
              <tr>
                <th className="text-left px-3 py-2 text-xs font-medium text-text-muted">Description</th>
                <th className="text-center px-3 py-2 text-xs font-medium text-text-muted">Qty</th>
                <th className="text-right px-3 py-2 text-xs font-medium text-text-muted">Rate</th>
                <th className="text-right px-3 py-2 text-xs font-medium text-text-muted">Total</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items?.map((item: any) => (
                <tr key={item.id} className="border-t border-border">
                  <td className="px-3 py-2.5 text-text-primary">{item.description}</td>
                  <td className="px-3 py-2.5 text-text-secondary text-center">{item.quantity}</td>
                  <td className="px-3 py-2.5 text-text-secondary text-right">{currSymbol} {item.rate.toLocaleString()}</td>
                  <td className="px-3 py-2.5 text-text-primary font-medium text-right">{currSymbol} {item.total.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-text-muted">Subtotal</span>
            <span className="font-medium text-text-primary">{currSymbol} {invoice.total.toLocaleString()}</span>
          </div>
          {invoice.amount_paid > 0 && (
            <div className="flex justify-between text-success">
              <span>Amount Paid</span>
              <span className="font-medium">- {currSymbol} {invoice.amount_paid.toLocaleString()}</span>
            </div>
          )}
          <div className="flex justify-between border-t border-border pt-2">
            <span className="font-semibold text-text-primary">Balance Due</span>
            <span className="font-bold text-accent text-lg">{currSymbol} {balance.toLocaleString()}</span>
          </div>
        </div>

        {invoice.payment_instructions && (
          <div className="mt-4 p-3 bg-bg-elevated rounded-xl text-xs text-text-secondary">
            <p className="font-medium text-text-primary mb-1">Payment Instructions</p>
            <p className="whitespace-pre-line">{invoice.payment_instructions}</p>
          </div>
        )}
      </Card>

      {/* Actions */}
      <div className="flex gap-2 flex-wrap">
        {invoice.status === "draft" && (
          <Button onClick={() => updateStatus("sent")} className="flex-1">Mark as Sent</Button>
        )}
        {["sent", "partial", "overdue"].includes(invoice.status) && (
          <Button onClick={() => updateStatus("paid")} className="flex-1">Mark as Paid</Button>
        )}
        {invoice.status !== "draft" && (
          <Button variant="outline" onClick={copyLink} className="flex-1">
            {copied ? <Check size={14} className="text-success" /> : <Copy size={14} />}
            {copied ? "Copied!" : "Copy Client Link"}
          </Button>
        )}
      </div>
    </div>
  );
}
