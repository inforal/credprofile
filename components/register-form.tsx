"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Alert, Field } from "@/components/form-ui";
import { authErrorMessage } from "@/lib/errors";
import { emailConfirmUrl } from "@/lib/site";
import { createClient } from "@/lib/supabase/client";
import { isEmail, usernameProblem } from "@/lib/validation";

export function RegisterForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    if (!isEmail(email)) {
      setError("Escribe un correo válido.");
      return;
    }
    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (fullName.trim().length < 2) {
      setError("El nombre debe tener al menos 2 caracteres.");
      return;
    }
    const usernameError = usernameProblem(username);
    if (usernameError) {
      setError(usernameError);
      return;
    }

    setPending(true);
    const supabase = createClient();
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          emailRedirectTo: emailConfirmUrl(),
          data: {
            username: username.trim(),
            full_name: fullName.trim(),
          },
        },
      });
      if (signUpError) {
        setError(authErrorMessage(signUpError.message));
        return;
      }
      if (data.user && data.user.identities && data.user.identities.length === 0) {
        setError("Ya existe una cuenta con ese correo.");
        return;
      }
      if (data.session) {
        router.push("/panel");
        router.refresh();
        return;
      }
      setMessage(email.trim().toLowerCase());
    } finally {
      setPending(false);
    }
  }

  if (message) {
    return (
      <section className="card pad stack" role="status" aria-live="polite">
        <p className="eyebrow">Cuenta creada</p>
        <h2>Revisa tu email</h2>
        <p className="about">
          Te hemos enviado un enlace de confirmación a <strong>{message}</strong>. Ábrelo en este navegador para activar
          la cuenta. Después podrás entrar.
        </p>
        <p className="muted">Si no llega en unos minutos, mira en el correo no deseado. El enlace caduca.</p>
        <Link className="btn" href="/entrar">
          Ir a entrar
        </Link>
      </section>
    );
  }

  return (
    <form className="card pad stack" onSubmit={onSubmit} noValidate aria-busy={pending}>
      {error ? <Alert>{error}</Alert> : null}
      <Field label="Nombre completo">
        <input value={fullName} onChange={(event) => setFullName(event.target.value)} autoComplete="name" required />
      </Field>
      <Field label="Usuario" hint="De 3 a 40 caracteres. Letras, números, puntos y guiones.">
        <input
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          autoComplete="username"
          spellCheck={false}
          required
        />
      </Field>
      <Field label="Correo">
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
          required
        />
      </Field>
      <Field label="Contraseña" hint="Mínimo 8 caracteres.">
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="new-password"
          required
          minLength={8}
        />
      </Field>
      <button className="btn" type="submit" disabled={pending}>
        {pending ? "Creando cuenta…" : "Crear cuenta"}
      </button>
    </form>
  );
}
