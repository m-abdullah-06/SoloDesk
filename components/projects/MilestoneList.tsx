"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Milestone } from "@/types";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { formatDate, isOverdue } from "@/lib/utils";
import {
  Plus,
  Check,
  Circle,
  Clock,
  ChevronDown,
  Trash2,
  Edit,
} from "lucide-react";

const STATUS_ORDER = ["pending", "in_progress", "done", "approved"];
const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  in_progress: "In Progress",
  done: "Done",
  approved: "Approved",
};

interface MilestoneListProps {
  projectId: string;
  milestones: Milestone[];
  onRefresh: () => void;
}

export function MilestoneList({
  projectId,
  milestones,
  onRefresh,
}: MilestoneListProps) {
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    due_date: "",
  });
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  async function addMilestone() {
    if (!form.title.trim()) return;
    setLoading(true);
    await supabase.from("milestones").insert({
      project_id: projectId,
      title: form.title,
      description: form.description || null,
      due_date: form.due_date || null,
      sort_order: milestones.length,
    });
    setForm({ title: "", description: "", due_date: "" });
    setShowAdd(false);
    setLoading(false);
    onRefresh();
  }

  async function updateStatus(id: string, current: string) {
    const next =
      STATUS_ORDER[(STATUS_ORDER.indexOf(current) + 1) % STATUS_ORDER.length];
    await supabase.from("milestones").update({ status: next }).eq("id", id);
    onRefresh();
  }

  async function deleteMilestone(id: string) {
    if (!confirm("Delete this milestone?")) return;
    await supabase.from("milestones").delete().eq("id", id);
    onRefresh();
  }

  const statusIcon = (status: string) => {
    if (status === "done" || status === "approved")
      return <Check size={14} className="text-green-600 dark:text-green-500" />;
    if (status === "in_progress")
      return <Clock size={14} className="text-accent" />;
    return <Circle size={14} className="text-muted-foreground" />;
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-1">
        <p className="text-sm text-muted-foreground">
          {milestones.length} milestone{milestones.length !== 1 ? "s" : ""}
        </p>
        <Button size="sm" variant="outline" onClick={() => setShowAdd(true)}>
          <Plus size={14} /> Add
        </Button>
      </div>

      {milestones.length === 0 ? (
        <div className="text-center py-8 border-2 border-dashed border-border rounded-2xl">
          <p className="text-sm text-muted-foreground mb-2">
            No milestones yet
          </p>
          <Button size="sm" variant="ghost" onClick={() => setShowAdd(true)}>
            <Plus size={14} /> Add Milestone
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {milestones.map((m) => (
            <div
              key={m.id}
              className={`flex items-start gap-3 p-3.5 bg-card rounded-xl border transition-all ${
                m.status === "done" || m.status === "approved"
                  ? "border-success/20 bg-green-50/30"
                  : isOverdue(m.due_date)
                    ? "border-danger/20 bg-red-50/30"
                    : "border-border"
              }`}
            >
              <button
                onClick={() => updateStatus(m.id, m.status)}
                className="mt-0.5 flex-shrink-0 w-6 h-6 rounded-full border-2 border-border flex items-center justify-center hover:border-accent transition-colors"
              >
                {statusIcon(m.status)}
              </button>
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm font-medium ${m.status === "done" || m.status === "approved" ? "line-through text-text-muted" : "text-text-primary"}`}
                >
                  {m.title}
                </p>
                {m.description && (
                  <p className="text-xs text-text-muted mt-0.5 truncate">
                    {m.description}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-1.5">
                  <Badge label={STATUS_LABELS[m.status]} status={m.status} />
                  {m.due_date && (
                    <span
                      className={`text-xs flex items-center gap-1 ${isOverdue(m.due_date) && m.status !== "done" ? "text-destructive" : "text-muted-foreground"}`}
                    >
                      <Clock size={10} /> {formatDate(m.due_date)}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => deleteMilestone(m.id)}
                className="text-muted-foreground hover:text-destructive transition-colors p-1"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        title="Add Milestone"
        size="sm"
      >
        <div className="space-y-3">
          <Input
            label="Title *"
            placeholder="Design mockups"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <Textarea
            label="Description"
            placeholder="What needs to be done..."
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={2}
          />
          <Input
            label="Due Date"
            type="date"
            value={form.due_date}
            onChange={(e) => setForm({ ...form, due_date: e.target.value })}
          />
          <div className="flex gap-3 pt-1">
            <Button
              variant="outline"
              onClick={() => setShowAdd(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button onClick={addMilestone} loading={loading} className="flex-1">
              Add
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
