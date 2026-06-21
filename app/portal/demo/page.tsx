"use client";
import { useState, useEffect } from "react";
import { getMilestoneProgress, formatDate, isOverdue } from "@/lib/utils";
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
import Link from "next/link";

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

export default function DemoPortalPage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"status" | "deliverables" | "documents">("status");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: "demo-msg-1",
      message: "Hey Abdullah, I just wanted to check if you started on the logo concepts?",
      sender: "client",
      created_at: "2026-04-12T09:00:00Z"
    },
    {
      id: "demo-msg-2",
      message: "Yes! Discovery is completed. I'm currently sketching ideas for Round 1. Should have them ready by tomorrow.",
      sender: "freelancer",
      created_at: "2026-04-12T10:15:00Z"
    },
    {
      id: "demo-msg-3",
      message: "Awesome, looking forward to it!",
      sender: "client",
      created_at: "2026-04-12T10:30:00Z"
    }
  ]);

  useEffect(() => { setMounted(true); }, []);
  const isDark = theme === "dark";

  function sendMessage() {
    if (!message.trim()) return;
    setSending(true);
    setTimeout(() => {
      const newMsg = {
        id: `demo-msg-${Date.now()}`,
        message: message,
        sender: "client",
        created_at: new Date().toISOString()
      };
      setMessages((prev) => [...prev, newMsg]);
      setMessage("");
      setSending(false);

      // Simulate freelancer reply
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: `demo-msg-reply-${Date.now()}`,
            message: "Thanks for the message! (This is an auto-reply simulation in Demo mode)",
            sender: "freelancer",
            created_at: new Date().toISOString()
          }
        ]);
      }, 1500);
    }, 400);
  }

  // Mock Data
  const project = {
    name: "Alpha Synergies Rebranding",
    description: "Full visual identity overhaul including logo, typography, and marketing assets.",
    status: "in_progress",
    deadline: "2026-05-15",
  };

  const freelancer = {
    name: "Abdullah Muhammad",
    tagline: "Elite Fractional CTO & Product Designer",
    avatar_url: null,
  };

  const milestones = [
    { id: 1, title: "Discovery & Moodboards", status: "done", description: "Deep dive into brand values and visual direction.", due_date: "2026-04-10" },
    { id: 2, title: "Logo Concepts (Round 1)", status: "done", description: "3 unique directions for the new identity.", due_date: "2026-04-14" },
    { id: 3, title: "Website UI/UX Design", status: "in_progress", description: "Figma prototypes for the new landing page.", due_date: "2026-04-20" },
    { id: 4, title: "Final Asset Delivery", status: "pending", description: "High-res exports and brand guide.", due_date: "2026-05-01" },
  ];

  const updates = [
    { id: 1, message: "Completed the color palette selection. Moving on to the responsive layout design.", created_at: "2026-04-17" },
    { id: 2, message: "Round 1 feedback received and incorporated into the next iteration.", created_at: "2026-04-15" },
  ];

  const invoices = [
    { id: 1, invoice_number: "INV-2026-001", issue_date: "2026-04-01", status: "paid", total: 1500, currency: "USD" },
    { id: 2, invoice_number: "INV-2026-002", issue_date: "2026-04-15", status: "sent", total: 2500, currency: "USD" },
  ];

  const proposals = [
    { id: 1, title: "Initial Scope & Rebranding Proposal", created_at: "2026-03-25", status: "completed", total_amount: 4000, currency: "USD" }
  ];

  const mockDeliverables = [
    {
      id: "demo-del-1",
      title: "Final Logo Package",
      description: "All formats: SVG, PNG, PDF, and high-res source files.",
      file_name: "logo-final-v3.zip",
      file_size: 4404019, // 4.2 MB
      file_type: "application/zip",
      is_external: false,
      file_url: "#",
      created_at: "2026-04-18T10:00:00Z"
    },
    {
      id: "demo-del-2",
      title: "Brand Guidelines PDF",
      description: "Comprehensive guide on color palettes, typography, and logo usage rules.",
      file_name: "brand-guide.pdf",
      file_size: 2202009, // 2.1 MB
      file_type: "application/pdf",
      is_external: false,
      file_url: "#",
      created_at: "2026-04-18T10:15:00Z"
    },
    {
      id: "demo-del-3",
      title: "Figma Source Files",
      description: "Interactive UI prototype and component library in Figma.",
      file_name: null,
      file_size: null,
      file_type: "link",
      is_external: true,
      file_url: "https://figma.com",
      created_at: "2026-04-18T10:30:00Z"
    }
  ];

  const progress = getMilestoneProgress(milestones);
  const doneCount = milestones.filter((m) => m.status === "done" || m.status === "approved").length;

  return (
    <div className="min-h-screen bg-background" style={{ fontFamily: "Montserrat,system-ui,sans-serif" }}>
      {/* Simulation Banner */}
      <div className="bg-orange-500/10 text-orange-500 border-b border-orange-500/20 py-2 px-4 text-center text-[10px] font-bold uppercase tracking-[0.2em] shadow-lg sticky top-0 z-[60] backdrop-blur-md flex items-center justify-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
        Demo Mode: This is how your clients see their project
      </div>

      {/* ── Ambient glow ── */}
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
              <AvatarEl name={freelancer.name} src={freelancer.avatar_url} />
              <div>
                <p className="text-sm font-semibold text-foreground">{freelancer.name}</p>
                {freelancer.tagline && <p className="text-[11px] text-muted-foreground">{freelancer.tagline}</p>}
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
                >
                  {isDark ? <Sun size={14} /> : <Moon size={14} />}
                </button>
              )}

              {/* Exit button */}
              <Link href="/">
                <button className="text-[10px] font-bold text-orange-500 bg-orange-500/10 border border-orange-500/20 px-3.5 py-2 rounded-xl uppercase tracking-wider hover:bg-orange-500/20 transition-all">
                  Exit Demo
                </button>
              </Link>
            </div>
          </div>

          {/* Project hero card */}
          <CardShell className="p-5 mb-0 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 pointer-events-none"
              style={{ background: "radial-gradient(circle at top right,rgba(245,121,10,0.08) 0%,transparent 70%)" }} />
            <div className="relative">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <h1 className="text-lg font-bold text-foreground mb-1 leading-tight">{project.name}</h1>
                  <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">{project.description}</p>
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
                  <span>{doneCount}/{milestones.length} milestones</span>
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
                {tab === "deliverables" && mockDeliverables.length > 0 && (
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
            </section>

            {/* Recent Activity */}
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
          </>
        )}

        {/* DELIVERABLES TAB */}
        {activeTab === "deliverables" && (
          <div className="space-y-6">
            <section>
              <SectionTitle>Deliverables</SectionTitle>
              <div className="space-y-3">
                {mockDeliverables.map((d) => (
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
                      <button
                        onClick={() => alert("File downloading/linking is simulated in demo mode.")}
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
                      </button>
                    </div>
                  </CardShell>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* DOCUMENTS TAB */}
        {activeTab === "documents" && (
          <div className="space-y-6">
            {/* Invoices */}
            <section>
              <SectionTitle>Invoices</SectionTitle>
              <div className="space-y-2.5">
                {invoices.map((inv) => (
                  <div key={inv.id} className="group block cursor-pointer" onClick={() => alert("Invoice viewing is simulated in demo mode.")}>
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
                  </div>
                ))}
              </div>
            </section>

            {/* Proposals */}
            <section>
              <SectionTitle>Proposals</SectionTitle>
              <div className="space-y-2.5">
                {proposals.map((prop) => (
                  <div key={prop.id} className="group block cursor-pointer" onClick={() => alert("Proposal viewing is simulated in demo mode.")}>
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
                  </div>
                ))}
              </div>
            </section>

            {/* Pitch Banner */}
            <div className="p-8 rounded-[2rem] bg-neutral-900 text-white text-center relative overflow-hidden">
               <div className="relative z-10">
                 <h3 className="text-xl font-bold mb-2">Need your own client portal?</h3>
                 <p className="text-neutral-400 text-sm mb-6 max-w-xs mx-auto">Start managing clients like a pro. Set up your first project in 60 seconds.</p>
                 <Link href="/signup">
                    <button className="px-8 py-3 bg-orange-500 text-white font-semibold rounded-xl hover:scale-105 transition-all" style={{ boxShadow: "0 4px 15px rgba(245,121,10,0.3)" }}>
                      Get Started Free
                    </button>
                 </Link>
               </div>
               <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/20 rounded-full -mr-16 -mt-16 blur-3xl opacity-50"></div>
            </div>
          </div>
        )}

        {/* MESSAGE BOX */}
        <CardShell className="overflow-hidden">
          <div className="flex items-center gap-2.5 px-5 py-4 border-b border-border">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "rgba(245,121,10,0.1)", border: "1px solid rgba(245,121,10,0.2)" }}>
              <MessageSquare size={15} className="text-orange-500" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-foreground">Message Feed</h2>
              <p className="text-[11px] text-muted-foreground">Chat with {freelancer.name}</p>
            </div>
          </div>

          <div className="p-5 space-y-4">
            {/* Chat Thread */}
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
                        <AvatarEl name={freelancer.name} src={freelancer.avatar_url} size="sm" />
                        <span className="text-[9px] text-muted-foreground font-semibold">
                          {freelancer.name}
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

            <div className="flex items-center justify-between px-3 py-2 rounded-xl border border-border bg-muted">
              <div className="flex items-center gap-2">
                <AvatarEl name="Demo Client" size="sm" />
                <p className="text-xs text-muted-foreground">
                  Messaging as <span className="font-semibold text-foreground">Demo Client</span>
                </p>
              </div>
            </div>

            <textarea
              placeholder="Type your message here…"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={2}
              className="w-full px-3.5 py-3 rounded-xl text-xs text-foreground outline-none resize-none transition-all"
              style={{ background: "var(--input)", border: "1px solid var(--border)" }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
            />

            <div className="flex items-center justify-between">
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Simulated interactive chat mode</div>
              <button
                onClick={sendMessage}
                disabled={sending || !message.trim()}
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
