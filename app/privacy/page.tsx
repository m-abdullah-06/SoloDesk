import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#FDFDFB] text-black">
      <nav className="border-b border-black/5 h-16 flex items-center px-6">
        <Link href="/" className="flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-black transition-all">
          <ArrowLeft size={16} /> Back to Landing
        </Link>
      </nav>
      <main className="max-w-3xl mx-auto px-6 py-20">
        <h1 className="text-4xl font-black mb-10 tracking-tight">Privacy Policy</h1>
        <div className="prose prose-neutral max-w-none space-y-6 text-neutral-600 font-medium leading-loose">
          <p>SoloDesk is committed to protecting your professional data. This policy outlines how we handle the information you provide while using our freelancer platform.</p>
          
          <h2 className="text-xl font-black text-black pt-4 uppercase tracking-wider text-xs">1. Data Collection</h2>
          <p>We collect essential information to run your business: names, project details, and invoicing data. We use Supabase SSR for secure, encrypted storage.</p>
          
          <h2 className="text-xl font-black text-black pt-4 uppercase tracking-wider text-xs">2. Usage</h2>
          <p>Your data is never sold. It is exclusively used to provide the AI features, portal links, and financial tracking you need to manage your freelance operations.</p>
          
          <h2 className="text-xl font-black text-black pt-4 uppercase tracking-wider text-xs">3. Security</h2>
          <p>All client portal tokens are unique and cryptographically generated to ensure that only intended parties can access project details.</p>
        </div>
      </main>
    </div>
  );
}

