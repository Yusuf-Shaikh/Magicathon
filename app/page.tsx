import Link from "next/link";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import { Button } from "@/components/ui/button";
import { checkSupabaseConnection } from "@/lib/supabase";

export default async function Home() {
  const user = await currentUser();
  const name =
    user?.firstName ??
    user?.username ??
    user?.emailAddresses[0]?.emailAddress ??
    "there";

  const supabaseStatus = user ? await checkSupabaseConnection() : null;

  return (
    <main className="flex min-h-dvh items-center justify-center px-4">
      <SignedOut>
        <div className="w-full max-w-sm text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-gradient-brand">
            Magicathon
          </h1>
          <div className="mt-8 flex flex-col gap-3">
            <Button asChild variant="gradient" size="lg">
              <Link href="/sign-in">Sign in</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/sign-up">Sign up</Link>
            </Button>
          </div>
        </div>
      </SignedOut>

      <SignedIn>
        <div className="absolute right-4 top-4">
          <UserButton afterSignOutUrl="/" />
        </div>
        <div className="flex flex-col items-center gap-5">
          <h1 className="text-4xl font-semibold tracking-tight">
            Hello, <span className="text-gradient-brand">{name}</span>.
          </h1>
          {supabaseStatus && (
            <div
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs ${
                supabaseStatus.ok
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                  : "border-rose-500/30 bg-rose-500/10 text-rose-300"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  supabaseStatus.ok ? "bg-emerald-400" : "bg-rose-400"
                } ${supabaseStatus.ok ? "animate-pulse" : ""}`}
              />
              {supabaseStatus.detail}
            </div>
          )}
        </div>
      </SignedIn>
    </main>
  );
}
