"use client";

import { useEffect, useRef, useState, type ClipboardEvent } from "react";
import { descriptionToEditorHtml, sanitizeDescription } from "@/lib/rich-text";
import { safeHttpUrl } from "@/lib/validation";

export function RichTextEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (html: string) => void;
}) {
  const areaRef = useRef<HTMLDivElement>(null);
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkValue, setLinkValue] = useState("");
  const [linkError, setLinkError] = useState<string | null>(null);

  useEffect(() => {
    const area = areaRef.current;
    if (!area) return;
    area.innerHTML = descriptionToEditorHtml(value);
    // The stored value is the source of truth only when the editor mounts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function emit() {
    onChange(sanitizeDescription(areaRef.current?.innerHTML ?? ""));
  }

  function exec(command: string, argument?: string) {
    areaRef.current?.focus();
    document.execCommand(command, false, argument);
    emit();
  }

  function onPaste(event: ClipboardEvent<HTMLDivElement>) {
    event.preventDefault();
    const html = event.clipboardData.getData("text/html");
    const text = event.clipboardData.getData("text/plain");
    const safe = html
      ? sanitizeDescription(html)
      : text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br>");
    document.execCommand("insertHTML", false, safe);
    emit();
  }

  function applyLink() {
    const href = safeHttpUrl(linkValue);
    if (!href) {
      setLinkError("El enlace debe empezar por http:// o https://.");
      return;
    }
    setLinkError(null);
    setLinkOpen(false);
    setLinkValue("");
    exec("createLink", href);
  }

  return (
    <div className="rich-editor">
      <div className="rich-toolbar" role="toolbar" aria-label="Formato de la descripción">
        <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => exec("bold")}>
          Negrita
        </button>
        <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => exec("italic")}>
          Cursiva
        </button>
        <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => exec("insertUnorderedList")}>
          Lista
        </button>
        <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => exec("insertOrderedList")}>
          Lista numerada
        </button>
        <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => setLinkOpen((open) => !open)}>
          Enlace
        </button>
      </div>
      {linkOpen ? (
        <div className="rich-link">
          <input
            value={linkValue}
            onChange={(event) => setLinkValue(event.target.value)}
            placeholder="https://"
            aria-label="Dirección del enlace"
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                applyLink();
              }
            }}
          />
          <button type="button" onClick={applyLink}>
            Añadir
          </button>
          {linkError ? <small>{linkError}</small> : null}
        </div>
      ) : null}
      <div
        ref={areaRef}
        className="rich-area"
        contentEditable
        role="textbox"
        aria-multiline="true"
        aria-label="Acerca de esta certificación"
        onInput={emit}
        onPaste={onPaste}
        suppressContentEditableWarning
      />
    </div>
  );
}
