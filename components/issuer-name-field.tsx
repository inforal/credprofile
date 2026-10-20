"use client";

import { SuggestionField } from "@/components/suggestion-field";
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
  return (
    <SuggestionField
      label="Nombre"
      hint={
        issuers.length > 0
          ? "Si eliges una entidad de la lista, se copian el nombre corto, la web y el logo. Un nombre nuevo no los cambia."
          : undefined
      }
      value={value}
      options={issuers.map((issuer) => issuer.name)}
      onChange={onChange}
      onPick={(name) => {
        const issuer = issuers.find((item) => issuerKey(item.name) === issuerKey(name));
        if (issuer) onPick(issuer);
      }}
      required
      maxLength={220}
      listLabel="Entidades que ya has usado"
    />
  );
}
