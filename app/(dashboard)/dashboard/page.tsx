import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { formatCurrency, formatDate, isOverdue, getMilestoneProgress } from "@/lib/utils";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Avatar } from "@/components/ui/Avatar";
import Link from "next/link";
import {
  FolderKanban, Users, TrendingUp, AlertCircle,
  MessageSquare, Plus, ArrowRight, Clock
} from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [
    { data: profile },
    { data: projects },
    { data: clients },
    { data: invoices },
  ] = await Promise.all([
    supabase.from("users").select("*").eq("id", user.id).single(),
    supabase.from("projects").select("*, client:clients(name), milestones(*)").eq("user_id", user.id).neq("status", "archived").order("created_at", { ascending: false }),
    supabase.from("clients").select("id").eq("user_id", user.id),
    supabase.from("invoices").select("total, currency, status").eq("user_id", user.id),
  ]);

  const pIds = (projects || []).map((p: any) => p.id);
  const { data: unreadMessages } = pIds.length > 0
    ? await supabase.from("client_messages").select("id", { count: "exact" }).eq("read", false).in("project_id", pIds)
    : { data: [] };

  const activeProjects = (projects || []).filter((p: any) =>
    ["active", "in_review", "negotiating"].includes(p.status)
  );

  const overdueMilestones = (projects || []).flatMap((p: any) =>
    (p.milestones || []).filter((m: any) =>
      m.status !== "done" && m.status !== "approved" && isOverdue(m.due_date)
    )
  );

  const monthlyEarnings = (invoices || [])
    .filter((i: any) => i.status === "paid")
    .reduce((sum: number, i: any) => sum + (i.total || 0), 0);

  const name = profile?.name || user.email?.split("@")[0] || "there";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-hero-gradient rounded-2xl p-5 border border-border/50">
        <p className="text-sm text-text-muted mb-1">{greeting},</p>
        <h1 className="font-display text-2xl font-bold text-text-primary">{name} 👋</h1>
        {profile?.tagline && (
          <p className="text-sm text-text-secondary mt-1">{profile.tagline}</p>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          {
            label: "Active Projects",
            value: activeProjects.length,
            icon: FolderKanban,
            href: "/projects",
            color: "text-accent",
          },
          {
            label: "Total Clients",
            value: clients?.length || 0,
            icon: Users,
            href: "/clients",
            color: "text-blue-500",
          },
          {
            label: "Overdue Tasks",
            value: overdueMilestones.length,
            icon: AlertCircle,
            href: "/projects",
            color: overdueMilestones.length > 0 ? "text-danger" : "text-success",
          },
          {
            label: "Unread Replies",
            value: unreadMessages?.length || 0,
            icon: MessageSquare,
            href: "/projects",
            color: "text-purple-500",
          },
        ].map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <Card hover className="h-full">
              <div className={`mb-2 ${stat.color}`}>
                <stat.icon size={20} />
              </div>
              <div className="text-2xl font-bold text-text-primary">{stat.value}</div>
              <div className="text-xs text-text-muted mt-0.5">{stat.label}</div>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="flex gap-2 flex-wrap">
        {[
          { label: "New Project", href: "/projects", icon: Plus },
          { label: "New Client", href: "/clients", icon: Plus },
          { label: "Write Message", href: "/ai", icon: Plus },
          { label: "New Invoice", href: "/invoices", icon: Plus },
        ].map((action) => (
          <Link
            key={action.label}
            href={action.href}
            className="inline-flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-xl border border-border bg-white hover:bg-accent-light hover:text-accent hover:border-accent/30 transition-all duration-150"
          >
            <Plus size={14} />
            {action.label}
          </Link>
        ))}
      </div>

      {/* Active Projects */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-text-primary">Active Projects</h2>
          <Link href="/projects" className="text-xs text-accent flex items-center gap-1 hover:underline">
            View all <ArrowRight size={12} />
          </Link>
        </div>
        {activeProjects.length === 0 ? (
          <Card className="text-center py-8">
            <FolderKanban size={24} className="text-text-muted mx-auto mb-2" />
            <p className="text-sm text-text-muted">No active projects yet.</p>
            <Link href="/projects" className="text-xs text-accent mt-2 inline-block hover:underline">
              Create your first project →
            </Link>
          </Card>
        ) : (
          <div className="space-y-3">
            {activeProjects.slice(0, 4).map((project: any) => {
              const progress = getMilestoneProgress(project.milestones || []);
              return (
                <Link key={project.id} href={`/projects/${project.id}`}>
                  <Card hover>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-text-primary text-sm truncate">{project.name}</p>
                        <p className="text-xs text-text-muted mt-0.5">
                          {project.client?.name || "No client"}
                        </p>
                      </div>
                      <Badge label={project.status} status={project.status} />
                    </div>
                    <ProgressBar value={progress} showLabel size="sm" />
                    {project.deadline && (
                      <div className="flex items-center gap-1 mt-2 text-xs text-text-muted">
                        <Clock size={11} />
                        Due {formatDate(project.deadline)}
                      </div>
                    )}
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Overdue Milestones */}
      {overdueMilestones.length > 0 && (
        <div>
          <h2 className="font-semibold text-text-primary mb-3 flex items-center gap-2">
            <AlertCircle size={16} className="text-danger" />
            Overdue Milestones
          </h2>
          <div className="space-y-2">
            {overdueMilestones.slice(0, 3).map((m: any) => (
              <div
                key={m.id}
                className="flex items-center gap-3 p-3 bg-red-50 border border-red-100 rounded-xl text-sm"
              >
                <div className="w-2 h-2 rounded-full bg-danger flex-shrink-0" />
                <span className="text-text-primary font-medium">{m.title}</span>
                <span className="text-xs text-danger ml-auto">
                  {formatDate(m.due_date)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
