"use client";

import { Building2, Coffee, ShieldCheck, Siren } from "lucide-react";

import type { Location } from "@/types";
import { useLocale } from "@/providers/locale-provider";

function locationText(location: Location) {
  return [
    location.district,
    location.city,
    location.stateCode || location.state,
    location.countryCode,
  ]
    .filter(Boolean)
    .join(", ");
}

function mapsSearchUrl(query: string, location: Location) {
  const place = locationText(location);
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    place ? `${query} near ${place}` : query,
  )}`;
}

export function SafeMeetupSuggestions({ location }: { location: Location }) {
  const { locale } = useLocale();
  const portuguese = locale === "pt-BR";

  if (!location.city && !location.state && !location.stateCode) return null;

  const copy = portuguese
    ? {
        title: "Encontre um ponto de encontro mais seguro",
        body: "Prefira locais públicos, movimentados e com funcionários. Estas opções abrem uma busca no mapa e não usam os créditos de geocodificação do Marketlift.",
        police: "Delegacia de polícia",
        mall: "Shopping center",
        cafe: "Café público movimentado",
        note: "Confirme o local com a outra pessoa. O Marketlift não verifica nem garante a segurança de estabelecimentos externos.",
        policeQuery: "delegacia de polícia",
        mallQuery: "shopping center",
        cafeQuery: "café movimentado",
      }
    : {
        title: "Find a safer meetup place",
        body: "Prefer a staffed, busy public place. These options open a map search and do not use Marketlift geocoding credits.",
        police: "Police station",
        mall: "Shopping centre",
        cafe: "Busy public café",
        note: "Agree on the venue with the other person. Marketlift does not verify or guarantee third-party venues.",
        policeQuery: "police station",
        mallQuery: "shopping centre",
        cafeQuery: "busy cafe",
      };

  const options = [
    [copy.police, copy.policeQuery, Siren],
    [copy.mall, copy.mallQuery, Building2],
    [copy.cafe, copy.cafeQuery, Coffee],
  ] as const;

  return (
    <details className="border-b border-emerald-100 bg-emerald-50/70 px-4 py-3 text-sm">
      <summary className="flex cursor-pointer list-none items-center gap-2 font-bold text-emerald-950">
        <ShieldCheck className="size-4 shrink-0 text-emerald-700" />
        {copy.title}
      </summary>
      <div className="mt-3">
        <p className="text-xs leading-5 text-emerald-900/80">{copy.body}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {options.map(([label, query, Icon]) => (
            <a
              key={label}
              href={mapsSearchUrl(query, location)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-emerald-200 bg-white px-3 py-2 text-xs font-bold text-emerald-900 transition hover:border-emerald-300 hover:bg-emerald-50"
            >
              <Icon className="size-4" />
              {label}
            </a>
          ))}
        </div>
        <p className="mt-3 text-[11px] leading-4 text-emerald-900/65">
          {copy.note}
        </p>
      </div>
    </details>
  );
}
