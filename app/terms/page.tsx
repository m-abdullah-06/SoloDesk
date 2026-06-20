import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#FDFDFB] text-black">
      <nav className="border-b border-black/5 h-16 flex items-center px-6">
        <Link href="/" className="flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-black transition-all">
          <ArrowLeft size={16} /> Back to Landing
        </Link>
      </nav>
      <main className="max-w-3xl mx-auto px-6 py-20">
        <h1 className="text-4xl font-black mb-10 tracking-tight">Terms of Service</h1>
        <div className="prose prose-neutral max-w-none space-y-6 text-neutral-600 font-medium leading-loose">
          <p>By using SoloDesk, you agree to these terms for the 2026 Evolution of freelance business management.</p>
          
          <h2 className="text-xl font-black text-black pt-4 uppercase tracking-wider text-xs">1. Project Usage</h2>
          <p>You are responsible for the content uploaded to your client portals and the accuracy of your invoices. SoloDesk provides the platform for communication and management.</p>
          
          <h2 className="text-xl font-black text-black pt-4 uppercase tracking-wider text-xs">2. Account Responsibility</h2>
          <p>Keep your Supabase login credentials secure. You are responsible for all activity that occurs under your freelancer profile.</p>
          
          <h2 className="text-xl font-black text-black pt-4 uppercase tracking-wider text-xs">3. Future Growth</h2>
          <p>SoloDesk is built for growth. We reserve the right to add premium features and scale our services as the AI landscape evolves.</p>
        </div>
      </main>
    </div>
  );
}

