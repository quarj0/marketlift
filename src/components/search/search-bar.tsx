"use client";

import { type FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocale } from "@/providers/locale-provider";
import type { Location } from "@/types";

export function SearchBar({
  compact = false,
  location,
  showSubmitButton = true,
}: {
  compact?: boolean;
  location?: Location;
  showSubmitButton?: boolean;
}) {
  const router = useRouter();
  const { t } = useLocale();
  const [q, setQ] = useState("");
  const [localLocation, setLocalLocation] = useState(
    location
      ? `${location.city}, ${location.stateCode}`
      : "São Paulo, SP",
  );

  function submit(event: FormEvent) {
    event.preventDefault();

    const params = new URLSearchParams();

    if (q.trim()) {
      params.set("q", q.trim());
    }

    const selected = location
      ? `${location.city}, ${location.stateCode}`
      : localLocation;

    if (selected) {
      params.set("location", selected);
    }

    router.push(`/search?${params.toString()}`);
  }

  return (
    <form
      onSubmit={submit}
      className={
        compact
          ? "flex w-full gap-2"
          : "grid gap-3 rounded-2xl bg-white p-3 shadow-soft md:grid-cols-[1fr_260px_auto]"
      }
    >
      <label className="relative min-w-0 flex-1">
        <Search className="absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-slate-400" />

        <Input
          value={q}
          onChange={(event) => setQ(event.target.value)}
          className="pl-11"
          placeholder={t("search.placeholder")}
          aria-label={t("search.listings")}
        />
      </label>

      {!compact && (
        <label className="relative">
          <MapPin className="absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-slate-400" />

          <Input
            value={localLocation}
            onChange={(event) =>
              setLocalLocation(event.target.value)
            }
            className="pl-11"
            aria-label={t("search.location")}
          />
        </label>
      )}

      {showSubmitButton && (
        <Button
          type="submit"
          size={compact ? "default" : "lg"}
          className="shrink-0"
        >
          <Search className="size-4" />

          {compact ? (
            <span className="sr-only">
              {t("common.search")}
            </span>
          ) : (
            t("common.search")
          )}
        </Button>
      )}
    </form>
  );
}
