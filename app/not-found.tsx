import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh items-center justify-center px-4">
      <div className="max-w-md text-center">
        <p className="text-7xl font-semibold text-gradient-brand">404</p>
        <p className="mt-2 text-sm text-muted-foreground">
          That page doesn&apos;t exist.
        </p>
        <Button asChild variant="gradient" className="mt-6">
          <Link href="/">Go home</Link>
        </Button>
      </div>
    </div>
  );
}
