"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Input, Select, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Client } from "@/types";
import { Plus, Trash2, Sparkles } from "lucide-react";

const CURRENCY_OPTIONS = [
  { value: "PKR", label: "PKR (Rs)" },
  { value: "USD", label: "USD ($)" },
  { value: "GBP", label: "GBP (£)" },
];

interface ProposalFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function ProposalForm({ onSuccess, onCancel }: ProposalFormProps) {
  const [clients, setClients] = useState<Pick<Client, 'id' | 'name'>[]>([]);
  const [form, setForm] = useState({
    title: "",
    client_id: "",
    overview: "",
    currency: "PKR",
    terms: "Payment is due within 7 days of project completion. Revisions are limited to 2 rounds. Additional revisions will be billed separately.",
    valid_until: "",
  });
  const [scopeItems, setScopeItems] = useState([{ id: "1", title: "", description: "" }]);
  const [timelineItems, setTimelineItems] = useState([{ id: "1", milestone: "", duration: "" }]);
  const [pricingItems, setPricingItems] = useState([{ id: "1", description: "", amount: "" }]);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [jobDesc, setJobDesc] = useState("");
  const [showAI, setShowAI] = useState(false);
  const [error, setError] = useState("");
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("clients").select("id, name").eq("user_id", user.id).order("name");
      setClients(data || []);
    }
    load();
  }, []);

  async function generateFromAI() {
    if (!jobDesc.trim()) return;
    setAiLoading(true);
    try {
      const res = await fetch("/api/ai/proposal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobDescription: jobDesc }),
      });
      const data = await res.json();
      if (data) {
        if (data.overview) setForm(f => ({ ...f, overview: data.overview }));
        if (data.scope_items?.length) setScopeItems(data.scope_items);
        if (data.timeline_items?.length) setTimelineItems(data.timeline_items);
        if (data.pricing_items?.length) setPricingItems(data.pricing_items.map((p: any) => ({ ...p, amount: p.amount.toString() })));
        if (data.terms) setForm(f => ({ ...f, terms: data.terms }));
        setShowAI(false);
      }
    } catch (e) {}
    setAiLoading(false);
  }

  const total = pricingItems.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);

  async function handleSubmit() {
    if (!form.title.trim()) { setError("Title is required"); return; }
    setLoading(true);
    setError("");
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error: err } = await supabase.from("proposals").insert({
      user_id: user.id,
      client_id: form.client_id || null,
      title: form.title,
      overview: form.overview || null,
      currency: form.currency,
      total_amount: total,
      scope_items: scopeItems,
      timeline_items: timelineItems,
      pricing_items: pricingItems,
      terms: form.terms || null,
      valid_until: form.valid_until || null,
      status: "draft",
    });

    if (err) { setError(err.message); setLoading(false); return; }
    onSuccess();
  }

  return (
    <div className="space-y-4">
      {/* AI Generate */}
      <div className="p-3 bg-accent-light border border-accent/20 rounded-xl">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-accent">✨ AI Generate from Job Description</p>
          <button onClick={() => setShowAI(!showAI)} className="text-xs text-accent underline">
            {showAI ? "Hide" : "Use AI"}
          </button>
        </div>
        {showAI && (
          <div className="space-y-2">
            <Textarea
              placeholder="Paste the job description or project brief here..."
              value={jobDesc}
              onChange={(e) => setJobDesc(e.target.value)}
              rows={3}
            />
            <Button size="sm" onClick={generateFromAI} loading={aiLoading}>
              <Sparkles size={14} /> Generate Proposal
            </Button>
          </div>
        )}
      </div>

      <Input label="Proposal Title *" placeholder="E-commerce Website Development" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
      <div className="grid grid-cols-2 gap-3">
        <Select label="Client" value={form.client_id} onChange={(v) => setForm({ ...form, client_id: v })} options={clients.map(c => ({ value: c.id, label: c.name }))} placeholder="Select client" />
        <Select label="Currency" value={form.currency} onChange={(v) => setForm({ ...form, currency: v })} options={CURRENCY_OPTIONS} />
      </div>
      <Textarea label="Project Overview" placeholder="Brief overview of the project..." value={form.overview} onChange={(e) => setForm({ ...form, overview: e.target.value })} rows={3} />

      {/* Scope */}
      <div>
        <p className="text-sm font-medium text-text-primary mb-2">Scope of Work</p>
        <div className="space-y-2">
          {scopeItems.map((item, i) => (
            <div key={item.id} className="flex gap-2">
              <div className="flex-1 space-y-1">
                <input placeholder="Feature/Deliverable" value={item.title} onChange={(e) => { const u = [...scopeItems]; u[i].title = e.target.value; setScopeItems(u); }} className="w-full h-9 px-3 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
                <input placeholder="Description" value={item.description} onChange={(e) => { const u = [...scopeItems]; u[i].description = e.target.value; setScopeItems(u); }} className="w-full h-9 px-3 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
              </div>
              {scopeItems.length > 1 && <button onClick={() => setScopeItems(scopeItems.filter((_, idx) => idx !== i))} className="text-text-muted hover:text-danger"><Trash2 size={14} /></button>}
            </div>
          ))}
        </div>
        <button onClick={() => setScopeItems([...scopeItems, { id: Date.now().toString(), title: "", description: "" }])} className="flex items-center gap-1.5 text-sm text-accent mt-2"><Plus size={14} /> Add Item</button>
      </div>

      {/* Timeline */}
      <div>
        <p className="text-sm font-medium text-text-primary mb-2">Timeline</p>
        <div className="space-y-2">
          {timelineItems.map((item, i) => (
            <div key={item.id} className="flex gap-2">
              <input placeholder="Milestone" value={item.milestone} onChange={(e) => { const u = [...timelineItems]; u[i].milestone = e.target.value; setTimelineItems(u); }} className="flex-1 h-9 px-3 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
              <input placeholder="Duration (e.g. 3 days)" value={item.duration} onChange={(e) => { const u = [...timelineItems]; u[i].duration = e.target.value; setTimelineItems(u); }} className="w-32 h-9 px-3 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
              {timelineItems.length > 1 && <button onClick={() => setTimelineItems(timelineItems.filter((_, idx) => idx !== i))} className="text-text-muted hover:text-danger"><Trash2 size={14} /></button>}
            </div>
          ))}
        </div>
        <button onClick={() => setTimelineItems([...timelineItems, { id: Date.now().toString(), milestone: "", duration: "" }])} className="flex items-center gap-1.5 text-sm text-accent mt-2"><Plus size={14} /> Add Milestone</button>
      </div>

      {/* Pricing */}
      <div>
        <p className="text-sm font-medium text-text-primary mb-2">Pricing</p>
        <div className="space-y-2">
          {pricingItems.map((item, i) => (
            <div key={item.id} className="flex gap-2">
              <input placeholder="Description" value={item.description} onChange={(e) => { const u = [...pricingItems]; u[i].description = e.target.value; setPricingItems(u); }} className="flex-1 h-9 px-3 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
              <input placeholder="Amount" type="number" value={item.amount} onChange={(e) => { const u = [...pricingItems]; u[i].amount = e.target.value; setPricingItems(u); }} className="w-28 h-9 px-3 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
              {pricingItems.length > 1 && <button onClick={() => setPricingItems(pricingItems.filter((_, idx) => idx !== i))} className="text-text-muted hover:text-danger"><Trash2 size={14} /></button>}
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between mt-2">
          <button onClick={() => setPricingItems([...pricingItems, { id: Date.now().toString(), description: "", amount: "" }])} className="flex items-center gap-1.5 text-sm text-accent"><Plus size={14} /> Add Item</button>
          <p className="text-sm font-bold text-text-primary">Total: {form.currency === "PKR" ? "Rs" : form.currency === "USD" ? "$" : "£"} {total.toLocaleString()}</p>
        </div>
      </div>

      <Textarea label="Terms & Conditions" value={form.terms} onChange={(e) => setForm({ ...form, terms: e.target.value })} rows={3} />
      <Input label="Valid Until" type="date" value={form.valid_until} onChange={(e) => setForm({ ...form, valid_until: e.target.value })} />

      {error && <p className="text-sm text-danger">{error}</p>}
      <div className="flex gap-3 pt-2">
        <Button variant="outline" onClick={onCancel} className="flex-1">Cancel</Button>
        <Button onClick={handleSubmit} loading={loading} className="flex-1">Create Proposal</Button>
      </div>
    </div>
  );
}
