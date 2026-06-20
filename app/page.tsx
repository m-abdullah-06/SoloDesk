"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import {
  ArrowRight,
  Sparkles,
  Files,
  MessageCircle,
  BarChart3,
  Zap,
  ShieldCheck,
  Globe,
  Rocket,
  CheckCircle2,
  Sun,
  Moon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { Variants } from "framer-motion";

const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      damping: 25,
      stiffness: 100,
    },
  },
};

export default function LandingPage() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <div
      className={`min-h-screen theme-transition bg-mesh selection:bg-primary/30 ${isDark ? "dark bg-[#030303] text-white" : "bg-[#FFFFFF] text-black"}`}
    >
      {/* Header */}
      <nav
        className={`fixed top-0 w-full z-50 glass ${isDark ? "border-b border-white/5" : "border-b border-black/5"}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 shrink-0"
          >
            <div
              style={{ backgroundColor: "#F5790A" }}
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center glow-orange overflow-hidden"
            >
              <span className="text-white font-black text-xl sm:text-2xl italic font-display">
                S
              </span>
            </div>
            <span
              className={`font-bold text-lg sm:text-2xl tracking-tight ${isDark ? "text-white" : "text-black"}`}
            >
              SoloDesk<span className="text-primary">.</span>
            </span>
          </motion.div>

          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-8 mr-4">
              <Link
                href="#features"
                className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors"
              >
                Features
              </Link>
              <Link
                href="/login"
                className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors"
              >
                Sign In
              </Link>
            </div>

            {/* Scoped Theme Toggle */}
            <button
              onClick={() => setTheme(isDark ? "light" : "dark")}
              className={`w-12 h-12 rounded-2xl glass flex items-center justify-center hover:scale-110 active:scale-95 transition-all text-primary border ${isDark ? "border-primary/30 shadow-[0_0_15px_rgba(245,121,10,0.2)]" : "border-primary/20 shadow-lg"}`}
            >
              <AnimatePresence mode="wait">
                {isDark ? (
                  <motion.div
                    key="sun"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Sun size={20} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="moon"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Moon size={20} />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>

            <Link href="/signup">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-4 sm:px-6 py-2 sm:py-3 rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm whitespace-nowrap transition-all shadow-xl ${isDark ? "bg-white text-black hover:bg-neutral-200" : "bg-black text-white hover:bg-neutral-800"}`}
              >
                Join SoloDesk
              </motion.button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="pt-40 pb-20">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-6 text-center mb-40 relative">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "circOut" }}
          >
            <div
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full glass border text-primary text-[10px] font-black uppercase tracking-[0.2em] mb-10 shadow-lg ${isDark ? "border-primary/20" : "border-primary/40"}`}
            >
              <Sparkles size={12} className="animate-pulse" /> The 2026
              Evolution
            </div>
            <h1
              className={`text-5xl sm:text-6xl md:text-[7.5rem] font-black mb-8 leading-[0.9] tracking-tighter ${isDark ? "text-white" : "text-black"}`}
            >
              The only <br />
              <span className="text-primary italic text-glow">OS</span> you
              need.
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed font-medium">
              SoloDesk is the high-performance command center for the modern
              freelancer. AI messaging, auto-invoicing, and elite project
              portals.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link href="/signup">
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  style={{ backgroundColor: "#F5790A" }}
                  className="w-full sm:w-auto px-10 py-5 text-white rounded-2xl font-black text-xl shadow-2xl flex items-center justify-center gap-3 group overflow-hidden relative"
                >
                  <span className="relative z-10">Get Started Free</span>
                  <ArrowRight className="group-hover:translate-x-2 transition-transform relative z-10" />
                  <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </motion.button>
              </Link>
              <Link href="/portal/demo">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    border: isDark
                      ? "1px solid rgba(255,255,255,0.2)"
                      : "1px solid #000000",
                    color: isDark ? "#FFFFFF" : "#000000",
                    backgroundColor: isDark
                      ? "rgba(255,255,255,0.05)"
                      : "rgba(0,0,0,0.05)",
                  }}
                  className="w-full sm:w-auto px-10 py-5 rounded-2xl font-bold text-xl transition-all"
                >
                  Live Demo
                </motion.button>
              </Link>
            </div>
          </motion.div>

          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-96 bg-primary/20 blur-[150px] -z-10 rounded-full opacity-30"></div>
        </section>

        {/* Bento Feature Grid */}
        <section id="features" className="max-w-7xl mx-auto px-6 mb-40">
          <div className="mb-20">
            <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tighter leading-none">
              Built for Elite <br /> Workflow.
            </h2>
            <div className="w-20 h-2 bg-primary rounded-full shadow-lg"></div>
          </div>

          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            className="bento-grid"
          >
            {/* Project Portal */}
            <motion.div
              variants={item}
              className="md:col-span-3 md:row-span-2 glass-card rounded-[2.5rem] p-10 overflow-hidden relative group"
            >
              <div className="relative z-10 h-full flex flex-col md:flex-row gap-12">
                <div className="flex-1">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-8 border border-primary/20">
                    <Globe className="text-primary w-7 h-7" />
                  </div>
                  <h3 className="text-3xl font-black mb-4">
                    Elite Client Portals
                  </h3>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    Give your clients a high-end interface to track milestones
                    and files. No more WhatsApp threads or email chains.
                  </p>

                  <div className="mt-10 flex flex-wrap gap-4">
                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl glass border border-primary/20 text-primary text-xs font-bold">
                      <CheckCircle2 size={14} /> Real-time Sync
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl glass border border-primary/20 text-primary text-xs font-bold">
                      <ShieldCheck size={14} /> Encrypted Links
                    </div>
                  </div>
                </div>

                <div className="flex-1 relative">
                  <div
                    className={`backdrop-blur-xl border border-border/50 rounded-3xl p-6 shadow-2xl relative z-10 transform group-hover:rotate-1 transition-transform duration-500 ${isDark ? "bg-neutral-900/80" : "bg-white/80"}`}
                  >
                    <div className="flex items-center justify-between mb-8">
                      <div>
                        <h4 className="font-black">EcoSync Website</h4>
                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">
                          Active Project
                        </p>
                      </div>
                      <div className="px-3 py-1 bg-green-500/10 text-green-500 rounded-full text-[10px] font-black border border-green-500/20">
                        ON TRACK
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div
                        className={`p-3 rounded-2xl border border-border ${isDark ? "bg-black/40" : "bg-neutral-50"}`}
                      >
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-bold uppercase tracking-tight">
                            UI Design Phase
                          </span>
                          <span className="text-[10px] text-primary font-black">
                            100%
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-border/20 rounded-full overflow-hidden">
                          <div className="h-full bg-primary w-full shadow-lg"></div>
                        </div>
                      </div>

                      <div
                        className={`p-3 rounded-2xl border border-border ${isDark ? "bg-black/20" : "bg-neutral-50/50"}`}
                      >
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-bold uppercase tracking-tight">
                            Beta Development
                          </span>
                          <span className="text-[10px] text-muted-foreground font-black">
                            45%
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-border/20 rounded-full overflow-hidden">
                          <div className="h-full bg-primary w-[45%]"></div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 px-2">
                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                        <span className="text-[10px] text-muted-foreground font-medium italic">
                          Client is viewing this page right now...
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Smart Invoicing */}
            <motion.div
              variants={item}
              className="md:col-span-1 md:row-span-2 glass-card rounded-[2.5rem] p-8 group border-primary/10"
            >
              <div
                style={{ backgroundColor: "#F5790A" }}
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-8 shadow-2xl shadow-primary/40 text-white"
              >
                <Files size={28} />
              </div>
              <h3 className="text-2xl font-black mb-4">
                Smart <br /> Invoicing
              </h3>
              <p className="text-sm text-muted-foreground mb-8">
                Professional financial management with one-click payment links.
              </p>

              <div className="space-y-3">
                <div
                  className={`border border-border rounded-2xl p-4 shadow-xl -rotate-2 group-hover:rotate-0 transition-transform ${isDark ? "bg-black" : "bg-white"}`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-black text-[10px]">
                      INV
                    </div>
                    <CheckCircle2 className="text-green-500 w-5 h-5" />
                  </div>
                  <p className="text-[10px] font-black text-muted-foreground mb-1">
                    MOBILE APP DESIGN
                  </p>
                  <h4 className="text-xl font-black">$2,400.00</h4>
                  <div className="mt-4 pt-4 border-t border-border flex justify-between">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">
                      Paid Today
                    </span>
                    <span className="text-[10px] font-black text-green-500 uppercase">
                      Success
                    </span>
                  </div>
                </div>

                <div
                  className={`p-3 rounded-xl border border-border opacity-50 blur-[1px] ${isDark ? "bg-neutral-900" : "bg-neutral-100"}`}
                >
                  <div className="h-2 w-20 bg-muted rounded mb-2"></div>
                  <div className="h-3 w-12 bg-primary/20 rounded"></div>
                </div>
              </div>
            </motion.div>

            {/* AI Communicator */}
            <motion.div
              variants={item}
              className="md:col-span-2 md:row-span-1 glass-card rounded-[2.5rem] p-8 overflow-hidden relative group"
            >
              <div className="relative z-10 flex gap-8 items-start">
                <div
                  style={{
                    backgroundColor: "rgba(245,121,10,0.1)",
                    border: "1px solid rgba(245,121,10,0.2)",
                  }}
                  className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
                >
                  <MessageCircle style={{ color: "#F5790A" }} size={28} />
                </div>
                <div>
                  <h3 className="text-2xl font-black mb-3">AI Communicator</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Write perfect project updates and client replies in seconds.
                    Sound polished, every single time.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Scale/Growth */}
            <motion.div
              variants={item}
              className="md:col-span-2 md:row-span-1 glass-card rounded-[2.5rem] p-8 flex items-center gap-10 overflow-hidden relative"
            >
              <div className="flex-1">
                <h3 className="text-2xl font-black mb-3">
                  Scale Without Limits
                </h3>
                <p className="text-sm text-muted-foreground">
                  Built to handle thousands of projects with the same effortless
                  flow. SoloDesk is the engine for your growth.
                </p>
              </div>
              <div
                style={{ backgroundColor: "rgba(245,121,10,0.1)" }}
                className="shrink-0 w-24 h-24 rounded-3xl flex items-center justify-center transform rotate-12 group-hover:rotate-0 transition-transform"
              >
                <Rocket style={{ color: "#F5790A" }} className="w-12 h-12" />
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* Final CTA */}
        <section className="max-w-7xl mx-auto px-6 mt-40">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className={`p-10 sm:p-20 md:p-32 rounded-[2.5rem] sm:rounded-[4rem] text-center relative overflow-hidden shadow-2xl border border-primary/20 ${isDark ? "bg-[#0A0A0B]" : "bg-[#000000]"}`}
          >
            <div className="relative z-10">
              <h2 className="text-4xl md:text-8xl font-black text-white mb-8 leading-[0.9] tracking-tighter">
                Redesign your <br /> working life.
              </h2>
              <p className="text-white/50 text-lg sm:text-xl md:text-2xl mb-14 max-w-2xl mx-auto font-medium">
                Join the freelancers building their legacy on pure speed. Free
                to start, impossible to outgrow.
              </p>
              <Link href="/signup">
                <motion.button
                  whileHover={{ scale: 1.05, y: -4 }}
                  whileTap={{ scale: 0.95 }}
                  style={{ backgroundColor: "#F5790A" }}
                  className="px-12 py-6 text-white rounded-[2rem] font-black text-2xl shadow-[0_20px_60px_-15px_rgba(245,121,10,0.5)] hover:brightness-110 transition-all border-none"
                >
                  Join SoloDesk Now
                </motion.button>
              </Link>
            </div>
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 rounded-full -mr-64 -mt-64 blur-[150px] opacity-40"></div>
          </motion.div>
        </section>
      </main>

      <footer
        className={`max-w-7xl mx-auto px-6 py-20 border-t ${isDark ? "border-white/5" : "border-black/5"}`}
      >
        <div className="flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary font-black">
              S
            </div>
            <span
              className={`font-bold ${isDark ? "text-white" : "text-black"}`}
            >
              SoloDesk.
            </span>
          </div>

          <div className="flex flex-wrap justify-center gap-10">
            <Link
              href="/privacy"
              className="text-xs font-black text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="text-xs font-black text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest"
            >
              Terms
            </Link>
            <Link
              href="/support"
              className="text-xs font-black text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest"
            >
              Support
            </Link>
          </div>

          <p className="text-xs text-muted-foreground font-medium italic">
            Built for Freelancers · Pakistan
          </p>
        </div>
      </footer>
    </div>
  );
}

