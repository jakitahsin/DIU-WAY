import { MapPinOff } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { ButtonLink } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <EmptyState
        icon={MapPinOff}
        title="Wrong stop"
        description="This page doesn't exist. Let's get you back on the route."
        action={<ButtonLink href="/">Back home</ButtonLink>}
      />
    </div>
  );
}
