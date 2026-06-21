"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { getMilestoneProgress, formatDate, isOverdue } from "@/lib/utils";
import { useParams } from "next/navigation";
import { useTheme } from "next-themes";
import {
  Check,
  Clock,
  Circle,
  Send,
  CheckCircle,
  FileText,
  MessageSquare,
  Zap,
  AlertCircle,
  ExternalLink,
  Sun,
  Moon,
  Folder,
  Package,
  Image,
  Archive,
  FileVideo,
  File,
  Download,
  Link2,
} from "lucide-react";

/* ─── Avatar ─── */
function getInitials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

function AvatarEl({ name, src, size = "md" }: { name: string; src?: string | null; size?: "sm" | "md" }) {
  const s = size === "md" ? "w-10 h-10 text-sm" : "w-7 h-7 text-xs";
  if (src) return <img src={src} alt={name} className={`${s} rounded-full object-cover`} />;
  return (
    <div
      className={`${s} rounded-full flex items-center justify-center font-bold text-orange-500 flex-shrink-0`}
      style={{ background: "rgba(245,121,10,0.12)", border: "1px solid rgba(245,121,10,0.25)" }}
    >
      {getInitials(name)}
    </div>
  );
}

/* ─── Status icon ─── */
function StatusIcon({ status }: { status: string }) {
  if (status === "done" || status === "approved")
    return (
      <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)" }}>
        <CheckCircle size={13} className="text-emerald-500" />
      </div>
    );
  if (status === "in_progress")
    return (
      <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: "rgba(245,121,10,0.15)", border: "1px solid rgba(245,121,10,0.3)" }}>
        <Clock size={13} className="text-orange-500" />
      </div>
    );
  return (
    <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: "var(--muted)", border: "1px solid var(--border)" }}>
      <Circle size={11} className="text-muted-foreground" />
    </div>
  );
}

/* ─── Status badge ─── */
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    done:        "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/25",
    approved:    "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/25",
    in_progress: "bg-orange-50  text-orange-600  border-orange-200  dark:bg-orange-500/15  dark:text-orange-400  dark:border-orange-500/25",
    pending:     "bg-gray-100   text-gray-500    border-gray-200    dark:bg-white/5        dark:text-white/40    dark:border-white/10",
    sent:        "bg-blue-50    text-blue-600    border-blue-200    dark:bg-blue-500/15    dark:text-blue-400    dark:border-blue-500/25",
    paid:        "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/25",
    overdue:     "bg-red-50     text-red-600     border-red-200     dark:bg-red-500/15     dark:text-red-400     dark:border-red-500/25",
    partial:     "bg-amber-50   text-amber-600   border-amber-200   dark:bg-amber-500/15   dark:text-amber-400   dark:border-amber-500/25",
    completed:   "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/25",
    active:      "bg-orange-50  text-orange-600  border-orange-200  dark:bg-orange-500/15  dark:text-orange-400  dark:border-orange-500/25",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border capitalize tracking-wide ${map[status] ?? "bg-gray-100 text-gray-500 border-gray-200 dark:bg-white/5 dark:text-white/40 dark:border-white/10"}`}>
      {status.replace(/_/g, " ")}
    </span>
  );
}

/* ─── Section heading ─── */
function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-[10px] font-bold uppercase tracking-[0.15em] mb-3 text-muted-foreground">
      {children}
    </h2>
  );
}

/* ─── Card shell (adapts to theme) ─── */
function CardShell({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-2xl border border-border bg-card ${className}`}
      style={{ boxShadow: "var(--card-shadow)" }}
    >
      {children}
    </div>
  );
}

/* ─── Empty state ─── */
function EmptyCard({ icon: Icon, label }: { icon: any; label: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 rounded-2xl text-center border border-dashed border-border">
      <Icon size={22} className="text-muted-foreground/30 mb-2" />
      <p className="text-sm text-muted-foreground/50">{label}</p>
    </div>
  );
}

