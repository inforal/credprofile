"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Alert, Field } from "@/components/form-ui";
import { authErrorMessage } from "@/lib/errors";
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
      setMessage("Cuenta creada. Revisa tu correo para confirmarla y después entra.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="card pad stack" onSubmit={onSubmit} noValidate>
      <div>
        <h1 className="page-title">Crear cuenta</h1>
        <p className="muted">El usuario será la dirección de tu perfil público.</p>
      </div>
      {error ? <Alert>{error}</Alert> : null}
      {message ? <Alert kind="ok">{message}</Alert> : null}
      <Field label="Nombre completo">
        <input value={fullName} onChange={(event) => setFullName(event.target.value)} autoComplete="name" required />
      </Field>
      <Field label="Usuario" hint="De 3 a 40 caracteres. Letras, números, puntos y guiones.">
        <input value={username} onChange={(event) => setUsername(event.target.value)} autoComplete="username" required />
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
