import { ArrowLeft, Mail, MessageCircle, Zap, Clock, Shield } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Support — SoloDesk",
  description: "Get help with your SoloDesk account. We're here to assist you.",
};

const features = [
  { icon: Zap,    label: "Fast Response",    desc: "We reply within 24 hours" },
  { icon: Shield, label: "Secure",           desc: "Your data stays private" },
  { icon: Clock,  label: "Always Available", desc: "Support 7 days a week" },
];

export default function SupportPage() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden bg-background"
      style={{ fontFamily: "Montserrat, system-ui, sans-serif" }}
    >
      {/* Ambient blobs */}
      <div className="fixed inset-0 pointer-events-none" aria-hidden>
        <div
          className="absolute -top-48 -left-48 w-[600px] h-[600px] rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(245,121,10,0.07) 0%, transparent 70%)",
            filter: "blur(80px)",
          }}
        />
        <div
          className="absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(245,121,10,0.05) 0%, transparent 70%)",
            filter: "blur(80px)",
          }}
        />
      </div>

      <div className="relative w-full max-w-lg">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground hover:text-orange-500 transition-colors mb-10 group"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
          Back to Home
        </Link>

        {/* Main card */}
        <div
          className="rounded-3xl p-10 relative overflow-hidden border border-border bg-card"
          style={{ boxShadow: "var(--card-shadow)" }}
        >
          {/* Corner glow */}
          <div
            className="absolute -top-20 -right-20 w-64 h-64 rounded-full pointer-events-none"
            style={{
              background: "radial-gradient(circle, rgba(245,121,10,0.1) 0%, transparent 70%)",
              filter: "blur(40px)",
            }}
          />

          {/* Icon */}
          <div className="relative mb-8 flex justify-center">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, rgba(245,121,10,0.15) 0%, rgba(245,121,10,0.05) 100%)",
                border: "1px solid rgba(245,121,10,0.25)",
                boxShadow: "0 0 30px rgba(245,121,10,0.15)",
              }}
            >
              <MessageCircle size={28} className="text-orange-500" />
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-8">
            <div
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-4"
              style={{
                background: "rgba(245,121,10,0.08)",
                border: "1px solid rgba(245,121,10,0.18)",
                color: "#F5790A",
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
              We&apos;re here to help
            </div>
            <h1 className="text-3xl font-black text-foreground tracking-tight mb-3">
              Get Support
            </h1>
            <p className="text-muted-foreground leading-relaxed text-sm max-w-xs mx-auto">
              Need help with your SoloDesk account or project portals? Reach out and we&apos;ll get back to you quickly.
            </p>
          </div>

          {/* Email CTA — pure CSS hover via Tailwind group */}
          <a
            href="mailto:abdullah.muhammad.xyz@gmail.com"
            className="group flex items-center gap-4 p-4 rounded-2xl transition-all duration-200 mb-6 border border-border bg-muted hover:border-orange-500/30 hover:bg-orange-500/5"
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                background: "rgba(245,121,10,0.1)",
                border: "1px solid rgba(245,121,10,0.2)",
              }}
            >
              <Mail size={18} className="text-orange-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-0.5">
                Email us at
              </p>
              <p className="text-sm font-bold text-foreground truncate group-hover:text-orange-500 transition-colors">
                abdullah.muhammad.xyz@gmail.com
              </p>
            </div>
            <ArrowLeft
              size={14}
              className="text-muted-foreground rotate-180 group-hover:translate-x-0.5 group-hover:text-orange-500 transition-all flex-shrink-0"
            />
          </a>

          {/* Feature grid */}
          <div className="grid grid-cols-3 gap-3 mb-8">
            {features.map(({ icon: Icon, label, desc }) => (
              <div
                key={label}
                className="flex flex-col items-center text-center p-3 rounded-2xl border border-border bg-secondary"
              >
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center mb-2"
                  style={{ background: "rgba(245,121,10,0.08)" }}
                >
                  <Icon size={15} className="text-orange-500" />
                </div>
                <p className="text-[10px] font-bold text-foreground tracking-tight leading-tight mb-0.5">
                  {label}
                </p>
                <p className="text-[9px] text-muted-foreground leading-snug">{desc}</p>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="border-t border-border pt-6 text-center">
            <p className="text-xs text-muted-foreground leading-relaxed">
              Powered by{" "}
              <span className="font-bold text-orange-500">SoloDesk</span>
              {" "}— The Freelancer OS
            </p>
          </div>
        </div>

        {/* Bottom tagline */}
        <p className="text-center text-[11px] text-muted-foreground/50 mt-6 tracking-wide">
          Average response time:{" "}
          <span className="font-semibold text-orange-500/70">under 24 hours</span>
        </p>
      </div>
    </div>
  );
}
