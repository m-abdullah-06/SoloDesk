"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Project, Milestone, ProjectUpdate, ClientMessage, Deliverable } from "@/types";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input, Textarea } from "@/components/ui/Input";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { ProjectForm } from "@/components/projects/ProjectForm";
import { MilestoneList } from "@/components/projects/MilestoneList";
import { DeliverablesSection } from "@/components/projects/DeliverablesSection";
import { formatDate, formatCurrency, getMilestoneProgress } from "@/lib/utils";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft, Edit, Link2, Eye, Plus, Send,
  MessageSquare, Clock, Sparkles, Copy, Check, ToggleLeft, ToggleRight
} from "lucide-react";
import Link from "next/link";

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [updates, setUpdates] = useState<ProjectUpdate[]>([]);
  const [messages, setMessages] = useState<ClientMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEdit, setShowEdit] = useState(false);
  const [showUpdate, setShowUpdate] = useState(false);
  const [updateText, setUpdateText] = useState("");
  const [posting, setPosting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [proposals, setProposals] = useState<any[]>([]);
  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);
  const [activeTab, setActiveTab] = useState<"milestones" | "updates" | "messages" | "invoices" | "proposals" | "deliverables">("milestones");
  const [replyText, setReplyText] = useState("");
  const [replying, setReplying] = useState(false);
  const supabase = createClient();

  async function load() {
    const { data: p } = await supabase
      .from("projects")
      .select("*, client:clients(name, email, whatsapp)")
      .eq("id", id)
      .single();

    if (!p) {
      setProject(null);
      setLoading(false);
      return;
    }

    const [{ data: m }, { data: u }, { data: msg }, { data: inv }, { data: prop }, { data: deliv }] = await Promise.all([
      supabase.from("milestones").select("*").eq("project_id", id).order("sort_order"),
      supabase.from("project_updates").select("*").eq("project_id", id).order("created_at", { ascending: false }),
      supabase.from("client_messages").select("*").eq("project_id", id).order("created_at", { ascending: true }),
      supabase.from("invoices").select("*").eq("project_id", id).order("created_at", { ascending: false }),
      supabase.from("proposals").select("*").eq("client_id", p.client_id || "").order("created_at", { ascending: false }),
      supabase.from("project_deliverables").select("*").eq("project_id", id).order("created_at", { ascending: false }),
    ]);

    setProject(p);
    setMilestones(m || []);
    setUpdates(u || []);
    setMessages(msg || []);
    setInvoices(inv || []);
    setProposals(prop || []);
    setDeliverables(deliv || []);
    setLoading(false);
    // Mark messages as read
    if (msg?.some((m) => !m.read)) {
      await supabase.from("client_messages").update({ read: true }).eq("project_id", id).eq("read", false);
    }
  }

  useEffect(() => { load(); }, [id]);

  async function postUpdate() {
    if (!updateText.trim()) return;
    setPosting(true);
    await supabase.from("project_updates").insert({ project_id: id, message: updateText });
    setUpdateText("");
    setShowUpdate(false);
    setPosting(false);
    load();
  }

  async function sendReply() {
    if (!replyText.trim()) return;
    setReplying(true);
    try {
      await supabase.from("client_messages").insert({
        project_id: id,
        message: replyText,
        sender: "freelancer",
        client_name: null,
        client_email: null,
      });
      setReplyText("");
      load();
    } catch (e) {
      console.error(e);
    } finally {
      setReplying(false);
    }
  }

  async function togglePortal() {
    if (!project) return;
    await supabase.from("projects").update({ portal_enabled: !project.portal_enabled }).eq("id", id);
    setProject({ ...project, portal_enabled: !project.portal_enabled });
  }

  function copyPortalLink() {
    const url = `${window.location.origin}/portal/${project?.portal_token}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading) return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => <div key={i} className="h-28 rounded-2xl shimmer" />)}
    </div>
  );

  if (!project) return <div className="text-center py-16 text-text-muted">Project not found.</div>;

  const progress = getMilestoneProgress(milestones);
  const portalUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/portal/${project.portal_token}`;

  return (
    <div className="space-y-5">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-text-muted hover:text-text-primary transition-colors">
        <ArrowLeft size={16} /> Projects
      </button>

      {/* Header Card */}
      <Card glow>
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex-1 min-w-0">
            <h1 className="font-display text-xl font-bold text-text-primary">{project.name}</h1>
            <p className="text-sm text-text-muted mt-0.5">
              {(project as any).client?.name || "No client"}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => setShowEdit(true)}>
            <Edit size={14} /> Edit
          </Button>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <Badge label={project.status} status={project.status} />
          <Badge label={project.payment_status} status={project.payment_status} />
          {project.currency && project.budget && (
            <span className="text-xs font-semibold text-accent bg-accent-light px-2.5 py-0.5 rounded-full">
              {formatCurrency(project.budget, project.currency)}
            </span>
          )}
          {project.deadline && (
            <span className="text-xs text-text-muted flex items-center gap-1">
              <Clock size={11} /> Due {formatDate(project.deadline)}
            </span>
          )}
        </div>

        <ProgressBar value={progress} showLabel />
      </Card>

      {/* Portal Card */}
      <Card>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-semibold text-text-primary text-sm">Client Portal</h3>
            <p className="text-xs text-text-muted mt-0.5">Share this link — no login required</p>
          </div>
          <button onClick={togglePortal} className="text-text-muted hover:text-accent transition-colors">
            {project.portal_enabled
              ? <ToggleRight size={28} className="text-accent" />
              : <ToggleLeft size={28} />
            }
          </button>
        </div>
        {project.portal_enabled && (
          <div className="flex items-center gap-2">
            <code className="flex-1 text-xs bg-bg-elevated rounded-xl px-3 py-2.5 text-text-secondary truncate font-mono">
              {portalUrl}
            </code>
            <Button variant="outline" size="sm" onClick={copyPortalLink}>
              {copied ? <Check size={14} className="text-success" /> : <Copy size={14} />}
            </Button>
            <a href={portalUrl} target="_blank" rel="noreferrer">
              <Button variant="ghost" size="sm"><Eye size={14} /></Button>
            </a>
          </div>
        )}
      </Card>

      {/* Quick Actions */}
      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={() => setShowUpdate(true)} className="flex-1">
          <Send size={14} /> Post Update
        </Button>
        <Link href={`/ai?project_id=${id}`} className="flex-1">
          <Button size="sm" variant="outline" className="w-full">
            <Sparkles size={14} /> AI Message
          </Button>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border overflow-x-auto">
        {(["milestones", "updates", "deliverables", "messages", "invoices", "proposals"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-sm font-medium capitalize transition-all border-b-2 -mb-px whitespace-nowrap ${
              activeTab === tab
                ? "border-accent text-accent"
                : "border-transparent text-text-muted hover:text-text-secondary"
            }`}
          >
            {tab}
            {tab === "messages" && messages.filter((m) => !m.read).length > 0 && (
              <span className="ml-1.5 bg-accent text-white text-xs px-1.5 py-0.5 rounded-full">
                {messages.filter((m) => !m.read).length}
              </span>
            )}
            {tab === "deliverables" && deliverables.length > 0 && (
              <span className="ml-1.5 bg-green-500 text-white text-xs px-1.5 py-0.5 rounded-full font-bold">
                {deliverables.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "milestones" && (
        <MilestoneList
          projectId={id}
          milestones={milestones}
          onRefresh={load}
        />
      )}

      {activeTab === "updates" && (
        <div className="space-y-3">
          <Button size="sm" onClick={() => setShowUpdate(true)}>
            <Plus size={14} /> Post Update
          </Button>
          {updates.length === 0 ? (
            <Card className="text-center py-8">
              <p className="text-sm text-text-muted">No updates posted yet.</p>
            </Card>
          ) : (
            updates.map((u) => (
              <Card key={u.id}>
                <p className="text-sm text-text-primary">{u.message}</p>
                <p className="text-xs text-text-muted mt-2">{formatDate(u.created_at)}</p>
              </Card>
            ))
          )}
        </div>
      )}

      {activeTab === "invoices" && (
        <div className="space-y-3">
          {invoices.length === 0 ? (
            <Card className="text-center py-8">
              <p className="text-sm text-text-muted">No invoices for this project.</p>
            </Card>
          ) : (
            invoices.map((inv) => (
              <Link key={inv.id} href={`/invoices/${inv.id}`}>
                <Card hover>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-text-primary">{inv.invoice_number}</p>
                      <p className="text-xs text-text-muted">{formatDate(inv.issue_date)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-accent">{formatCurrency(inv.total, inv.currency)}</p>
                      <Badge label={inv.status} status={inv.status} />
                    </div>
                  </div>
                </Card>
              </Link>
            ))
          )}
        </div>
      )}

      {activeTab === "proposals" && (
        <div className="space-y-3">
          {proposals.length === 0 ? (
            <Card className="text-center py-8">
              <p className="text-sm text-text-muted">No proposals found for this client.</p>
            </Card>
          ) : (
            proposals.map((prop) => (
              <Link key={prop.id} href={`/proposals/${prop.id}`}>
                <Card hover>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-text-primary">{prop.title}</p>
                      <p className="text-xs text-text-muted">{formatDate(prop.created_at)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-accent">{formatCurrency(prop.total_amount, prop.currency)}</p>
                      <Badge label={prop.status} status={prop.status} />
                    </div>
                  </div>
                </Card>
              </Link>
            ))
          )}
        </div>
      )}

      {activeTab === "messages" && (
        <div className="space-y-4">
          <Card className="flex flex-col h-[450px] !p-0 overflow-hidden border border-border bg-card">
            {/* Chat header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-border bg-muted/10">
              <div>
                <h4 className="text-sm font-semibold text-text-primary">Conversation History</h4>
                <p className="text-[11px] text-text-muted">Direct messaging with client</p>
              </div>
            </div>

            {/* Chat messages area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-6">
                  <MessageSquare size={32} className="text-text-muted/30 mb-2" />
                  <p className="text-sm font-medium text-text-secondary">No messages yet</p>
                  <p className="text-xs text-text-muted mt-0.5 max-w-[280px]">
                    Share the portal link with your client. When they reply, the messages will appear here.
                  </p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isClient = msg.sender !== "freelancer";
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col max-w-[80%] ${
                        isClient ? "mr-auto items-start" : "ml-auto items-end"
                      }`}
                    >
                      {isClient && (msg.client_name || msg.client_email) && (
                        <span className="text-[10px] text-text-muted mb-0.5 px-2">
                          {msg.client_name || msg.client_email}
                        </span>
                      )}
                      <div
                        className={`rounded-2xl px-4 py-2 text-sm leading-relaxed ${
                          isClient
                            ? "bg-bg-elevated text-text-primary rounded-tl-none border border-border"
                            : "bg-accent text-white rounded-tr-none"
                        }`}
                      >
                        {msg.message}
                      </div>
                      <span className="text-[9px] text-text-muted mt-1 px-2">
                        {formatDate(msg.created_at)}
                      </span>
                    </div>
                  );
                })
              )}
            </div>

            {/* Chat input box */}
            <div className="p-3 border-t border-border bg-muted/5 flex gap-2">
              <input
                type="text"
                placeholder="Type your reply..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendReply();
                  }
                }}
                className="flex-1 min-w-0 bg-bg-elevated border border-border rounded-xl px-4 py-2 text-sm text-text-primary focus:outline-none focus:border-accent"
              />
              <Button onClick={sendReply} loading={replying} disabled={!replyText.trim()} className="px-4 flex-shrink-0">
                <Send size={14} /> Send
              </Button>
            </div>
          </Card>
        </div>
      )}

      {activeTab === "deliverables" && (
        <DeliverablesSection
          projectId={id}
          userId={project.user_id}
          deliverables={deliverables}
          onRefresh={load}
        />
      )}

      <Modal open={showEdit} onClose={() => setShowEdit(false)} title="Edit Project">
        <ProjectForm
          project={project}
          onSuccess={() => { setShowEdit(false); load(); }}
          onCancel={() => setShowEdit(false)}
        />
      </Modal>

      <Modal open={showUpdate} onClose={() => setShowUpdate(false)} title="Post Update to Client">
        <div className="space-y-4">
          <Textarea
            label="Update message"
            placeholder="Completed the homepage design, moving to mobile responsiveness..."
            value={updateText}
            onChange={(e) => setUpdateText(e.target.value)}
            rows={4}
          />
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setShowUpdate(false)} className="flex-1">Cancel</Button>
            <Button onClick={postUpdate} loading={posting} className="flex-1">
              <Send size={14} /> Post Update
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
