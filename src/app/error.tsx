"use client";

import { AlertTriangle, RotateCcw } from "lucide-react";
import { useEffect } from "react";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/Button";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <EmptyState
        icon={AlertTriangle}
        title="Something went off-route"
        description="We couldn't load this page. Check your connection — if the problem continues, the database may not be set up yet."
        action={
          <Button onClick={reset}>
            <RotateCcw className="size-4" aria-hidden /> Try again
          </Button>
        }
      />
    </div>
  );
}
