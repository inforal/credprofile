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
  categoryId: string | null;
};

export type PanelCategoryItem = {
  id: string;
  name: string;
};

type DragState = { kind: "category" | "credential"; id: string; categoryId: string | null };

function moveWithin<T>(items: T[], from: number, direction: -1 | 1): T[] {
  const target = from + direction;
  if (from < 0 || target < 0 || target >= items.length) return items;
  const next = items.slice();
  const [item] = next.splice(from, 1);
  next.splice(target, 0, item);
  return next;
}

export function PanelCredentialList({
  items,
  categories,
}: {
  items: PanelCredentialItem[];
  categories: PanelCategoryItem[];
}) {
  const router = useRouter();
  const incoming = `${categories.map((category) => category.id).join(",")}|${items
    .map((item) => `${item.categoryId ?? ""}:${item.id}`)
    .join(",")}`;
  const [seen, setSeen] = useState(incoming);
  const [categoryOrder, setCategoryOrder] = useState(categories);
  const [order, setOrder] = useState(items);
  if (incoming !== seen) {
    setSeen(incoming);
    setCategoryOrder(categories);
    setOrder(items);
  }
  const [dragging, setDragging] = useState<DragState | null>(null);
  const [over, setOver] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const namedIds = new Set(categoryOrder.map((category) => category.id));
  const groups = [
    ...categoryOrder.map((category) => ({
      category,
      items: order.filter((item) => item.categoryId === category.id),
    })),
    {
      category: null as PanelCategoryItem | null,
      items: order.filter((item) => !item.categoryId || !namedIds.has(item.categoryId)),
    },
  ].filter((group) => group.category || group.items.length > 0);

  async function persistCredentials(next: PanelCredentialItem[], categoryId: string | null) {
    const previous = order;
    setOrder(next);
    setPending(true);
    setStatus("Guardando el orden…");
    const supabase = createClient();
    const group = next.filter((item) => (categoryId ? item.categoryId === categoryId : !item.categoryId || !namedIds.has(item.categoryId)));
    for (let index = 0; index < group.length; index += 1) {
      const { error } = await supabase.from("credentials").update({ sort_order: index }).eq("id", group[index].id);
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

  async function persistCategories(next: PanelCategoryItem[]) {
    const previous = categoryOrder;
    setCategoryOrder(next);
    setPending(true);
    setStatus("Guardando el orden…");
    const supabase = createClient();
    for (let index = 0; index < next.length; index += 1) {
      const { error } = await supabase.from("credential_categories").update({ sort_order: index }).eq("id", next[index].id);
      if (error) {
        setCategoryOrder(previous);
        setStatus("No se pudo guardar el orden. Inténtalo de nuevo.");
        setPending(false);
        return;
      }
    }
    setStatus("Orden guardado");
    setPending(false);
    router.refresh();
  }

  function moveCredential(id: string, categoryId: string | null, direction: -1 | 1) {
    const group = order.filter((item) => (categoryId ? item.categoryId === categoryId : !item.categoryId || !namedIds.has(item.categoryId)));
    const localIndex = group.findIndex((item) => item.id === id);
    const moved = moveWithin(group, localIndex, direction);
    if (moved === group) return;
    const queue = moved.slice();
    const next = order.map((item) => {
      const inGroup = categoryId ? item.categoryId === categoryId : !item.categoryId || !namedIds.has(item.categoryId);
      return inGroup ? (queue.shift() ?? item) : item;
    });
    void persistCredentials(next, categoryId);
  }

  function moveCategory(id: string, direction: -1 | 1) {
    const index = categoryOrder.findIndex((category) => category.id === id);
    const next = moveWithin(categoryOrder, index, direction);
    if (next !== categoryOrder) void persistCategories(next);
  }

  function dropCredential(targetId: string) {
    if (!dragging || dragging.kind !== "credential" || dragging.id === targetId) {
      setDragging(null);
      setOver(null);
      return;
    }
    const target = order.find((item) => item.id === targetId);
    if (!target || target.categoryId !== dragging.categoryId) {
      setDragging(null);
      setOver(null);
      return;
    }
    const from = order.findIndex((item) => item.id === dragging.id);
    const to = order.findIndex((item) => item.id === targetId);
    const next = order.slice();
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    setDragging(null);
    setOver(null);
    void persistCredentials(next, dragging.categoryId);
  }

  function dropCategory(targetId: string) {
    if (!dragging || dragging.kind !== "category" || dragging.id === targetId) {
      setDragging(null);
      setOver(null);
      return;
    }
    const from = categoryOrder.findIndex((category) => category.id === dragging.id);
    const to = categoryOrder.findIndex((category) => category.id === targetId);
    if (from < 0 || to < 0) return;
    const next = categoryOrder.slice();
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    setDragging(null);
    setOver(null);
    void persistCategories(next);
  }

  return (
    <>
      <div className="category-groups">
        {groups.map((group) => {
          const categoryIndex = group.category ? categoryOrder.findIndex((category) => category.id === group.category?.id) : -1;
          return (
            <section className="category-group" key={group.category?.id ?? "sin-categoria"}>
              {group.category ? (
                <div
                  className={`category-head${over === `category:${group.category.id}` ? " is-over" : ""}`}
                  onDragOver={(event) => {
                    if (dragging?.kind !== "category") return;
                    event.preventDefault();
                    setOver(`category:${group.category?.id}`);
                  }}
                  onDrop={(event) => {
                    event.preventDefault();
                    if (group.category) dropCategory(group.category.id);
                  }}
                >
                  <button
                    type="button"
                    className="drag-handle"
                    draggable={!pending}
                    aria-label={`Arrastrar la categoría ${group.category.name}. Flecha arriba o abajo para moverla.`}
                    onDragStart={(event) => {
                      setDragging({ kind: "category", id: group.category!.id, categoryId: null });
                      event.dataTransfer.effectAllowed = "move";
                      event.dataTransfer.setData("text/plain", group.category!.id);
                    }}
                    onDragEnd={() => {
                      setDragging(null);
                      setOver(null);
                    }}
                    onKeyDown={(event) => {
                      if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return;
                      event.preventDefault();
                      moveCategory(group.category!.id, event.key === "ArrowUp" ? -1 : 1);
                    }}
                  >
                    <GripIcon />
                  </button>
                  <h3>{group.category.name}</h3>
                  <div className="nudge">
                    <button type="button" aria-label={`Subir categoría ${group.category.name}`} disabled={pending || categoryIndex <= 0} onClick={() => moveCategory(group.category!.id, -1)}>
                      Subir
                    </button>
                    <button
                      type="button"
                      aria-label={`Bajar categoría ${group.category.name}`}
                      disabled={pending || categoryIndex === categoryOrder.length - 1}
                      onClick={() => moveCategory(group.category!.id, 1)}
                    >
                      Bajar
                    </button>
                  </div>
                </div>
              ) : categoryOrder.length > 0 ? (
                <h3 className="category-loose">Sin categoría</h3>
              ) : null}
              <ul className="cred-list">
                {group.items.map((credential, index) => (
                  <li
                    className={`card cred-row${dragging?.id === credential.id ? " is-dragging" : ""}${over === credential.id ? " is-over" : ""}`}
                    key={credential.id}
                    onDragOver={(event) => {
                      if (dragging?.kind !== "credential" || dragging.categoryId !== credential.categoryId) return;
                      event.preventDefault();
                      if (dragging.id !== credential.id) setOver(credential.id);
                    }}
                    onDrop={(event) => {
                      event.preventDefault();
                      dropCredential(credential.id);
                    }}
                  >
                    <div className="order-tools">
                      <button
                        type="button"
                        className="drag-handle"
                        draggable={!pending}
                        aria-label={`Arrastrar ${credential.title}. Flecha arriba o abajo para moverla.`}
                        onDragStart={(event) => {
                          setDragging({ kind: "credential", id: credential.id, categoryId: credential.categoryId });
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
                          moveCredential(credential.id, group.category?.id ?? null, event.key === "ArrowUp" ? -1 : 1);
                        }}
                      >
                        <GripIcon />
                      </button>
                      <div className="nudge">
                        <button type="button" aria-label={`Subir ${credential.title}`} disabled={pending || index === 0} onClick={() => moveCredential(credential.id, group.category?.id ?? null, -1)}>
                          Subir
                        </button>
                        <button
                          type="button"
                          aria-label={`Bajar ${credential.title}`}
                          disabled={pending || index === group.items.length - 1}
                          onClick={() => moveCredential(credential.id, group.category?.id ?? null, 1)}
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
            </section>
          );
        })}
      </div>
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
