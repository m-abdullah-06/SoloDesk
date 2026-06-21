"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { AIScenario, AITone, AILanguage, AIMessage, Client, Project } from "@/types";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Input, Select, Textarea } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { getScenarioLabel, formatRelative } from "@/lib/utils";
import { Sparkles, Copy, Check, RefreshCw, History, Send, ChevronDown, ChevronUp, Mail } from "lucide-react";
import { useSearchParams } from "next/navigation";

const SCENARIOS: { value: AIScenario; label: string; hint: string }[] = [
  { value: "late_payment", label: "Late Payment Follow-up", hint: "Client hasn't paid on time" },
  { value: "scope_creep", label: "Scope Creep / Extra Work", hint: "Client requesting work outside scope" },
  { value: "project_delivery", label: "Project Delivery", hint: "Sending completed work to client" },
  { value: "revision_limit", label: "Revision Limit Reached", hint: "Client exceeding agreed revisions" },
  { value: "rate_increase", label: "Rate Increase Notice", hint: "Informing client of new rates" },
  { value: "project_delay", label: "Project Delay Update", hint: "Need to extend the deadline" },
  { value: "client_ghosting", label: "Client Ghosting", hint: "Client stopped responding" },
  { value: "contract_reminder", label: "Contract Reminder", hint: "Reminding about agreed terms" },
  { value: "milestone_approval", label: "Milestone Approval", hint: "Requesting approval for completed milestone" },
  { value: "project_completion", label: "Project Completion", hint: "Wrapping up and requesting review" },
];

const TONE_OPTIONS = [
  { value: "professional", label: "Professional" },
  { value: "firm", label: "Firm" },
  { value: "friendly", label: "Friendly" },
  { value: "urgent", label: "Urgent" },
];

const LANG_OPTIONS = [
  { value: "english", label: "English" },
  { value: "urdu", label: "Urdu" },
  { value: "both", label: "Both" },
];