function fileIcon(fileType: string | null, isExternal: boolean) {
  if (isExternal) return <Link2 size={20} className="text-indigo-400" />;
  if (!fileType) return <File size={20} className="text-muted-foreground" />;
  if (fileType.includes("image")) return <Image size={20} className="text-purple-400" />;
  if (fileType.includes("pdf")) return <FileText size={20} className="text-red-400" />;
  if (fileType.includes("video")) return <FileVideo size={20} className="text-blue-400" />;
  if (fileType.includes("zip") || fileType.includes("rar") || fileType.includes("7z"))
    return <Archive size={20} className="text-amber-400" />;
  return <File size={20} className="text-muted-foreground" />;
}

function formatBytes(bytes: number | null) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/* ══════════════════════════════════════════════════════ */

export default function ClientPortalPage() {
  const { token } = useParams<{ token: string }>();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [project, setProject] = useState<any>(null);
  const [milestones, setMilestones] = useState<any[]>([]);
  const [updates, setUpdates] = useState<any[]>([]);
  const [freelancer, setFreelancer] = useState<any>(null);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [proposals, setProposals] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"status" | "deliverables" | "documents">("status");
  const [deliverables, setDeliverables] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [nameStored, setNameStored] = useState(false);

  const supabase = createClient();

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const stored = localStorage.getItem("solodesk_client");
    if (stored) {
      const { name, email } = JSON.parse(stored);
      setClientName(name);
      setClientEmail(email);
      setNameStored(true);
    }
  }, []);

  useEffect(() => {
    async function load() {
      const { data: proj } = await supabase
        .from("projects")
        .select("*, client:clients(name), freelancer:users(name, avatar_url, tagline)")
        .eq("portal_token", token)
        .eq("portal_enabled", true)
        .single();

      if (!proj) { setNotFound(true); setLoading(false); return; }
      setProject(proj);

      const [{ data: m }, { data: u }, { data: inv }, { data: prop }, { data: deliv }, { data: msg }] = await Promise.all([
        supabase.from("milestones").select("*").eq("project_id", proj.id).order("sort_order"),
        supabase.from("project_updates").select("*").eq("project_id", proj.id).order("created_at", { ascending: false }),
        supabase.from("invoices").select("*").eq("project_id", proj.id).in("status", ["sent", "paid", "partial", "overdue"]).order("created_at", { ascending: false }),
        supabase.from("proposals").select("*").eq("client_id", proj.client_id).order("created_at", { ascending: false }),
        supabase.from("project_deliverables").select("*").eq("project_id", proj.id).order("created_at", { ascending: false }),
        supabase.from("client_messages").select("*").eq("project_id", proj.id).order("created_at", { ascending: true }),
      ]);

      setMilestones(m || []);
      setUpdates(u || []);
      setInvoices(inv || []);
      setProposals(prop || []);
      setDeliverables(deliv || []);
      setMessages(msg || []);
      setFreelancer((proj as any).freelancer);
      setLoading(false);
    }
    load();
  }, [token]);

  async function sendMessage() {
    if (!clientName.trim() || !clientEmail.trim() || !message.trim()) return;
    setSending(true);
    try {
      await supabase.from("client_messages").insert({
        project_id: project.id,
        client_name: clientName,
        client_email: clientEmail,
        message,
        sender: "client"
      });
      localStorage.setItem("solodesk_client", JSON.stringify({ name: clientName, email: clientEmail }));
      setNameStored(true);
      setMessage("");
      setSent(true);
      setTimeout(() => setSent(false), 3000);

      const { data: msg } = await supabase
        .from("client_messages")
        .select("*")
        .eq("project_id", project.id)
        .order("created_at", { ascending: true });
      setMessages(msg || []);
    } catch (e) {
      console.error(e);
    } finally {
      setSending(false);
    }
  }

  /* ── Loading ── */
  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-9 h-9 rounded-full border-2 border-t-orange-500 border-orange-500/20 animate-spin" />
        <p className="text-xs text-muted-foreground tracking-widest uppercase">Loading portal</p>
      </div>
    </div>
  );

  /* ── Not found ── */
  if (notFound) return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 text-center">
      <div className="w-20 h-20 rounded-3xl flex items-center justify-center mb-6" style={{ background: "rgba(245,121,10,0.08)", border: "1px solid rgba(245,121,10,0.2)" }}>
        <AlertCircle size={32} className="text-orange-500" />
      </div>
      <h1 className="text-2xl font-bold text-foreground mb-3">Portal not found</h1>
      <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">This link may have expired or been disabled by the freelancer.</p>
    </div>
  );

  const progress = getMilestoneProgress(milestones);
  const done = milestones.filter((m) => m.status === "done" || m.status === "approved").length;
  const isDark = theme === "dark";

  return (
    <div className="min-h-screen bg-background" style={{ fontFamily: "Montserrat,system-ui,sans-serif" }}>

      {/* ── Ambient glow (subtle in light, more visible in dark) ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden>
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(245,121,10,0.08) 0%, transparent 70%)", filter: "blur(60px)" }} />
        <div className="absolute -top-20 right-0 w-[400px] h-[400px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(245,121,10,0.05) 0%, transparent 70%)", filter: "blur(80px)" }} />
      </div>

      {/* ══ HEADER ══ */}
      <div className="relative" style={{ background: "linear-gradient(180deg,rgba(245,121,10,0.05) 0%,transparent 100%)", borderBottom: "1px solid var(--border)" }}>
        <div className="max-w-2xl mx-auto px-5 pt-6 pb-0">

          {/* Top bar */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <AvatarEl name={freelancer?.name || "F"} src={freelancer?.avatar_url} />
              <div>
                <p className="text-sm font-semibold text-foreground">{freelancer?.name}</p>
                {freelancer?.tagline && <p className="text-[11px] text-muted-foreground">{freelancer.tagline}</p>}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Theme toggle */}
              {mounted && (
                <button
                  onClick={() => setTheme(isDark ? "light" : "dark")}
                  aria-label="Toggle theme"
                  className="w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200 text-muted-foreground hover:text-orange-500"
                  style={{ background: "var(--muted)", border: "1px solid var(--border)" }}
                  onMouseEnter={(e) => { const el = e.currentTarget as HTMLButtonElement; el.style.borderColor = "rgba(245,121,10,0.4)"; el.style.background = "rgba(245,121,10,0.08)"; }}
                  onMouseLeave={(e) => { const el = e.currentTarget as HTMLButtonElement; el.style.borderColor = "var(--border)"; el.style.background = "var(--muted)"; }}
                >
                  {isDark ? <Sun size={14} /> : <Moon size={14} />}
                </button>
              )}
              {/* Live pill */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold tracking-wide text-orange-500"
                style={{ background: "rgba(245,121,10,0.1)", border: "1px solid rgba(245,121,10,0.22)" }}>
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                Live Portal
              </div>
            </div>
          </div>

          {/* Project hero card */}
          <CardShell className="p-5 mb-0 relative overflow-hidden">
            {/* corner decoration */}
            <div className="absolute top-0 right-0 w-40 h-40 pointer-events-none"
              style={{ background: "radial-gradient(circle at top right,rgba(245,121,10,0.08) 0%,transparent 70%)" }} />
            <div className="relative">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <h1 className="text-lg font-bold text-foreground mb-1 leading-tight">{project.name}</h1>
                  {project.description && <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">{project.description}</p>}
                </div>
                <StatusBadge status={project.status} />
              </div>

              {/* Stats row */}
              <div className="flex items-center gap-4 mb-4">
                {project.deadline && (
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <Clock size={11} className="text-orange-400" />
                    <span>Due {formatDate(project.deadline)}</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <Check size={11} className="text-emerald-500" />
                  <span>{done}/{milestones.length} milestones</span>
                </div>
              </div>

              {/* Progress bar */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Progress</span>
                  <span className="text-sm font-bold text-orange-500">{progress}%</span>
                </div>
                <div className="h-1.5 w-full rounded-full overflow-hidden bg-muted">
                  <div className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${progress}%`, background: "linear-gradient(90deg,#F5790A 0%,#ff9a3c 100%)", boxShadow: "0 0 8px rgba(245,121,10,0.4)" }} />
                </div>
              </div>
            </div>
          </CardShell>
        </div>

        {/* Tabs */}
        <div className="max-w-2xl mx-auto px-5 mt-5">
          <div className="flex gap-1 p-1 rounded-xl w-fit bg-muted">
            {(["status", "deliverables", "documents"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="px-5 py-2 text-xs font-semibold rounded-lg transition-all duration-200 capitalize tracking-wide flex items-center gap-1.5"
                style={
                  activeTab === tab
                    ? { background: "var(--card)", color: "#F5790A", border: "1px solid rgba(245,121,10,0.2)", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }
                    : { color: "var(--muted-foreground)", border: "1px solid transparent" }
                }
              >
                {tab === "status" ? "Project Status" : tab === "deliverables" ? "Deliverables" : "Documents"}
                {tab === "deliverables" && deliverables.length > 0 && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                )}
              </button>
            ))}
          </div>
        </div>
        <div className="h-6" />
      </div>

      {/* ══ CONTENT ══ */}
      <div className="max-w-2xl mx-auto px-5 py-6 space-y-5 pb-24">

        {/* STATUS TAB */}
        {activeTab === "status" && (
          <>
            {/* Milestones */}
            <section>
              <SectionTitle>Milestones</SectionTitle>
              {milestones.length === 0 ? (
                <EmptyCard icon={Zap} label="No milestones defined yet" />
              ) : (
                <div className="space-y-2.5">
                  {milestones.map((m, i) => {
                    const isDone = m.status === "done" || m.status === "approved";
                    const overdue = isOverdue(m.due_date) && m.status !== "done";
                    return (
                      <div
                        key={m.id}
                        className="flex items-start gap-3.5 p-4 rounded-2xl transition-all duration-300 border"
                        style={{
                          background: isDone ? "rgba(16,185,129,0.05)" : overdue ? "rgba(239,68,68,0.05)" : "var(--card)",
                          borderColor: isDone ? "rgba(16,185,129,0.2)" : overdue ? "rgba(239,68,68,0.2)" : "var(--border)",
                          animationDelay: `${i * 60}ms`,
                        }}
                      >
                        <StatusIcon status={m.status} />
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-semibold leading-snug ${isDone ? "line-through text-muted-foreground" : "text-foreground"}`}>
                            {m.title}
                          </p>
                          {m.description && <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{m.description}</p>}
                          <div className="flex items-center gap-2 mt-2 flex-wrap">
                            <StatusBadge status={m.status} />
                            {m.due_date && (
                              <span className={`text-[10px] flex items-center gap-1 ${overdue ? "text-red-500" : "text-muted-foreground"}`}>
                                <Clock size={9} /> {formatDate(m.due_date)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Recent Activity */}
            {updates.length > 0 && (
              <section>
                <SectionTitle>Recent Activity</SectionTitle>
                <div className="space-y-2.5">
                  {updates.map((u) => (
                    <CardShell key={u.id} className="p-4">
                      <p className="text-sm text-foreground leading-relaxed">{u.message}</p>
                      <p className="text-[10px] text-muted-foreground mt-2">{formatDate(u.created_at)}</p>
                    </CardShell>
                  ))}
                </div>
              </section>
            )}
          </>
        )}

        {/* DELIVERABLES TAB */}
        {activeTab === "deliverables" && (
          <div className="space-y-6">
            <section>
              <SectionTitle>Deliverables</SectionTitle>
              {deliverables.length === 0 ? (
                <EmptyCard icon={Package} label="Your freelancer hasn't shared any deliverables yet" />
              ) : (
                <div className="space-y-3">
                  {deliverables.map((d) => (
                    <CardShell key={d.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border-l-4 border-l-orange-500/80">
                      <div className="flex items-start gap-4">
                        <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0" 
                          style={{ background: "var(--muted)", border: "1px solid var(--border)" }}>
                          {fileIcon(d.file_type, d.is_external)}
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-sm font-semibold text-foreground leading-tight">{d.title}</h3>
                          {d.description && <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{d.description}</p>}
                          <p className="text-[10px] text-muted-foreground/60 mt-1.5 flex items-center gap-1.5">
                            {d.file_name && <span>{d.file_name}</span>}
                            {d.file_size && <span>· {formatBytes(d.file_size)}</span>}
                            <span>· {formatDate(d.created_at)}</span>
                          </p>
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        {d.file_url && (
                          <a
                            href={d.file_url}
                            target="_blank"
                            rel="noreferrer"
                            download={!d.is_external && d.file_name ? d.file_name : undefined}
                            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white transition-all duration-200"
                            style={{
                              background: "linear-gradient(135deg,#F5790A 0%,#e86d07 100%)",
                              boxShadow: "0 4px 12px rgba(245,121,10,0.15)",
                            }}
                          >
                            {d.is_external ? (
                              <><ExternalLink size={13} /> Open Link</>
                            ) : (
                              <><Download size={13} /> Download Files</>
                            )}
                          </a>
                        )}
                      </div>
                    </CardShell>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        {/* DOCUMENTS TAB */}
        {activeTab === "documents" && (
          <div className="space-y-6">
            {/* Invoices */}
            <section>
              <SectionTitle>Invoices</SectionTitle>
              {invoices.length === 0 ? (
                <EmptyCard icon={FileText} label="No invoices shared yet" />
              ) : (
                <div className="space-y-2.5">
                  {invoices.map((inv) => (
                    <a key={inv.id} href={`/portal/invoice/${inv.portal_token}`} target="_blank" rel="noreferrer" className="group block">
                      <CardShell className="flex items-center justify-between p-4 group-hover:border-orange-500/30 transition-all duration-200">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(245,121,10,0.08)", border: "1px solid rgba(245,121,10,0.18)" }}>
                            <FileText size={18} className="text-orange-500" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-foreground">{inv.invoice_number}</p>
                            <p className="text-[11px] text-muted-foreground">{formatDate(inv.issue_date)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <StatusBadge status={inv.status} />
                            <p className="text-sm font-bold text-foreground mt-1">
                              {inv.currency === "PKR" ? "Rs" : inv.currency === "USD" ? "$" : "£"} {inv.total.toLocaleString()}
                            </p>
                          </div>
                          <ExternalLink size={14} className="text-muted-foreground/30 group-hover:text-orange-500 transition-colors" />
                        </div>
                      </CardShell>
                    </a>
                  ))}
                </div>
              )}
            </section>

            {/* Proposals */}
            <section>
              <SectionTitle>Proposals</SectionTitle>
              {proposals.length === 0 ? (
                <EmptyCard icon={FileText} label="No proposals or quotes found" />
              ) : (
                <div className="space-y-2.5">
                  {proposals.map((prop) => (
                    <a key={prop.id} href={`/portal/proposal/${prop.portal_token}`} target="_blank" rel="noreferrer" className="group block">
                      <CardShell className="flex items-center justify-between p-4 group-hover:border-orange-500/30 transition-all duration-200">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.18)" }}>
                            <FileText size={18} className="text-indigo-500" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-foreground">{prop.title}</p>
                            <p className="text-[11px] text-muted-foreground">Issued {formatDate(prop.created_at)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <StatusBadge status={prop.status} />
                            <p className="text-sm font-bold text-foreground mt-1">
                              {prop.currency === "PKR" ? "Rs" : prop.currency === "USD" ? "$" : "£"} {prop.total_amount.toLocaleString()}
                            </p>
                          </div>
                          <ExternalLink size={14} className="text-muted-foreground/30 group-hover:text-orange-500 transition-colors" />
                        </div>
                      </CardShell>
                    </a>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        {/* MESSAGE BOX */}
        <CardShell className="overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-2.5 px-5 py-4 border-b border-border">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "rgba(245,121,10,0.1)", border: "1px solid rgba(245,121,10,0.2)" }}>
              <MessageSquare size={15} className="text-orange-500" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-foreground">Message Feed</h2>
              <p className="text-[11px] text-muted-foreground">Chat with {freelancer?.name || "the freelancer"}</p>
            </div>
          </div>

          <div className="p-5 space-y-4">
            {/* Chat Thread */}
            {messages.length > 0 && (
              <div className="max-h-[250px] overflow-y-auto space-y-3 pr-1 border-b border-border pb-4 mb-4">
                {messages.map((msg) => {
                  const isClient = msg.sender !== "freelancer";
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col max-w-[85%] ${
                        isClient ? "ml-auto items-end" : "mr-auto items-start"
                      }`}
                    >
                      {!isClient && (
                        <div className="flex items-center gap-1.5 mb-1 px-1">
                          <AvatarEl name={freelancer?.name || "F"} src={freelancer?.avatar_url} size="sm" />
                          <span className="text-[9px] text-muted-foreground font-semibold">
                            {freelancer?.name}
                          </span>
                        </div>
                      )}
                      <div
                        className={`rounded-2xl px-4 py-2 text-xs leading-relaxed ${
                          isClient
                            ? "bg-orange-500 text-white rounded-tr-none"
                            : "bg-muted text-foreground rounded-tl-none border border-border"
                        }`}
                      >
                        {msg.message}
                      </div>
                      <span className="text-[8px] text-muted-foreground/60 mt-1 px-1">
                        {formatDate(msg.created_at)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {!nameStored && (
              <div className="grid grid-cols-2 gap-3">
                {[
                  { val: clientName, set: setClientName, ph: "Your name", type: "text" },
                  { val: clientEmail, set: setClientEmail, ph: "Your email", type: "email" },
                ].map((f) => (
                  <input
                    key={f.ph}
                    type={f.type}
                    placeholder={f.ph}
                    value={f.val}
                    onChange={(e) => f.set(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs text-foreground outline-none transition-all"
                    style={{ background: "var(--input)", border: "1px solid var(--border)", color: "var(--foreground)" }}
                    onFocus={(e) => { e.target.style.borderColor = "rgba(245,121,10,0.5)"; e.target.style.boxShadow = "0 0 0 3px rgba(245,121,10,0.08)"; }}
                    onBlur={(e) => { e.target.style.borderColor = "var(--border)"; e.target.style.boxShadow = "none"; }}
                  />
                ))}
              </div>
            )}

            {nameStored && (
              <div className="flex items-center justify-between px-3 py-2 rounded-xl border border-border bg-muted">
                <div className="flex items-center gap-2">
                  <AvatarEl name={clientName} size="sm" />
                  <p className="text-xs text-muted-foreground">
                    Messaging as <span className="font-semibold text-foreground">{clientName}</span>
                  </p>
                </div>
                <button onClick={() => { setNameStored(false); localStorage.removeItem("solodesk_client"); }}
                  className="text-[10px] text-orange-500 hover:text-orange-600 transition-colors">
                  Change
                </button>
              </div>
            )}

            <textarea
              placeholder="Type your message here…"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={2}
              className="w-full px-3.5 py-3 rounded-xl text-xs text-foreground outline-none resize-none transition-all"
              style={{ background: "var(--input)", border: "1px solid var(--border)" }}
              onFocus={(e) => { e.target.style.borderColor = "rgba(245,121,10,0.5)"; e.target.style.boxShadow = "0 0 0 3px rgba(245,121,10,0.08)"; }}
              onBlur={(e) => { e.target.style.borderColor = "var(--border)"; e.target.style.boxShadow = "none"; }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
            />

            <div className="flex items-center justify-between">
              {sent ? (
                <div className="flex items-center gap-1.5 text-xs text-emerald-500">
                  <Check size={13} /> Message sent!
                </div>
              ) : <div />}
              <button
                onClick={sendMessage}
                disabled={sending || !message.trim() || !clientName.trim() || !clientEmail.trim()}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed text-white"
                style={{
                  background: sending ? "rgba(245,121,10,0.5)" : "linear-gradient(135deg,#F5790A 0%,#e86d07 100%)",
                  boxShadow: !sending ? "0 0 20px rgba(245,121,10,0.25)" : "none",
                }}
              >
                {sending ? (
                  <><div className="w-3.5 h-3.5 border border-white/30 border-t-white rounded-full animate-spin" /> Sending…</>
                ) : (
                  <><Send size={14} /> Send Message</>
                )}
              </button>
            </div>
          </div>
        </CardShell>

        {/* Footer */}
        <div className="text-center pt-4">
          <p className="text-[11px] text-muted-foreground/50">
            Powered by <span className="font-bold text-orange-500/70">SoloDesk</span> · The Freelancer OS
          </p>
        </div>
      </div>
    </div>
  );
}
