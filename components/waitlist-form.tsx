"use client";

import { useState, type FormEvent } from "react";
import { Alert, Field } from "@/components/form-ui";
import { isEmail } from "@/lib/validation";

type Status = "idle" | "sending" | "done" | "error";

export function WaitlistForm({ titleId = "waitlist-title" }: { titleId?: string }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    if (!isEmail(email)) {
      setStatus("error");
      setError("Escribe un correo válido.");
      return;
    }
    setStatus("sending");
    try {
      const response = await fetch("/api/lista-espera", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      if (!response.ok) {
        setStatus("error");
        setError(payload?.error || "No se pudo apuntar el correo. Inténtalo de nuevo.");
        return;
      }
      setStatus("done");
    } catch {
      setStatus("error");
      setError("No se pudo apuntar el correo. Inténtalo de nuevo.");
    }
  }

  return (
    <form className="waitlist-card stack" onSubmit={onSubmit} noValidate>
      <div>
        <p className="eyebrow">Acceso</p>
        <h2 id={titleId}>El acceso es por invitación</h2>
        <p className="about">
          Si todavía no tienes invitación, pide entrada en la lista de espera y te avisamos cuando haya sitio.
        </p>
      </div>
      {status === "done" ? (
        <Alert kind="ok">Te hemos apuntado</Alert>
      ) : (
        <>
          {status === "error" && error ? <Alert>{error}</Alert> : null}
          <Field label="Correo">
            <input
              type="email"
              name="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
              maxLength={254}
            />
          </Field>
          <button className="btn" type="submit" disabled={status === "sending"}>
            {status === "sending" ? "Enviando…" : "Unirse a la lista de espera"}
          </button>
        </>
      )}
    </form>
  );
}
