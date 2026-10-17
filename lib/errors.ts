export class FormError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FormError";
  }
}

export function formErrorMessage(error: unknown, fallback: string): string {
  return error instanceof FormError ? error.message : fallback;
}

export function authErrorMessage(message: string): string {
  const normalized = message.toLowerCase();
  if (normalized.includes("invalid login credentials")) {
    return "Correo, usuario o contraseña incorrectos.";
  }
  if (normalized.includes("email not confirmed")) {
    return "Confirma tu correo antes de entrar.";
  }
  if (normalized.includes("user already registered") || normalized.includes("already been registered")) {
    return "Ya existe una cuenta con ese correo.";
  }
  if (normalized.includes("password")) {
    return "La contraseña no cumple los requisitos del acceso.";
  }
  if (normalized.includes("rate limit") || normalized.includes("too many")) {
    return "Demasiados intentos. Espera un momento y vuelve a probar.";
  }
  if (normalized.includes("username") || normalized.includes("profiles_username")) {
    return "Ese nombre de usuario ya está en uso o no es válido.";
  }
  return "No se pudo completar el acceso. Inténtalo de nuevo.";
}

export function dbErrorMessage(error: { code?: string; message?: string }): string {
  const message = error.message ?? "";
  if (error.code === "23505") {
    if (message.includes("username")) return "Ese nombre de usuario ya está en uso.";
    if (message.includes("slug")) return "Ya tienes una credencial con ese enlace.";
    if (message.includes("email")) return "Ese correo ya está registrado.";
    return "Ese dato ya está en uso.";
  }
  if (message.includes("credentials_slug_format")) {
    return "El enlace solo puede tener minúsculas, números y guiones.";
  }
  if (message.includes("profiles_username_format")) {
    return "El usuario debe tener de 3 a 40 caracteres y empezar y terminar con letra o número.";
  }
  if (message.includes("profiles_full_name")) {
    return "El nombre debe tener al menos 2 caracteres.";
  }
  if (message.includes("credentials_badge_source")) {
    return "La insignia no es válida. Sube un archivo o pega una URL https.";
  }
  if (message.includes("credentials_pdf_source")) {
    return "El PDF no es válido. Sube un archivo o pega una URL https.";
  }
  if (message.includes("credentials_issuer_logo")) {
    return "El logo del emisor no es válido.";
  }
  if (message.includes("credentials_verification_url") || message.includes("credentials_issuer_url")) {
    return "Las direcciones web deben empezar por http:// o https://.";
  }
  return "No se pudo guardar. Revisa los datos e inténtalo de nuevo.";
}

export function storageErrorMessage(message: string): string {
  const normalized = message.toLowerCase();
  if (normalized.includes("mime") || normalized.includes("invalid") && normalized.includes("type")) {
    return "Ese tipo de archivo no está permitido.";
  }
  if (normalized.includes("size") || normalized.includes("exceeded") || normalized.includes("too large")) {
    return "El archivo supera el tamaño máximo.";
  }
  if (normalized.includes("policy") || normalized.includes("row-level") || normalized.includes("unauthorized")) {
    return "No tienes permiso para guardar ese archivo.";
  }
  return "No se pudo subir el archivo. Inténtalo de nuevo.";
}
