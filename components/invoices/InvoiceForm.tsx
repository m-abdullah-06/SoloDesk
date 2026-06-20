"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Input, Select, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Client, Project, InvoiceItem } from "@/types";
import { Plus, Trash2 } from "lucide-react";

const CURRENCY_OPTIONS = [
  { value: "PKR", label: "PKR (Rs)" },
  { value: "USD", label: "USD ($)" },
  { value: "GBP", label: "GBP (£)" },
];

interface InvoiceFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

type LineItem = { description: string; quantity: string; rate: string };

export function InvoiceForm({ onSuccess, onCancel }: InvoiceFormProps) {
  const [clients, setClients] = useState<Pick<Client, "id" | "name">[]>([]);
  const [projects, setProjects] = useState<Pick<Project, "id" | "name">[]>([]);
  const [form, setForm] = useState({
    client_id: "",
    project_id: "",
    currency: "PKR",
    due_date: "",
    notes: "",
    payment_instructions: "",
  });
  const [items, setItems] = useState<LineItem[]>([
    { description: "", quantity: "1", rate: "" },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const [{ data: c }, { data: p }] = await Promise.all([
        supabase
          .from("clients")
          .select("id, name")
          .eq("user_id", user.id)
          .order("name"),
        supabase
          .from("projects")
          .select("id, name")
          .eq("user_id", user.id)
          .order("name"),
      ]);
      setClients(c || []);
      setProjects(p || []);
    }
    load();
  }, []);

  function addItem() {
    setItems([...items, { description: "", quantity: "1", rate: "" }]);
  }

  function removeItem(i: number) {
    setItems(items.filter((_, idx) => idx !== i));
  }

  function updateItem(i: number, field: keyof LineItem, value: string) {
    const updated = [...items];
    updated[i] = { ...updated[i], [field]: value };
    setItems(updated);
  }

  const total = items.reduce((sum, item) => {
    const qty = parseFloat(item.quantity) || 0;
    const rate = parseFloat(item.rate) || 0;
    return sum + qty * rate;
  }, 0);

  async function handleSubmit() {
    if (!form.client_id) {
      setError("Please select a client");
      return;
    }
    if (items.some((i) => !i.description || !i.rate)) {
      setError("All line items need a description and rate");
      return;
    }
    setLoading(true);
    setError("");

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    // Get invoice number
    const { data: numData } = await supabase.rpc("get_next_invoice_number", {
      p_user_id: user.id,
    });

    const { data: invoice, error: invErr } = await supabase
      .from("invoices")
      .insert({
        user_id: user.id,
        client_id: form.client_id,
        project_id: form.project_id || null,
        invoice_number: numData || `INV-${Date.now()}`,
        currency: form.currency,
        total,
        amount_paid: 0,
        due_date: form.due_date || null,
        notes: form.notes || null,
        payment_instructions: form.payment_instructions || null,
        status: "draft",
      })
      .select()
      .single();

    if (invErr || !invoice) {
      setError(invErr?.message || "Failed to create invoice");
      setLoading(false);
      return;
    }

    // Insert items
    const { error: itemsErr } = await supabase.from("invoice_items").insert(
      items.map((item) => ({
        invoice_id: invoice.id,
        description: item.description,
        quantity: parseFloat(item.quantity),
        rate: parseFloat(item.rate),
      })),
    );

    if (itemsErr) {
      setError(itemsErr.message);
      setLoading(false);
      return;
    }
    onSuccess();
  }

  const currSymbol =
    form.currency === "PKR" ? "Rs" : form.currency === "USD" ? "$" : "£";

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Select
          label="Client *"
          value={form.client_id}
          onChange={(v) => setForm({ ...form, client_id: v })}
          options={clients.map((c) => ({ value: c.id, label: c.name }))}
          placeholder="Select client"
        />
        <Select
          label="Project"
          value={form.project_id}
          onChange={(v) => setForm({ ...form, project_id: v })}
          options={projects.map((p) => ({ value: p.id, label: p.name }))}
          placeholder="Select project"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Select
          label="Currency"
          value={form.currency}
          onChange={(v) => setForm({ ...form, currency: v })}
          options={CURRENCY_OPTIONS}
        />
        <Input
          label="Due Date"
          type="date"
          value={form.due_date}
          onChange={(e) => setForm({ ...form, due_date: e.target.value })}
        />
      </div>

      {/* Line Items */}
      <div>
        <p className="text-sm font-medium text-foreground mb-2">Line Items</p>
        <div className="space-y-2">
          {items.map((item, i) => (
            <div key={i} className="flex gap-2 items-start">
              <div className="flex-1">
                <input
                  placeholder="Description"
                  value={item.description}
                  onChange={(e) => updateItem(i, "description", e.target.value)}
                  className="w-full h-9 px-3 rounded-xl border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
              <input
                placeholder="Qty"
                type="number"
                value={item.quantity}
                onChange={(e) => updateItem(i, "quantity", e.target.value)}
                className="w-16 h-9 px-2 rounded-xl border border-border bg-background text-sm text-center text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
              />
              <input
                placeholder="Rate"
                type="number"
                value={item.rate}
                onChange={(e) => updateItem(i, "rate", e.target.value)}
                className="w-24 h-9 px-3 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
              />
              <div className="w-20 h-9 flex items-center px-2 text-sm text-muted-foreground font-medium">
                {currSymbol}{" "}
                {(
                  (parseFloat(item.quantity) || 0) *
                  (parseFloat(item.rate) || 0)
                ).toLocaleString()}
              </div>
              {items.length > 1 && (
                <button
                  onClick={() => removeItem(i)}
                  className="h-9 flex items-center text-muted-foreground hover:text-destructive"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
        <button
          onClick={addItem}
          className="flex items-center gap-1.5 text-sm text-accent hover:underline mt-2"
        >
          <Plus size={14} /> Add Line Item
        </button>
      </div>

      {/* Total */}
      <div className="flex justify-end py-2 border-t border-border">
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Total</p>
          <p className="text-xl font-bold text-foreground">
            {currSymbol} {total.toLocaleString()}
          </p>
        </div>
      </div>

      <Textarea
        label="Notes"
        placeholder="Thank you for your business!"
        value={form.notes}
        onChange={(e) => setForm({ ...form, notes: e.target.value })}
        rows={2}
      />
      <Textarea
        label="Payment Instructions"
        placeholder="Bank: HBL | Account: 1234567890 | Title: Muhammad Abdullah"
        value={form.payment_instructions}
        onChange={(e) =>
          setForm({ ...form, payment_instructions: e.target.value })
        }
        rows={2}
      />

      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="flex gap-3 pt-2">
        <Button variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button onClick={handleSubmit} loading={loading} className="flex-1">
          Create Invoice
        </Button>
      </div>
    </div>
  );
}
