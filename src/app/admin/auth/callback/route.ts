import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const ALLOWED = new Set(["ikabolo59@gmail.com", "abolosamuel6@gmail.com"]);

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: (cs) => cs.forEach(({ name, value, options }) => cookieStore.set(name, value, options)),
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user && ALLOWED.has(user.email ?? "")) {
        return NextResponse.redirect(`${origin}/admin`);
      }
      // Email not on the list — sign them out immediately
      await supabase.auth.signOut();
    }
  }

  return NextResponse.redirect(`${origin}/admin/login?error=unauthorized`);
}
