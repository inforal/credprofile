"use client";

import { useId, useMemo, useState } from "react";
import { issuerKey } from "@/lib/issuers";

export function SuggestionField({
  label,
  hint,
  value,
  options,
  onChange,
  onPick,
  required = false,
  maxLength,
  placeholder,
  listLabel,
}: {
  label: string;
  hint?: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  onPick?: (value: string) => void;
  required?: boolean;
  maxLength?: number;
  placeholder?: string;
  listLabel: string;
}) {
  const inputId = useId();
  const listId = useId();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const query = issuerKey(value);
  const visible = useMemo(() => {
    const exact = options.some((option) => issuerKey(option) === query);
    if (!query || exact) return options;
    return options.filter((option) => issuerKey(option).includes(query));
  }, [options, query]);
  const shown = open && visible.length > 0;
  const activeIndex = shown ? Math.min(active, visible.length - 1) : -1;

  function pick(option: string) {
    if (onPick) onPick(option);
    else onChange(option);
    setOpen(false);
  }

  return (
    <div className="control">
      <label htmlFor={inputId}>{label}</label>
      <div className="suggestion-combo">
        <input
          id={inputId}
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={shown}
          aria-controls={shown ? listId : undefined}
          aria-activedescendant={activeIndex >= 0 ? `${listId}-${activeIndex}` : undefined}
          value={value}
          required={required}
          maxLength={maxLength}
          placeholder={placeholder}
          autoComplete="off"
          onChange={(event) => {
            onChange(event.target.value);
            setActive(0);
            setOpen(true);
          }}
          onFocus={() => {
            if (options.length > 0) setOpen(true);
          }}
          onBlur={() => setOpen(false)}
          onKeyDown={(event) => {
            if (!shown) {
              if (event.key === "ArrowDown" && options.length > 0) {
                event.preventDefault();
                setOpen(true);
              }
              return;
            }
            if (event.key === "ArrowDown") {
              event.preventDefault();
              setActive((current) => (current + 1) % visible.length);
            } else if (event.key === "ArrowUp") {
              event.preventDefault();
              setActive((current) => (current - 1 + visible.length) % visible.length);
            } else if (event.key === "Enter" && activeIndex >= 0) {
              event.preventDefault();
              pick(visible[activeIndex]);
            } else if (event.key === "Escape") {
              event.preventDefault();
              setOpen(false);
            }
          }}
        />
        {shown ? (
          <ul id={listId} role="listbox" className="suggestion-options" aria-label={listLabel}>
            {visible.map((option, index) => (
              <li key={issuerKey(option)} role="presentation">
                <button
                  id={`${listId}-${index}`}
                  type="button"
                  role="option"
                  aria-selected={index === activeIndex}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => pick(option)}
                >
                  {option}
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
      {hint ? <small>{hint}</small> : null}
    </div>
  );
}
