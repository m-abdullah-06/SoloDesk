"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Project } from "@/types";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { EmptyState } from "@/components/ui/EmptyState";
import { Modal } from "@/components/ui/Modal";
import { ProjectForm } from "@/components/projects/ProjectForm";
import { Plus, FolderKanban, Clock, DollarSign } from "lucide-react";
import { formatDate, formatCurrency, getMilestoneProgress } from "@/lib/utils";
import Link from "next/link";

const STATUS_FILTERS = [
  { label: "All", value: "" },
  { label: "Active", value: "active" },
  { label: "In Review", value: "in_review" },
  { label: "Completed", value: "completed" },
  { label: "Archived", value: "archived" },
];

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const supabase = createClient();

  async function load() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from("projects")
      .select("*, client:clients(name), milestones(*)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setProjects(data || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const filtered = filter
    ? projects.filter((p) => p.status === filter)
    : projects;

  return (
    <div>
      <PageHeader
        title="Projects"
        description={`${projects.length} total`}
        action={
          <Button onClick={() => setShowAdd(true)} size="sm">
            <Plus size={16} /> New Project
          </Button>
        }
      />

      {/* Status filter tabs */}
      <div className="flex gap-1 mb-4 overflow-x-auto pb-1 scrollbar-hide">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              filter === f.value
                ? "bg-accent text-white"
                : "bg-card border border-border text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-32 rounded-2xl shimmer" />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="No projects"
          description="Create your first project to start tracking milestones and sharing client portals."
          action={{ label: "New Project", onClick: () => setShowAdd(true) }}
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((project) => {
            const progress = getMilestoneProgress(project.milestones || []);
            return (
              <Link key={project.id} href={`/projects/${project.id}`}>
                <Card hover>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-text-primary truncate">{project.name}</p>
                      <p className="text-xs text-text-muted mt-0.5">
                        {(project as any).client?.name || "No client"}
                      </p>
                    </div>
                    <Badge label={project.status} status={project.status} />
                  </div>
                  <ProgressBar value={progress} showLabel size="sm" />
                  <div className="flex items-center gap-4 mt-3 text-xs text-text-muted">
                    {project.deadline && (
                      <span className="flex items-center gap-1">
                        <Clock size={11} /> {formatDate(project.deadline)}
                      </span>
                    )}
                    {project.budget && (
                      <span className="flex items-center gap-1 text-accent font-medium">
                        <DollarSign size={11} />
                        {formatCurrency(project.budget, project.currency)}
                      </span>
                    )}
                    <span className="flex items-center gap-1 ml-auto">
                      {(project.milestones || []).length} milestones
                    </span>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="New Project">
        <ProjectForm
          onSuccess={() => { setShowAdd(false); load(); }}
          onCancel={() => setShowAdd(false)}
        />
      </Modal>
    </div>
  );
}

