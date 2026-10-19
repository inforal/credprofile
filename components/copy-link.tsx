"use client";

import { useState } from "react";

export function CopyLink({
  value,
  label = "Copiar",
  showValue = true,
  buttonClassName = "text-button",
}: {
  value: string;
  label?: string;
  showValue?: boolean;
  buttonClassName?: string;
}) {
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
    <span className={showValue ? "copy-row" : "copy-only"}>
      {showValue ? <code>{value.replace(/^https?:\/\//, "")}</code> : null}
      <button type="button" className={buttonClassName} onClick={onCopy}>
        {done ? "Copiado" : label}
      </button>
    </span>
  );
}
