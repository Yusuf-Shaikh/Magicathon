import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

export async function checkSupabaseConnection(): Promise<{
  ok: boolean;
  detail: string;
}> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return { ok: false, detail: "Missing Supabase env vars" };
  }

  try {
    const res = await fetch(`${url}/auth/v1/health`, {
      headers: { apikey: key },
      cache: "no-store",
    });
    return res.ok
      ? { ok: true, detail: "Supabase connected" }
      : { ok: false, detail: `Supabase HTTP ${res.status}` };
  } catch (e) {
    return {
      ok: false,
      detail: e instanceof Error ? e.message : "Connection failed",
    };
  }
}
