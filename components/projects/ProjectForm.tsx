"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Input, Select, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Project, Client } from "@/types";

const STATUS_OPTIONS = [
  { value: "inquiry", label: "Inquiry" },
  { value: "proposal_sent", label: "Proposal Sent" },
  { value: "negotiating", label: "Negotiating" },
  { value: "active", label: "Active" },
  { value: "in_review", label: "In Review" },
  { value: "completed", label: "Completed" },
];

const CURRENCY_OPTIONS = [
  { value: "PKR", label: "PKR (Rs)" },
  { value: "USD", label: "USD ($)" },
  { value: "GBP", label: "GBP (£)" },
];

const PAYMENT_OPTIONS = [
  { value: "unpaid", label: "Unpaid" },
  { value: "partial", label: "Partial" },
  { value: "paid", label: "Paid" },
];

interface ProjectFormProps {
  project?: Project;
  onSuccess: () => void;
  onCancel: () => void;
}

export function ProjectForm({
  project,
  onSuccess,
  onCancel,
}: ProjectFormProps) {
  const [clients, setClients] = useState<Pick<Client, "id" | "name">[]>([]);
  const [form, setForm] = useState({
    name: project?.name || "",
    description: project?.description || "",
    client_id: project?.client_id || "",
    status: project?.status || "active",
    budget: project?.budget?.toString() || "",
    currency: project?.currency || "PKR",
    payment_status: project?.payment_status || "unpaid",
    start_date: project?.start_date || "",
    deadline: project?.deadline || "",
    internal_notes: project?.internal_notes || "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const supabase = createClient();

  useEffect(() => {
    async function loadClients() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("clients")
        .select("id, name")
        .eq("user_id", user.id)
        .order("name");
      setClients(data || []);
    }
    loadClients();
  }, []);

  async function handleSubmit() {
    if (!form.name.trim()) {
      setError("Project name is required");
      return;
    }
    setLoading(true);
    setError("");
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const payload = {
      ...form,
      user_id: user.id,
      budget: form.budget ? parseFloat(form.budget) : null,
      client_id: form.client_id || null,
      start_date: form.start_date || null,
      deadline: form.deadline || null,
    };

    if (project) {
      const { error: err } = await supabase
        .from("projects")
        .update(payload)
        .eq("id", project.id);
      if (err) {
        setError(err.message);
        setLoading(false);
        return;
      }
    } else {
      const { error: err } = await supabase.from("projects").insert(payload);
      if (err) {
        setError(err.message);
        setLoading(false);
        return;
      }
    }
    onSuccess();
  }

  return (
    <div className="space-y-4">
      <Input
        label="Project Name *"
        placeholder="E-commerce Website"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
      />
      <Select
        label="Client"
        value={form.client_id}
        onChange={(v) => setForm({ ...form, client_id: v })}
        options={clients.map((c) => ({ value: c.id, label: c.name }))}
        placeholder="Select client"
      />
      <div className="grid grid-cols-2 gap-3">
        <Select
          label="Status"
          value={form.status}
          onChange={(v) => setForm({ ...form, status: v as Project["status"] })}
          options={STATUS_OPTIONS}
        />
        <Select
          label="Payment"
          value={form.payment_status}
          onChange={(v) =>
            setForm({ ...form, payment_status: v as Project["payment_status"] })
          }
          options={PAYMENT_OPTIONS}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Budget"
          type="number"
          placeholder="50000"
          value={form.budget}
          onChange={(e) => setForm({ ...form, budget: e.target.value })}
        />
        <Select
          label="Currency"
          value={form.currency}
          onChange={(v) =>
            setForm({ ...form, currency: v as Project["currency"] })
          }
          options={CURRENCY_OPTIONS}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Start Date"
          type="date"
          value={form.start_date}
          onChange={(e) => setForm({ ...form, start_date: e.target.value })}
        />
        <Input
          label="Deadline"
          type="date"
          value={form.deadline}
          onChange={(e) => setForm({ ...form, deadline: e.target.value })}
        />
      </div>
      <Textarea
        label="Description"
        placeholder="Brief description of the project..."
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
        rows={2}
      />
      <Textarea
        label="Internal Notes (private)"
        placeholder="Notes only you can see..."
        value={form.internal_notes}
        onChange={(e) => setForm({ ...form, internal_notes: e.target.value })}
        rows={2}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="flex gap-3 pt-2">
        <Button variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button onClick={handleSubmit} loading={loading} className="flex-1">
          {project ? "Save Changes" : "Create Project"}
        </Button>
      </div>
    </div>
  );
}
