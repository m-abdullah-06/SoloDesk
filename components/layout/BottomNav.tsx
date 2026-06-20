"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  Sparkles,
  MoreHorizontal,
  Settings,
  LogOut,
  Receipt,
  FileText,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Home" },
  { href: "/clients", icon: Users, label: "Clients" },
  { href: "/projects", icon: FolderKanban, label: "Projects" },
  { href: "/ai", icon: Sparkles, label: "AI" },
];

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const supabase = createClient();

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  const moreItems = [
    { href: "/invoices", icon: Receipt, label: "Invoices" },
    { href: "/proposals", icon: FileText, label: "Proposals" },
    { href: "/settings", icon: Settings, label: "Settings" },
  ];

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-background border-t border-border shadow-[0_-5px_20px_rgba(0,0,0,0.03)] dark:shadow-[0_-5px_20px_rgba(0,0,0,0.5)]">
        <div className="flex items-center justify-around px-2 py-2 pb-safe">
          {navItems.map(({ href, icon: Icon, label }) => {
            const active =
              pathname === href ||
              (href !== "/dashboard" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-200 min-w-[56px]",
                  active ? "text-accent" : "text-muted-foreground",
                )}
              >
                <div
                  className={cn(
                    "p-1.5 rounded-xl transition-all duration-200",
                    active ? "bg-accent-light" : "",
                  )}
                >
                  <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
                </div>
                <span
                  className={cn(
                    "text-[10px] font-bold uppercase tracking-tighter",
                    active ? "text-accent" : "",
                  )}
                >
                  {label}
                </span>
              </Link>
            );
          })}

          <button
            onClick={() => setIsMenuOpen(true)}
            className={cn(
              "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-200 min-w-[56px]",
              isMenuOpen ? "text-accent" : "text-muted-foreground",
            )}
          >
            <div
              className={cn(
                "p-1.5 rounded-xl transition-all duration-200",
                isMenuOpen ? "bg-accent/10" : "",
              )}
            >
              <MoreHorizontal size={20} strokeWidth={1.8} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-tighter">
              More
            </span>
          </button>
        </div>
      </nav>

      {/* More Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] md:hidden"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 z-[70] bg-background rounded-t-[2.5rem] p-6 shadow-2xl dark:shadow-2xl md:hidden border-t border-border"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-lg font-black tracking-tight text-foreground">
                  SOLODESK
                </h3>
                <div className="flex items-center gap-2">
                  <ThemeToggle />
                  <button
                    onClick={() => setIsMenuOpen(false)}
                    className="p-2 hover:bg-muted rounded-full transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2 mb-8">
                {moreItems.map(({ href, icon: Icon, label }) => {
                  const active = pathname === href;
                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setIsMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-4 p-4 rounded-2xl text-sm font-bold transition-all",
                        active
                          ? "bg-accent text-white"
                          : "hover:bg-muted text-foreground",
                      )}
                    >
                      <Icon size={20} />
                      {label}
                    </Link>
                  );
                })}

                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-4 p-4 rounded-2xl text-sm font-bold text-destructive hover:bg-red-50 dark:hover:bg-red-950/30 transition-all text-left"
                >
                  <LogOut size={20} />
                  Sign Out
                </button>
              </div>

              <div className="text-center pb-6">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-40">
                  SoloDesk Mobile v1.0
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
