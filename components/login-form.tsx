"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Alert, Field } from "@/components/form-ui";
import { authErrorMessage } from "@/lib/errors";
import { createClient } from "@/lib/supabase/client";

export function LoginForm({ nextPath }: { nextPath: string }) {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const value = identifier.trim();
    if (!value || !password) {
      setError("Escribe tu correo o usuario y la contraseña.");
      return;
    }

    setPending(true);
    const supabase = createClient();
    try {
      let email = value.toLowerCase();
      if (!value.includes("@")) {
        const { data, error: rpcError } = await supabase.rpc("get_email_for_login", {
          p_identifier: value,
        });
        if (rpcError) {
          setError("No se pudo comprobar el usuario.");
          return;
        }
        email = typeof data === "string" ? data.trim().toLowerCase() : "";
        if (!email) {
          setError("No hay ninguna cuenta con ese usuario.");
          return;
        }
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) {
        setError(authErrorMessage(signInError.message));
        return;
      }
      router.push(nextPath);
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="card pad stack" onSubmit={onSubmit} noValidate aria-busy={pending}>
      <p className="muted">Correo o nombre de usuario, y contraseña.</p>
      {error ? <Alert>{error}</Alert> : null}
      <Field label="Correo o usuario">
        <input
          value={identifier}
          onChange={(event) => setIdentifier(event.target.value)}
          autoComplete="username"
          required
        />
      </Field>
      <Field label="Contraseña">
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="current-password"
          required
        />
      </Field>
      <button className="btn" type="submit" disabled={pending}>
        {pending ? "Entrando…" : "Entrar"}
      </button>
      <p className="muted">
        ¿Aún no tienes cuenta? <Link href="/registro">Crear cuenta</Link>
      </p>
    </form>
  );
}
