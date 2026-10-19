"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { DeleteCredentialButton } from "@/components/delete-credential-button";
import { createClient } from "@/lib/supabase/client";

export type PanelCredentialItem = {
  id: string;
  title: string;
  issuer: string;
  date: string | null;
  username: string;
  slug: string;
  published: boolean;
  badgeUrl: string | null;
  paths: string[];
};

function moveItem(items: PanelCredentialItem[], id: string, direction: -1 | 1) {
  const index = items.findIndex((item) => item.id === id);
  const target = index + direction;
  if (index < 0 || target < 0 || target >= items.length) return items;
  const next = items.slice();
  const [item] = next.splice(index, 1);
  next.splice(target, 0, item);
  return next;
}

export function PanelCredentialList({ items }: { items: PanelCredentialItem[] }) {
  const router = useRouter();
  const incoming = items.map((item) => item.id).join("\0");
  const [seen, setSeen] = useState(incoming);
  const [order, setOrder] = useState(items);
  if (incoming !== seen) {
    setSeen(incoming);
    setOrder(items);
  }
  const [dragging, setDragging] = useState<string | null>(null);
  const [over, setOver] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function persist(next: PanelCredentialItem[]) {
    const previous = order;
    setOrder(next);
    setPending(true);
    setStatus("Guardando el orden…");
    const supabase = createClient();
    for (let index = 0; index < next.length; index += 1) {
      const { error } = await supabase.from("credentials").update({ sort_order: index }).eq("id", next[index].id);
      if (error) {
        setOrder(previous);
        setStatus("No se pudo guardar el orden. Inténtalo de nuevo.");
        setPending(false);
        return;
      }
    }
    setStatus("Orden guardado");
    setPending(false);
    router.refresh();
  }

  function dropOn(targetId: string) {
    if (!dragging || dragging === targetId) {
      setDragging(null);
      setOver(null);
      return;
    }
    const from = order.findIndex((item) => item.id === dragging);
    const to = order.findIndex((item) => item.id === targetId);
    if (from < 0 || to < 0) return;
    const next = order.slice();
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    setDragging(null);
    setOver(null);
    void persist(next);
  }

  return (
    <>
      <ul className="cred-list">
        {order.map((credential, index) => (
          <li
            className={`card cred-row${dragging === credential.id ? " is-dragging" : ""}${over === credential.id ? " is-over" : ""}`}
            key={credential.id}
            onDragOver={(event) => {
              event.preventDefault();
              if (dragging && dragging !== credential.id) setOver(credential.id);
            }}
            onDrop={(event) => {
              event.preventDefault();
              dropOn(credential.id);
            }}
          >
            <div className="order-tools">
              <button
                type="button"
                className="drag-handle"
                draggable={!pending}
                aria-label={`Arrastrar ${credential.title}. Flecha arriba o abajo para moverla.`}
                onDragStart={(event) => {
                  setDragging(credential.id);
                  event.dataTransfer.effectAllowed = "move";
                  event.dataTransfer.setData("text/plain", credential.id);
                }}
                onDragEnd={() => {
                  setDragging(null);
                  setOver(null);
                }}
                onKeyDown={(event) => {
                  if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return;
                  event.preventDefault();
                  const next = moveItem(order, credential.id, event.key === "ArrowUp" ? -1 : 1);
                  if (next !== order) void persist(next);
                }}
              >
                <GripIcon />
              </button>
              <div className="nudge">
                <button type="button" aria-label={`Subir ${credential.title}`} disabled={pending || index === 0} onClick={() => void persist(moveItem(order, credential.id, -1))}>
                  Subir
                </button>
                <button
                  type="button"
                  aria-label={`Bajar ${credential.title}`}
                  disabled={pending || index === order.length - 1}
                  onClick={() => void persist(moveItem(order, credential.id, 1))}
                >
                  Bajar
                </button>
              </div>
            </div>
            {credential.badgeUrl ? <img src={credential.badgeUrl} alt={`Insignia de ${credential.title}`} /> : null}
            <div className="cred-copy">
              <strong>{credential.title}</strong>
              <p>
                {credential.issuer}
                {credential.date ? ` · ${credential.date}` : ""}
              </p>
              <p className="muted">
                /{credential.username}/{credential.slug}
              </p>
            </div>
            <div className="row-actions">
              <span className={credential.published ? "pill ok" : "pill"}>{credential.published ? "Publicada" : "Borrador"}</span>
              {credential.published ? <Link href={`/${credential.username}/${credential.slug}`}>Ver</Link> : null}
              <Link href={`/panel/credencial/${credential.id}`}>Editar</Link>
              <DeleteCredentialButton id={credential.id} paths={credential.paths} />
            </div>
          </li>
        ))}
      </ul>
      <p className="muted" role="status">
        {status}
      </p>
    </>
  );
}

function GripIcon() {
  return (
    <svg width="14" height="18" viewBox="0 0 14 18" aria-hidden="true">
      <circle cx="4" cy="3" r="1.4" fill="currentColor" />
      <circle cx="10" cy="3" r="1.4" fill="currentColor" />
      <circle cx="4" cy="9" r="1.4" fill="currentColor" />
      <circle cx="10" cy="9" r="1.4" fill="currentColor" />
      <circle cx="4" cy="15" r="1.4" fill="currentColor" />
      <circle cx="10" cy="15" r="1.4" fill="currentColor" />
    </svg>
  );
}
