"use client";

import { useId, useMemo, useState } from "react";
import { issuerKey, type IssuerPreset } from "@/lib/issuers";

export function IssuerNameField({
  value,
  issuers,
  onChange,
  onPick,
}: {
  value: string;
  issuers: IssuerPreset[];
  onChange: (value: string) => void;
  onPick: (issuer: IssuerPreset) => void;
}) {
  const inputId = useId();
  const listId = useId();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const query = issuerKey(value);
  const options = useMemo(() => {
    if (!query) return issuers;
    return issuers.filter((issuer) => issuerKey(issuer.name).includes(query));
  }, [issuers, query]);
  const shown = open && options.length > 0;
  const activeIndex = shown ? Math.min(active, options.length - 1) : -1;

  function pick(issuer: IssuerPreset) {
    onPick(issuer);
    setOpen(false);
  }

  return (
    <div className="control">
      <label htmlFor={inputId}>Nombre</label>
      <div className="issuer-combo">
      <input
        id={inputId}
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={shown}
        aria-controls={shown ? listId : undefined}
        aria-activedescendant={activeIndex >= 0 ? `${listId}-${activeIndex}` : undefined}
        value={value}
        required
        maxLength={220}
        autoComplete="off"
        onChange={(event) => {
          onChange(event.target.value);
          setActive(0);
          setOpen(true);
        }}
        onFocus={() => {
          if (issuers.length > 0) setOpen(true);
        }}
        onBlur={() => setOpen(false)}
        onKeyDown={(event) => {
          if (!shown) {
            if (event.key === "ArrowDown" && issuers.length > 0) {
              event.preventDefault();
              setOpen(true);
            }
            return;
          }
          if (event.key === "ArrowDown") {
            event.preventDefault();
            setActive((current) => (current + 1) % options.length);
          } else if (event.key === "ArrowUp") {
            event.preventDefault();
            setActive((current) => (current - 1 + options.length) % options.length);
          } else if (event.key === "Enter" && activeIndex >= 0) {
            event.preventDefault();
            pick(options[activeIndex]);
          } else if (event.key === "Escape") {
            event.preventDefault();
            setOpen(false);
          }
        }}
      />
      {shown ? (
        <ul id={listId} role="listbox" className="issuer-options" aria-label="Entidades que ya has usado">
          {options.map((issuer, index) => (
            <li key={issuerKey(issuer.name)} role="presentation">
              <button
                id={`${listId}-${index}`}
                type="button"
                role="option"
                aria-selected={index === activeIndex}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => pick(issuer)}
              >
                {issuer.name}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      </div>
      {issuers.length > 0 ? (
        <small>Si eliges una entidad de la lista, se copian el nombre corto, la web y el logo. Un nombre nuevo no los cambia.</small>
      ) : null}
    </div>
  );
}
