import { safeHttpUrl } from "@/lib/validation";

const ALLOWED = new Set(["p", "br", "strong", "em", "ul", "ol", "li", "a"]);

function decodeEntities(text: string): string {
  return text
    .replace(/&nbsp;/gi, "\u00a0")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&#(\d+);/g, (_, digits: string) => safeCodePoint(Number(digits)))
    .replace(/&#x([0-9a-f]+);/gi, (_, hex: string) => safeCodePoint(parseInt(hex, 16)))
    .replace(/&amp;/gi, "&");
}

function safeCodePoint(value: number): string {
  if (!Number.isFinite(value) || value < 0 || value > 0x10ffff) return "";
  if (value < 32 && value !== 9 && value !== 10 && value !== 13) return "";
  return String.fromCodePoint(value);
}

function escapeText(text: string): string {
  return decodeEntities(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function escapeAttr(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "");
}

function safeHref(attrs: string): string | null {
  const match = /\bhref\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/i.exec(attrs);
  const raw = decodeEntities((match?.[1] ?? match?.[2] ?? match?.[3] ?? "").trim());
  if (!raw || /[\u0000-\u001f\s]/.test(raw)) return null;
  if (/^mailto:/i.test(raw)) {
    const address = raw.slice(7).split("?")[0];
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address)) return null;
    return `mailto:${address}`;
  }
  return safeHttpUrl(raw);
}

function normalizeTag(tag: string): string | null {
  const name = tag.toLowerCase();
  if (name === "b") return "strong";
  if (name === "i") return "em";
  return ALLOWED.has(name) ? name : null;
}

export function looksLikeHtml(value: string): boolean {
  return /<\/?(?:p|br|strong|b|em|i|ul|ol|li|a)\b/i.test(value);
}

export function sanitizeDescription(input: string): string {
  const source = input
    .replace(/\u0000/g, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<(script|style|iframe|object|embed|svg|math|noscript|template)\b[^>]*>[\s\S]*?<\/\1>/gi, "")
    .replace(/<(script|style|iframe|object|embed|svg|math|noscript|template)\b[\s\S]*$/gi, "");
  const re = /<\/?\s*([a-zA-Z][a-zA-Z0-9]*)\b([^<>]*)>/g;
  let out = "";
  let last = 0;
  const stack: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = re.exec(source))) {
    out += escapeText(source.slice(last, match.index));
    const tag = normalizeTag(match[1]);
    const closing = /^<\s*\//.test(match[0]);
    if (tag === "br" && !closing) {
      out += "<br>";
    } else if (tag && closing) {
      const index = stack.lastIndexOf(tag);
      if (index !== -1) {
        while (stack.length > index) {
          out += `</${stack.pop()}>`;
        }
      }
    } else if (tag === "a") {
      const href = safeHref(match[2]);
      if (href) {
        out += `<a href="${escapeAttr(href)}" rel="noopener noreferrer" target="_blank">`;
        stack.push("a");
      }
    } else if (tag) {
      out += `<${tag}>`;
      stack.push(tag);
    }
    last = match.index + match[0].length;
  }
  out += escapeText(source.slice(last));
  while (stack.length) out += `</${stack.pop()}>`;
  return out.replace(/(?:<p>\s*(?:<br>)?\s*<\/p>)+/gi, "").trim();
}

export function descriptionIsEmpty(value: string): boolean {
  const text = value
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .trim();
  return text.length === 0;
}

export function descriptionToEditorHtml(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (looksLikeHtml(trimmed)) return sanitizeDescription(trimmed);
  return trimmed
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${escapeText(paragraph).replace(/\n/g, "<br>")}</p>`)
    .join("");
}

export function descriptionToPlain(value: string): string {
  const source = looksLikeHtml(value) ? sanitizeDescription(value) : value;
  return decodeEntities(source.replace(/<br\s*\/?>/gi, "\n").replace(/<\/(p|li|ul|ol)>/gi, "\n").replace(/<[^>]+>/g, ""))
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function normalizeStoredDescription(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (!looksLikeHtml(trimmed)) return trimmed;
  const safe = sanitizeDescription(trimmed);
  return descriptionIsEmpty(safe) ? null : safe;
}
