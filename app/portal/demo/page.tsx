"use client";
import { useState } from "react";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Check, Clock, Circle, Send, CheckCircle, FileText, MessageSquare } from "lucide-react";
import Link from "next/link";

export default function DemoPortalPage() {
  const [activeTab, setActiveTab] = useState<"status" | "documents">("status");
  
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
    { id: 4, title: "Final Asset Delivery", status: "todo", description: "High-res exports and brand guide.", due_date: "2026-05-01" },
  ];

  const updates = [
    { id: 1, message: "Completed the color palette selection. Moving on to the responsive layout design.", created_at: "2026-04-17" },
    { id: 2, message: "Round 1 feedback received and incorporated into the next iteration.", created_at: "2026-04-15" },
  ];

  const invoices = [
    { id: 1, invoice_number: "INV-2026-001", issue_date: "2026-04-01", status: "paid", total: 1500, currency: "USD", portal_token: "demo-inv" },
    { id: 2, invoice_number: "INV-2026-002", issue_date: "2026-04-15", status: "sent", total: 2500, currency: "USD", portal_token: "demo-inv" },
  ];

  return (
    <div className="min-h-screen bg-bg-base text-text-primary">
      {/* Simulation Banner */}
      <div className="bg-primary text-white py-2 px-4 text-center text-[10px] font-black uppercase tracking-[0.2em] shadow-lg sticky top-0 z-[60]">
        Demo Mode: This is how your clients see their project
      </div>

      {/* Header */}
      <div className="bg-white border-b border-border">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="flex items-center gap-3 mb-6">
            <Avatar name={freelancer.name} src={freelancer.avatar_url} size="md" />
            <div>
              <p className="font-bold text-lg">{freelancer.name}</p>
              <p className="text-xs text-text-muted">{freelancer.tagline}</p>
            </div>
            <div className="ml-auto">
              <Link href="/">
                <button className="text-[10px] font-black text-primary bg-primary/10 px-3 py-1.5 rounded-full uppercase tracking-wider hover:bg-primary/20 transition-all">
                  Exit Demo
                </button>
              </Link>
            </div>
          </div>

          <div className="bg-gradient-to-br from-neutral-50 to-white rounded-3xl p-6 border border-border shadow-sm">
            <div className="flex justify-between items-start mb-2">
               <h1 className="font-display text-2xl font-black">{project.name}</h1>
               <Badge label={project.status.replace('_', ' ')} status={project.status} />
            </div>
            <p className="text-sm text-text-muted mb-6">{project.description}</p>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-bold text-text-muted uppercase tracking-widest">
                <span>Overall Progress</span>
                <span>50%</span>
              </div>
              <ProgressBar value={50} />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-8 pb-32">
        {/* Tabs */}
        <div className="flex gap-2 p-1 bg-neutral-100 rounded-2xl w-fit">
          <button
            onClick={() => setActiveTab("status")}
            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${
              activeTab === "status" ? "bg-white text-primary shadow-sm" : "text-text-muted hover:text-text-primary"
            }`}
          >
            Project Status
          </button>
          <button
            onClick={() => setActiveTab("documents")}
            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${
              activeTab === "documents" ? "bg-white text-primary shadow-sm" : "text-text-muted hover:text-text-primary"
            }`}
          >
            Documents
          </button>
        </div>

        {activeTab === "status" && (
          <>
            {/* Milestones */}
            <div>
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-text-muted mb-4">Milestones</h2>
              <div className="space-y-3">
                {milestones.map((m) => (
                  <div
                    key={m.id}
                    className={`flex items-start gap-4 p-5 rounded-[1.5rem] border shadow-sm transition-all ${
                      m.status === "done" ? "bg-green-50/30 border-green-500/20" : "bg-white border-border"
                    }`}
                  >
                    <div className="mt-1">
                      {m.status === "done" ? (
                        <CheckCircle size={20} className="text-green-500" />
                      ) : m.status === "in_progress" ? (
                        <Clock size={20} className="text-primary animate-pulse" />
                      ) : (
                        <Circle size={20} className="text-border" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <p className={`font-bold ${m.status === "done" ? "text-text-muted line-through" : ""}`}>{m.title}</p>
                        <span className="text-[10px] font-black text-text-muted uppercase tracking-tighter">Due {m.due_date}</span>
                      </div>
                      <p className="text-xs text-text-muted mt-1">{m.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Updates */}
            <div>
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-text-muted mb-4">Recent Activity</h2>
              <div className="space-y-4">
                {updates.map((u) => (
                  <div key={u.id} className="flex gap-4">
                    <div className="w-1 bg-primary/20 rounded-full mt-2" />
                    <div className="bg-white border border-border rounded-2xl p-4 flex-1 shadow-sm">
                      <p className="text-sm leading-relaxed">{u.message}</p>
                      <p className="text-[10px] font-bold text-text-muted mt-3 uppercase tracking-widest">{u.created_at}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {activeTab === "documents" && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
            <div>
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-text-muted mb-4">Invoices</h2>
              <div className="space-y-3">
                {invoices.map((inv) => (
                  <div key={inv.id} className="bg-white border border-border rounded-2xl p-5 flex items-center justify-between hover:border-primary/30 transition-all cursor-pointer group shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-neutral-50 flex items-center justify-center text-primary group-hover:bg-primary/10 transition-colors">
                        <FileText size={24} />
                      </div>
                      <div>
                        <p className="font-bold text-sm">{inv.invoice_number}</p>
                        <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest">Issued {inv.issue_date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge label={inv.status} status={inv.status} />
                      <p className="font-black text-sm mt-2">${inv.total.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-8 rounded-[2rem] bg-neutral-900 text-white text-center relative overflow-hidden">
               <div className="relative z-10">
                 <h3 className="text-xl font-bold mb-2">Need your own portal?</h3>
                 <p className="text-neutral-400 text-sm mb-6 max-w-xs mx-auto">Start managing clients like a pro. Set up your first project in 60 seconds.</p>
                 <Link href="/signup">
                    <button className="px-8 py-3 bg-primary text-white font-black rounded-xl hover:scale-105 transition-all">
                      Get Started Free
                    </button>
                 </Link>
               </div>
               <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full -mr-16 -mt-16 blur-3xl opacity-50"></div>
            </div>
          </div>
        )}

        {/* Message Box */}
        <div className="bg-white border border-border rounded-[2rem] p-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-primary/20"></div>
          <div className="flex items-center gap-2 mb-6 text-primary">
            <MessageSquare size={18} />
            <h2 className="font-black text-sm uppercase tracking-widest">Send Project Message</h2>
          </div>

          <div className="space-y-4">
             <div className="grid grid-cols-2 gap-4">
                <Input placeholder="Your Name" value="Demo Client" disabled />
                <Input placeholder="Your Email" value="client@example.com" disabled />
             </div>
             <Textarea placeholder="Type a message to Abdullah..." disabled rows={3} />
             <Button className="w-full h-12 rounded-xl text-sm font-bold" disabled>
                <Send size={16} /> Send Message
             </Button>
             <p className="text-[10px] text-center text-text-muted font-bold uppercase tracking-widest">Messaging is disabled in demo mode</p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-[10px] font-black text-text-muted uppercase tracking-[0.2em] opacity-40 py-10">
          Powered by SoloDesk — The Elite Freelancer OS
        </p>
      </div>
    </div>
  );
}
