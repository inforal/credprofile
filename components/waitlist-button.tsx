"use client";

import { useEffect, useId, useState, type ReactNode } from "react";
import { WaitlistForm } from "@/components/waitlist-form";

export function WaitlistButton({ className, children }: { className?: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open]);

  return (
    <>
      <button className={className} type="button" onClick={() => setOpen(true)}>
        {children}
      </button>
      {open ? (
        <div className="waitlist-backdrop" onClick={() => setOpen(false)}>
          <div
            className="waitlist-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            onClick={(event) => event.stopPropagation()}
          >
            <button className="text-button waitlist-close" type="button" onClick={() => setOpen(false)}>
              Cerrar
            </button>
            <WaitlistForm titleId={titleId} />
          </div>
        </div>
      ) : null}
    </>
  );
}
