"use client";

import { useState } from "react";

export function CopyLink({ value, label = "Copiar" }: { value: string; label?: string }) {
  const [done, setDone] = useState(false);

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setDone(true);
    } catch {
      setDone(false);
    }
  }

  return (
    <span className="copy-row">
      <code>{value.replace(/^https?:\/\//, "")}</code>
      <button type="button" className="text-button" onClick={onCopy}>
        {done ? "Copiado" : label}
      </button>
    </span>
  );
}