export default function AIPage() {
  const searchParams = useSearchParams();
  const [clients, setClients] = useState<Pick<Client, 'id' | 'name' | 'email'>[]>([]);
  const [projects, setProjects] = useState<Pick<Project, 'id' | 'name'>[]>([]);
  const [history, setHistory] = useState<AIMessage[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [clientEmail, setClientEmail] = useState("");

  const [scenario, setScenario] = useState<AIScenario>("late_payment");
  const [tone, setTone] = useState<AITone>("professional");
  const [language, setLanguage] = useState<AILanguage>("english");
  const [situation, setSituation] = useState("");
  const [clientId, setClientId] = useState(searchParams.get("client_id") || "");
  const [projectId, setProjectId] = useState(searchParams.get("project_id") || "");

  const [result, setResult] = useState<{ subject: string | null; body: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const [{ data: c }, { data: p }, { data: h }] = await Promise.all([
        supabase.from("clients").select("id, name, email").eq("user_id", user.id).order("name"),
        supabase.from("projects").select("id, name").eq("user_id", user.id).eq("status", "active"),
        supabase.from("ai_messages").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(20),
      ]);
      setClients(c || []);
      setProjects(p || []);
      setHistory(h || []);

      const paramClientId = searchParams.get("client_id") || "";
      if (paramClientId && c) {
        const found = c.find((client: any) => client.id === paramClientId);
        if (found?.email) {
          setClientEmail(found.email);
        }
      }
    }
    load();
  }, []);

  const selectedScenario = SCENARIOS.find((s) => s.value === scenario);
  const selectedClient = clients.find((c) => c.id === clientId);
  const selectedProject = projects.find((p) => p.id === projectId);

  async function generate() {
    if (!situation.trim()) { setError("Please describe your situation"); return; }
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/ai/communicate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenario,
          tone,
          language,
          situation,
          clientName: selectedClient?.name,
          projectName: selectedProject?.name,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to generate"); return; }
      setResult(data);

      // Save to history
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("ai_messages").insert({
          user_id: user.id,
          scenario,
          tone,
          language,
          input: situation,
          output: data.body,
          subject: data.subject,
          client_id: clientId || null,
          project_id: projectId || null,
        });
      }
    } catch (e) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function copyResult() {
    if (!result) return;
    const text = result.subject ? `Subject: ${result.subject}\n\n${result.body}` : result.body;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="AI Communicator"
        description="Generate professional messages for any client situation"
      />

      {/* Scenario Pills */}
      <div>
        <p className="text-xs font-medium text-text-muted mb-2 uppercase tracking-wide">Select Scenario</p>
        <div className="flex gap-2 flex-wrap">
          {SCENARIOS.map((s) => (
            <button
              key={s.value}
              onClick={() => setScenario(s.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                scenario === s.value
                  ? "bg-accent text-white border-accent shadow-lg shadow-orange-500/20"
                  : "bg-card border-border text-muted-foreground hover:border-accent/50 hover:text-accent hover:text-foreground"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
        {selectedScenario && (
          <p className="text-xs text-text-muted mt-2 ml-1">💡 {selectedScenario.hint}</p>
        )}
      </div>

      {/* Options Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Select
          label="Tone"
          value={tone}
          onChange={(v) => setTone(v as AITone)}
          options={TONE_OPTIONS}
        />
        <Select
          label="Language"
          value={language}
          onChange={(v) => setLanguage(v as AILanguage)}
          options={LANG_OPTIONS}
        />
        <Select
          label="Client (optional)"
          value={clientId}
          onChange={(val) => {
            setClientId(val);
            const cl = clients.find((c) => c.id === val);
            setClientEmail(cl?.email || "");
          }}
          options={clients.map((c) => ({ value: c.id, label: c.name }))}
          placeholder="Select client"
        />
        <Input
          label="Client Email"
          placeholder="client@example.com"
          value={clientEmail}
          onChange={(e) => setClientEmail(e.target.value)}
        />
        <Select
          label="Project (optional)"
          value={projectId}
          onChange={setProjectId}
          options={projects.map((p) => ({ value: p.id, label: p.name }))}
          placeholder="Select project"
        />
      </div>

      {/* Situation Input */}
      <Textarea
        label="Describe the situation *"
        placeholder={`e.g. "Client hasn't paid the Rs 30,000 invoice for 3 weeks despite multiple reminders. This is for the Shopify store project."`}
        value={situation}
        onChange={(e) => setSituation(e.target.value)}
        rows={4}
      />

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button onClick={generate} loading={loading} size="lg" className="w-full">
        <Sparkles size={18} />
        {loading ? "Generating..." : "Generate Message"}
      </Button>

      {/* Result */}
      {result && (
        <Card glow className="animate-fade-up">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-text-primary text-sm">Generated Message</h3>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const mailtoUrl = `mailto:${clientEmail}?subject=${encodeURIComponent(result.subject || '')}&body=${encodeURIComponent(result.body)}`;
                  window.location.href = mailtoUrl;
                }}
                className="text-orange-500 hover:text-orange-600 border-orange-500/20 hover:border-orange-500/30"
              >
                <Mail size={14} /> Send Email
              </Button>
              <Button variant="ghost" size="sm" onClick={generate} disabled={loading}>
                <RefreshCw size={14} /> Regenerate
              </Button>
              <Button variant="outline" size="sm" onClick={copyResult}>
                {copied ? <Check size={14} className="text-green-600 dark:text-green-500" /> : <Copy size={14} />}
                {copied ? "Copied!" : "Copy"}
              </Button>
            </div>
          </div>

          {result.subject && (
            <div className="mb-3 p-2.5 bg-bg-elevated rounded-xl">
              <p className="text-xs font-medium text-text-muted mb-0.5">Subject</p>
              <p className="text-sm text-text-primary font-medium">{result.subject}</p>
            </div>
          )}

          <div className="bg-bg-base rounded-xl p-3.5">
            <p className="text-sm text-text-primary whitespace-pre-line leading-relaxed">{result.body}</p>
          </div>

          {/* Tone adjustment quick buttons */}
          <div className="flex gap-2 mt-3 flex-wrap">
            <p className="text-xs text-text-muted self-center">Adjust:</p>
            {["firm", "friendly", "professional", "urgent"].map((t) => (
              <button
                key={t}
                onClick={() => { setTone(t as AITone); generate(); }}
                className="text-xs px-2.5 py-1 rounded-lg border border-border hover:border-accent hover:text-accent transition-all capitalize"
              >
                Make it {t}
              </button>
            ))}
          </div>
        </Card>
      )}

      {/* History Toggle */}
      <button
        onClick={() => setShowHistory(!showHistory)}
        className="flex items-center gap-2 text-sm text-text-muted hover:text-text-primary transition-colors"
      >
        <History size={16} />
        Message History
        {showHistory ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {showHistory && (
        <div className="space-y-2">
          {history.length === 0 ? (
            <Card className="text-center py-6">
              <p className="text-sm text-text-muted">No message history yet.</p>
            </Card>
          ) : (
            history.map((msg) => (
              <Card
                key={msg.id}
                hover
                onClick={() => setResult({ subject: msg.subject, body: msg.output })}
                className="cursor-pointer"
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <p className="text-xs font-medium text-accent capitalize">
                    {getScenarioLabel(msg.scenario)}
                  </p>
                  <p className="text-xs text-text-muted flex-shrink-0">{formatRelative(msg.created_at)}</p>
                </div>
                <p className="text-sm text-text-secondary line-clamp-2">{msg.output}</p>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}

