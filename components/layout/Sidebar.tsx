"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  Sparkles,
  FileText,
  Receipt,
  Settings,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/ThemeToggle";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/clients",   icon: Users,           label: "Clients" },
  { href: "/projects",  icon: FolderKanban,    label: "Projects" },
  { href: "/ai",        icon: Sparkles,         label: "AI Messages" },
  { href: "/invoices",  icon: Receipt,          label: "Invoices" },
  { href: "/proposals", icon: FileText,         label: "Proposals" },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <aside className="hidden md:flex flex-col w-60 h-screen fixed left-0 top-0 z-30 sidebar-shell">
      {/* Logo */}
      <div
        className="px-5 py-5"
        style={{ borderBottom: "1px solid var(--sidebar-border)" }}
      >
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200 group-hover:scale-105"
            style={{
              background: "linear-gradient(135deg, #F5790A 0%, #e86d07 100%)",
              boxShadow: "0 0 16px rgba(245,121,10,0.4)",
            }}
          >
            <span className="text-white font-black text-sm">S</span>
          </div>
          <span className="font-display font-bold text-foreground text-lg tracking-tight">
            SoloDesk
          </span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active =
            pathname === href ||
            (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group relative",
                active
                  ? "text-accent"
                  : "text-muted-foreground hover:text-foreground",
              )}
              style={
                active
                  ? { background: "var(--nav-active-bg)" }
                  : undefined
              }
              onMouseEnter={(e) => {
                if (!active)
                  (e.currentTarget as HTMLElement).style.background =
                    "var(--nav-hover-bg)";
              }}
              onMouseLeave={(e) => {
                if (!active)
                  (e.currentTarget as HTMLElement).style.background = "";
              }}
            >
              {active && (
                <span
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full"
                  style={{ background: "#F5790A" }}
                />
              )}
              <Icon size={17} strokeWidth={active ? 2.5 : 1.8} />
              <span>{label}</span>
              {active && (
                <ChevronRight size={12} className="ml-auto opacity-40" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div
        className="px-3 py-4 space-y-0.5"
        style={{ borderTop: "1px solid var(--sidebar-border)" }}
      >
        {/* Theme toggle row */}
        <div className="flex items-center gap-2 px-2 mb-2">
          <ThemeToggle />
          <span className="text-xs text-muted-foreground">Toggle theme</span>
        </div>

        <Link
          href="/settings"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground transition-all duration-150"
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background =
              "var(--nav-hover-bg)";
            (e.currentTarget as HTMLElement).style.color = "var(--foreground)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = "";
            (e.currentTarget as HTMLElement).style.color = "";
          }}
        >
          <Settings size={17} strokeWidth={1.8} />
          Settings
        </Link>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-red-500/10 hover:text-red-400 transition-all duration-150"
        >
          <LogOut size={17} strokeWidth={1.8} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
