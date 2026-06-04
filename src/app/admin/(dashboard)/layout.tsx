import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminNav from "./AdminNav";

async function signOut() {
  "use server";
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/admin/login");

  return (
    <div className="min-h-screen bg-base-200">
      <header className="h-12 bg-neutral border-b border-neutral-content/10 flex items-center justify-between px-6 sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <span className="font-mono text-base font-bold text-neutral-content tracking-tight">
            SA<span className="text-primary">.</span>
          </span>
          <span className="text-neutral-content/15 text-xs">|</span>
          <AdminNav />
        </div>
        <div className="flex items-center gap-4">
          <span className="text-neutral-content/40 text-xs hidden sm:block">{user.email}</span>
          <form action={signOut}>
            <button type="submit" className="text-xs text-neutral-content/40 hover:text-neutral-content/70 transition-colors">
              Sign out
            </button>
          </form>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {children}
      </main>
    </div>
  );
}
