"use client";

import { AlertTriangle } from "lucide-react";
import { useEffect, useRef } from "react";
import { Button } from "./ui/Button";

type Props = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

/** Accessible modal built on the native <dialog> element (Esc + focus trap). */
export function ConfirmationDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive = false,
  loading = false,
  onConfirm,
  onCancel,
}: Props) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onCancel={(e) => {
        e.preventDefault();
        onCancel();
      }}
      onClick={(e) => {
        if (e.target === ref.current) onCancel();
      }}
      className="m-auto w-[min(92vw,420px)] rounded-3xl border border-line bg-surface p-0 text-ink shadow-lift backdrop:bg-navy/50 backdrop:backdrop-blur-sm open:animate-rise"
      aria-labelledby="confirm-title"
      aria-describedby="confirm-desc"
    >
      <div className="p-6">
        <div
          className={
            destructive
              ? "mb-4 grid size-12 place-items-center rounded-2xl bg-[#fdecea] text-[#c0392b]"
              : "mb-4 grid size-12 place-items-center rounded-2xl bg-brand-soft text-brand"
          }
        >
          <AlertTriangle className="size-6" aria-hidden />
        </div>
        <h2 id="confirm-title" className="font-display text-xl font-bold">
          {title}
        </h2>
        <p id="confirm-desc" className="mt-2 text-sm text-muted">
          {description}
        </p>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onCancel} type="button" autoFocus>
            {cancelLabel}
          </Button>
          <Button
            variant={destructive ? "danger" : "primary"}
            onClick={onConfirm}
            loading={loading}
            type="button"
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </dialog>
  );
}
