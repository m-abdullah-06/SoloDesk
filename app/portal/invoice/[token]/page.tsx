"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatDate, formatCurrency } from "@/lib/utils";
import { useParams } from "next/navigation";
import { FileText, Receipt, Download, Clock } from "lucide-react";

export default function PublicInvoicePage() {
  const { token } = useParams<{ token: string }>();
  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      // Fetch invoice by portal_token
      const { data, error } = await supabase
        .from("invoices")
        .select("*, client:clients(name, email), project:projects(name), items:invoice_items(*), user:users(name, email, tagline, avatar_url)")
        .eq("portal_token", token)
        .single();

      if (error || !data) {
        setNotFound(true);
      } else {
        setInvoice(data);
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
        <Receipt size={28} className="text-accent" />
      </div>
      <h1 className="font-display text-2xl font-bold text-text-primary mb-2">Invoice not found</h1>
      <p className="text-text-muted text-sm">This link may have expired or is incorrect.</p>
    </div>
  );

  const currSymbol = invoice.currency === "PKR" ? "Rs" : invoice.currency === "USD" ? "$" : "£";
  const balance = invoice.total - invoice.amount_paid;

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
          <div className="text-right">
            <p className="text-xs font-medium text-text-muted uppercase tracking-wider">Invoice</p>
            <p className="font-mono text-sm text-text-primary">{invoice.invoice_number}</p>
          </div>
        </div>

        <Card glow className="p-0 overflow-hidden border-none shadow-xl">
          {/* Header */}
          <div className="bg-hero-gradient p-8 border-b border-border/50">
            <div className="flex flex-col md:flex-row justify-between gap-6">
              <div>
                <p className="text-xs font-semibold text-accent uppercase mb-2">From</p>
                <h2 className="font-bold text-lg text-text-primary">{invoice.user?.name || "The Freelancer"}</h2>
                {invoice.user?.tagline && (
                  <p className="text-sm text-text-secondary">{invoice.user.tagline}</p>
                )}
                <p className="text-sm text-text-muted">{invoice.user?.email}</p>
              </div>
              <div className="md:text-right">
                <p className="text-xs font-semibold text-accent uppercase mb-2">Bill To</p>
                <h2 className="font-bold text-lg text-text-primary">{invoice.client?.name || "Valued Client"}</h2>
                <p className="text-sm text-text-muted">{invoice.client?.email}</p>
                {invoice.project?.name && (
                  <p className="text-xs bg-accent-light text-accent px-2 py-0.5 rounded-full inline-block mt-2 font-medium">
                    {invoice.project.name}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-8">
              <div>
                <p className="text-xs text-text-muted mb-1">Status</p>
                <Badge label={invoice.status} status={invoice.status} />
              </div>
              <div>
                <p className="text-xs text-text-muted mb-1">Issue Date</p>
                <p className="text-sm font-medium">{formatDate(invoice.issue_date)}</p>
              </div>
              <div>
                <p className="text-xs text-text-muted mb-1">Due Date</p>
                <p className="text-sm font-medium">{formatDate(invoice.due_date)}</p>
              </div>
              <div>
                <p className="text-xs text-text-muted mb-1">Amount Due</p>
                <p className="text-sm font-bold text-text-primary">
                  {formatCurrency(balance, invoice.currency)}
                </p>
              </div>
            </div>

            {/* Line Items */}
            <div className="border border-border rounded-xl overflow-hidden mb-8">
              <table className="w-full text-sm">
                <thead className="bg-bg-elevated border-b border-border">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold text-text-primary">Description</th>
                    <th className="text-center px-4 py-3 font-semibold text-text-primary">Qty</th>
                    <th className="text-right px-4 py-3 font-semibold text-text-primary">Rate</th>
                    <th className="text-right px-4 py-3 font-semibold text-text-primary">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {invoice.items?.map((item: any) => (
                    <tr key={item.id}>
                      <td className="px-4 py-4 text-text-primary">{item.description}</td>
                      <td className="px-4 py-4 text-center text-text-secondary">{item.quantity}</td>
                      <td className="px-4 py-4 text-right text-text-secondary">
                        {formatCurrency(item.rate, invoice.currency)}
                      </td>
                      <td className="px-4 py-4 text-right font-medium text-text-primary">
                        {formatCurrency(item.total, invoice.currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="flex justify-end">
              <div className="w-full max-w-xs space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted">Subtotal</span>
                  <span className="font-medium">{formatCurrency(invoice.total, invoice.currency)}</span>
                </div>
                {invoice.amount_paid > 0 && (
                  <div className="flex justify-between text-sm text-success">
                    <span>Paid</span>
                    <span className="font-medium">- {formatCurrency(invoice.amount_paid, invoice.currency)}</span>
                  </div>
                )}
                <div className="flex justify-between pt-3 border-t border-border">
                  <span className="text-base font-bold text-text-primary">Total Balance</span>
                  <span className="text-xl font-bold text-accent">
                    {formatCurrency(balance, invoice.currency)}
                  </span>
                </div>
              </div>
            </div>

            {invoice.notes && (
              <div className="mt-12 border-t border-border pt-6">
                <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider mb-2">Notes</h4>
                <p className="text-sm text-text-muted leading-relaxed">{invoice.notes}</p>
              </div>
            )}

            {invoice.payment_instructions && (
              <div className="mt-6 p-4 bg-accent-light/30 rounded-2xl border border-accent/10">
                <h4 className="text-xs font-bold text-accent uppercase tracking-wider mb-2">Payment Instructions</h4>
                <p className="text-sm text-text-secondary whitespace-pre-line leading-relaxed">
                  {invoice.payment_instructions}
                </p>
              </div>
            )}
          </div>
        </Card>

        <div className="mt-8 flex items-center justify-between">
          <p className="text-xs text-text-muted">
            Generated on {formatDate(new Date().toISOString())}
          </p>
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Download size={14} /> Download PDF
          </Button>
        </div>
      </div>
    </div>
  );
}
