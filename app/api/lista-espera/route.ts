import { isEmail } from "@/lib/validation";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Escribe un correo válido." }, { status: 400 });
  }
  const email = typeof body === "object" && body && "email" in body && typeof body.email === "string" ? body.email.trim() : "";
  if (!isEmail(email) || email.length > 254) {
    return Response.json({ error: "Escribe un correo válido." }, { status: 400 });
  }

  const webhookUrl = process.env.N8N_WAITLIST_WEBHOOK_URL?.trim();
  const secret = process.env.N8N_WAITLIST_SECRET;
  if (!webhookUrl || !secret) {
    return Response.json({ error: "La lista de espera aún no está conectada." }, { status: 503 });
  }

  let response: Response;
  try {
    response = await fetch(webhookUrl, {
      method: "POST",
      redirect: "manual",
      headers: {
        "Content-Type": "application/json",
        "X-Waitlist-Secret": secret,
      },
      body: JSON.stringify({ email }),
    });
  } catch {
    return Response.json({ error: "No se pudo apuntar el correo. Inténtalo de nuevo." }, { status: 502 });
  }

  if (!response.ok) {
    return Response.json({ error: "No se pudo apuntar el correo. Inténtalo de nuevo." }, { status: 502 });
  }

  return Response.json({ ok: true });
}
