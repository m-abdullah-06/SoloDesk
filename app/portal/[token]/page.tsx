"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { Input, Textarea } from "@/components/ui/Input";
import { getMilestoneProgress, formatDate, isOverdue } from "@/lib/utils";
import { useParams } from "next/navigation";
import { Check, Clock, Circle, Send, CheckCircle, FileText, MessageSquare } from "lucide-react";

export default function ClientPortalPage() {
  const { token } = useParams<{ token: string }>();
  const [project, setProject] = useState<any>(null);
  const [milestones, setMilestones] = useState<any[]>([]);
  const [updates, setUpdates] = useState<any[]>([]);
  const [freelancer, setFreelancer] = useState<any>(null);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [proposals, setProposals] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"status" | "documents">("status");
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [nameStored, setNameStored] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    // Try to restore client identity from localStorage
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

      const [{ data: m }, { data: u }, { data: inv }, { data: prop }] = await Promise.all([
        supabase.from("milestones").select("*").eq("project_id", proj.id).order("sort_order"),
        supabase.from("project_updates").select("*").eq("project_id", proj.id).order("created_at", { ascending: false }),
        supabase.from("invoices")
          .select("*")
          .eq("project_id", proj.id)
          .in("status", ["sent", "paid", "partial", "overdue"])
          .order("created_at", { ascending: false }),
        supabase.from("proposals")
          .select("*")
          .eq("client_id", proj.client_id)
          .order("created_at", { ascending: false }),
      ]);

      setMilestones(m || []);
      setUpdates(u || []);
      setInvoices(inv || []);
      setProposals(prop || []);
      setFreelancer((proj as any).freelancer);
      setLoading(false);
    }
    load();
  }, [token]);

  async function sendMessage() {
    if (!clientName.trim() || !clientEmail.trim() || !message.trim()) return;
    setSending(true);
    await supabase.from("client_messages").insert({
      project_id: project.id,
      client_name: clientName,
      client_email: clientEmail,
      message,
    });
    // Store client identity
    localStorage.setItem("solodesk_client", JSON.stringify({ name: clientName, email: clientEmail }));
    setNameStored(true);
    setMessage("");
    setSent(true);
    setTimeout(() => setSent(false), 3000);
    setSending(false);
  }

  if (loading) return (
    <div className="min-h-screen bg-bg-base flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (notFound) return (
    <div className="min-h-screen bg-bg-base flex flex-col items-center justify-center px-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-accent-light flex items-center justify-center mb-4">
        <FileText size={28} className="text-accent" />
      </div>
      <h1 className="font-display text-2xl font-bold text-text-primary mb-2">Portal not found</h1>
      <p className="text-text-muted text-sm">This link may have expired or been disabled by the freelancer.</p>
    </div>
  );

  const progress = getMilestoneProgress(milestones);

  return (
    <div className="min-h-screen bg-bg-base">
      {/* Header */}
      <div className="bg-white border-b border-border">
        <div className="max-w-2xl mx-auto px-4 py-5">
          <div className="flex items-center gap-3 mb-4">
            <Avatar name={freelancer?.name || "F"} src={freelancer?.avatar_url} size="md" />
            <div>
              <p className="font-semibold text-text-primary">{freelancer?.name}</p>
              {freelancer?.tagline && (
                <p className="text-xs text-text-muted">{freelancer.tagline}</p>
              )}
            </div>
            <div className="ml-auto">
              <div className="text-xs font-medium text-accent bg-accent-light px-2.5 py-1 rounded-full">
                Live Portal
              </div>
            </div>
          </div>

          <div className="bg-hero-gradient rounded-2xl p-4 border border-border/50">
            <h1 className="font-display text-xl font-bold text-text-primary mb-1">{project.name}</h1>
            {project.description && (
              <p className="text-sm text-text-muted mb-3">{project.description}</p>
            )}
            <div className="flex items-center gap-3 mb-3 flex-wrap">
              <Badge label={project.status} status={project.status} />
              {project.deadline && (
                <span className="text-xs text-text-muted flex items-center gap-1">
                  <Clock size={11} /> Due {formatDate(project.deadline)}
                </span>
              )}
            </div>
            <ProgressBar value={progress} showLabel />
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6 pb-20">
        {/* Tabs */}
        <div className="flex gap-1 border-b border-border">
          <button
            onClick={() => setActiveTab("status")}
            className={`px-4 py-2 text-sm font-medium transition-all border-b-2 -mb-px ${
              activeTab === "status" ? "border-accent text-accent" : "border-transparent text-text-muted"
            }`}
          >
            Project Status
          </button>
          <button
            onClick={() => setActiveTab("documents")}
            className={`px-4 py-2 text-sm font-medium transition-all border-b-2 -mb-px ${
              activeTab === "documents" ? "border-accent text-accent" : "border-transparent text-text-muted"
            }`}
          >
            Documents
          </button>
        </div>

        {activeTab === "status" && (
          <>
            {/* Milestones */}
            <div>
              <h2 className="font-semibold text-text-primary mb-3 text-sm uppercase tracking-wider">Milestones</h2>
              {milestones.length === 0 ? (
                <p className="text-sm text-text-muted italic">No milestones have been defined yet.</p>
              ) : (
                <div className="space-y-2">
                  {milestones.map((m) => (
                    <div
                      key={m.id}
                      className={`flex items-start gap-3 p-3.5 rounded-xl border ${
                        m.status === "done" || m.status === "approved"
                          ? "bg-green-50/50 border-success/20"
                          : isOverdue(m.due_date) && m.status !== "done"
                          ? "bg-red-50/50 border-danger/20"
                          : "bg-white border-border"
                      }`}
                    >
                      <div className="mt-0.5 flex-shrink-0">
                        {m.status === "done" || m.status === "approved" ? (
                          <CheckCircle size={18} className="text-success" />
                        ) : m.status === "in_progress" ? (
                          <Clock size={18} className="text-accent" />
                        ) : (
                          <Circle size={18} className="text-text-muted" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm font-medium ${m.status === "done" || m.status === "approved" ? "line-through text-text-muted" : "text-text-primary"}`}>
                          {m.title}
                        </p>
                        {m.description && <p className="text-xs text-text-muted mt-0.5">{m.description}</p>}
                        <div className="flex items-center gap-2 mt-1.5">
                          <Badge label={m.status.replace("_", " ")} status={m.status} />
                          {m.due_date && (
                            <span className={`text-xs ${isOverdue(m.due_date) && m.status !== "done" ? "text-danger" : "text-text-muted"}`}>
                              {formatDate(m.due_date)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Updates */}
            {updates.length > 0 && (
              <div>
                <h2 className="font-semibold text-text-primary mb-3 text-sm uppercase tracking-wider">Recent Activity</h2>
                <div className="space-y-3">
                  {updates.map((u) => (
                    <div key={u.id} className="flex gap-3">
                      <div className="w-1.5 flex-shrink-0 bg-accent/30 rounded-full mt-1" />
                      <div className="bg-white border border-border rounded-xl p-3.5 flex-1">
                        <p className="text-sm text-text-primary leading-relaxed">{u.message}</p>
                        <p className="text-xs text-text-muted mt-2">{formatDate(u.created_at)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === "documents" && (
          <div className="space-y-6">
            <div>
              <h2 className="font-semibold text-text-primary mb-3 text-sm uppercase tracking-wider">Invoices</h2>
              {invoices.length === 0 ? (
                <p className="text-sm text-text-muted italic">No invoices shared yet.</p>
              ) : (
                <div className="space-y-2">
                  {invoices.map((inv) => (
                    <a key={inv.id} href={`/portal/invoice/${inv.portal_token}`} target="_blank" rel="noreferrer">
                      <div className="bg-white border border-border rounded-xl p-4 flex items-center justify-between hover:border-accent transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-accent-light flex items-center justify-center text-accent">
                            <FileText size={20} />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-text-primary">{inv.invoice_number}</p>
                            <p className="text-xs text-text-muted">{formatDate(inv.issue_date)}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge label={inv.status} status={inv.status} />
                          <p className="text-sm font-bold text-text-primary mt-1">
                            {inv.currency === "PKR" ? "Rs" : inv.currency === "USD" ? "$" : "£"} {inv.total.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h2 className="font-semibold text-text-primary mb-3 text-sm uppercase tracking-wider">Proposals</h2>
              {proposals.length === 0 ? (
                <p className="text-sm text-text-muted italic">No proposals or quotes found.</p>
              ) : (
                <div className="space-y-2">
                  {proposals.map((prop) => (
                    <a key={prop.id} href={`/portal/proposal/${prop.portal_token}`} target="_blank" rel="noreferrer">
                      <div className="bg-white border border-border rounded-xl p-4 flex items-center justify-between hover:border-accent transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
                            <FileText size={20} />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-text-primary">{prop.title}</p>
                            <p className="text-xs text-text-muted">Issued {formatDate(prop.created_at)}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge label={prop.status} status={prop.status} />
                          <p className="text-sm font-bold text-text-primary mt-1">
                            {prop.currency === "PKR" ? "Rs" : prop.currency === "USD" ? "$" : "£"} {prop.total_amount.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Message Box */}
        <div className="bg-white border border-border rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <MessageSquare size={16} className="text-accent" />
            <h2 className="font-semibold text-text-primary text-sm">Send a Message</h2>
          </div>

          {!nameStored && (
            <div className="grid grid-cols-2 gap-3 mb-3">
              <Input
                placeholder="Your name"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
              />
              <Input
                placeholder="Your email"
                type="email"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
              />
            </div>
          )}

          {nameStored && (
            <div className="flex items-center gap-2 mb-3">
              <Avatar name={clientName} size="xs" />
              <p className="text-xs text-text-muted">
                Messaging as <span className="font-medium text-text-primary">{clientName}</span>
                {" · "}
                <button onClick={() => { setNameStored(false); localStorage.removeItem("solodesk_client"); }} className="text-accent underline">Change</button>
              </p>
            </div>
          )}

          <Textarea
            placeholder="Type your message here..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
          />

          <div className="flex items-center justify-between mt-3">
            {sent && (
              <p className="text-sm text-success flex items-center gap-1">
                <Check size={14} /> Message sent!
              </p>
            )}
            <Button
              onClick={sendMessage}
              loading={sending}
              disabled={!message.trim() || !clientName.trim() || !clientEmail.trim()}
              size="sm"
              className="ml-auto"
            >
              <Send size={14} /> Send Message
            </Button>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-text-muted">
          Powered by{" "}
          <span className="font-semibold text-accent">SoloDesk</span>
          {" — "}The Freelancer OS
        </p>
      </div>
    </div>
  );
}
