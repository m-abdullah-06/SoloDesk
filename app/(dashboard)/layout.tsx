import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Ensure user profile exists in public.users
  const { data: profile } = await supabase.from("users").select("id").eq("id", user.id).single();
  if (!profile) {
    await supabase.from("users").insert({
      id: user.id,
      name: user.user_metadata?.name || user.email?.split("@")[0] || "Freelancer",
      email: user.email,
    });
  }

  return (
    <div className="min-h-screen bg-bg-base">
      <Sidebar />
      <main className="md:ml-60 min-h-screen">
        <div className="max-w-5xl mx-auto px-4 py-6 dashboard-content">
          {children}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
