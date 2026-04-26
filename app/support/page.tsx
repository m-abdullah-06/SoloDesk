import { ArrowLeft, Mail } from "lucide-react";
import Link from "next/link";

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-[#FDFDFB] text-black selection:bg-primary/20 flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md w-full glass p-12 rounded-[3rem] border border-black/5 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
        
        <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center text-primary mb-8 mx-auto">
          <Mail size={32} />
        </div>
        
        <h1 className="text-4xl font-black mb-4 tracking-tight">Support</h1>
        <p className="text-neutral-500 mb-8 leading-relaxed">
          Need help with your SoloDesk account or project portals? 
          Send us an email and we'll get back to you shortly.
        </p>

        <a 
          href="mailto:abdullah.muhammad.xyz@gmail.com" 
          className="text-xl font-bold text-primary hover:underline transition-all block"
        >
          abdullah.muhammad.xyz@gmail.com
        </a>

        <div className="mt-12 pt-8 border-t border-black/5">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-black text-muted-foreground hover:text-black transition-colors uppercase tracking-widest">
            <ArrowLeft size={16} /> Back to Landing
          </Link>
        </div>
      </div>
    </div>
  );
}
