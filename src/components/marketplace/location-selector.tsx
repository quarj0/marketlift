"use client";

import { useMemo, useState } from "react";
import {
  Check,
  ChevronRight,
  LocateFixed,
  MapPin,
  Search,
  X,
} from "lucide-react";

import { brazilLocations } from "@/data/brazil-locations";
import { useLocale } from "@/providers/locale-provider";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { Location } from "@/types";

interface LocationSelectorProps {
  value?: Location;
  compact?: boolean;
  inverse?: boolean;
  onChange?: (location: Location) => void;
}

const recentLocations: Location[] = [
  {
    state: "São Paulo",
    stateCode: "SP",
    city: "São Paulo",
  },
  {
    state: "Rio de Janeiro",
    stateCode: "RJ",
    city: "Rio de Janeiro",
  },
];

export function LocationSelector({
  value,
  compact = false,
  inverse = false,
  onChange,
}: LocationSelectorProps) {
  const { t } = useLocale();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedState, setSelectedState] = useState(
    value?.stateCode ?? "SP",
  );

  const current = value ?? {
    state: "São Paulo",
    stateCode: "SP",
    city: "São Paulo",
  };

  const state =
    brazilLocations.find((item) => item.code === selectedState) ??
    brazilLocations[0];

  const filteredStates = useMemo(
    () =>
      brazilLocations.filter((item) =>
        `${item.name} ${item.code}`
          .toLowerCase()
          .includes(query.toLowerCase()),
      ),
    [query],
  );

  function choose(location: Location) {
    onChange?.(location);
    setOpen(false);
    setQuery("");
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex min-h-11 items-center gap-2 rounded-xl text-left transition focus-visible:ring-2 focus-visible:ring-brand-400",
            compact ? "px-2.5 py-2" : "px-3 py-2",
            inverse
              ? "text-white hover:bg-white/10"
              : "text-slate-700 hover:bg-slate-100",
          )}
          aria-label={t("location.choose")}
        >
          <MapPin
            className={cn(
              "size-4 shrink-0",
              inverse ? "text-cyan-300" : "text-brand-700",
            )}
            aria-hidden="true"
          />

          <span className="min-w-0">
            {!compact && (
              <span
                className={cn(
                  "block text-[10px] font-bold uppercase tracking-wide",
                  inverse ? "text-slate-300" : "text-slate-400",
                )}
              >
                {t("search.location")}
              </span>
            )}

            <span className="block max-w-36 truncate text-sm font-semibold">
              {current.city}, {current.stateCode}
            </span>
          </span>
        </button>
      </DialogTrigger>

      <DialogContent
        showCloseButton={false}
        className="top-auto bottom-0 left-0 max-h-[88dvh] w-full max-w-none translate-x-0 translate-y-0 gap-0 overflow-hidden rounded-b-none rounded-t-3xl p-0 sm:top-1/2 sm:left-1/2 sm:max-w-2xl sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-3xl"
      >
        <div className="flex items-start justify-between gap-4 border-b px-5 py-4">
          <div>
            <DialogTitle className="text-lg font-black text-slate-950">
              {t("location.dialogTitle")}
            </DialogTitle>
            <DialogDescription className="mt-1 text-sm text-slate-500">
              {t("location.dialogDescription")}
            </DialogDescription>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setOpen(false)}
            aria-label={t("location.close")}
          >
            <X className="size-5" aria-hidden="true" />
          </Button>
        </div>

        <div className="overflow-y-auto p-5">
          <Button
            type="button"
            variant="outline"
            className="w-full justify-start"
            onClick={() =>
              choose({
                state: "São Paulo",
                stateCode: "SP",
                city: "São Paulo",
              })
            }
          >
            <LocateFixed className="size-4 text-brand-700" aria-hidden="true" />
            {t("location.useMine")}
          </Button>

          <div className="relative mt-4">
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t("location.search")}
              aria-label={t("location.search")}
              className="pl-10"
            />
          </div>

          {!query && (
            <div className="mt-5">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                {t("location.recent")}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {recentLocations.map((location) => (
                  <button
                    type="button"
                    key={`${location.city}-${location.stateCode}`}
                    onClick={() => choose(location)}
                    className="min-h-11 rounded-full border px-3 py-2 text-sm font-medium hover:border-brand-300 hover:bg-brand-50 focus-visible:ring-2 focus-visible:ring-brand-400"
                  >
                    {location.city}, {location.stateCode}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 grid min-h-64 gap-5 sm:grid-cols-[0.9fr_1.1fr]">
            <div className="max-h-72 overflow-y-auto rounded-xl border p-1">
              {filteredStates.map((item) => (
                <button
                  type="button"
                  key={item.code}
                  onClick={() => setSelectedState(item.code)}
                  aria-pressed={selectedState === item.code}
                  className={cn(
                    "flex min-h-11 w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm focus-visible:ring-2 focus-visible:ring-brand-400",
                    selectedState === item.code
                      ? "bg-brand-50 font-bold text-brand-800"
                      : "hover:bg-slate-50",
                  )}
                >
                  <span>
                    {item.name}{" "}
                    <span className="text-slate-400">({item.code})</span>
                  </span>

                  {selectedState === item.code ? (
                    <Check className="size-4" aria-hidden="true" />
                  ) : (
                    <ChevronRight
                      className="size-4 text-slate-300"
                      aria-hidden="true"
                    />
                  )}
                </button>
              ))}
            </div>

            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                {t("location.citiesIn", { state: state.name })}
              </p>

              <div className="max-h-72 overflow-y-auto rounded-xl border p-1">
                {state.cities
                  .filter((city) =>
                    city.toLowerCase().includes(query.toLowerCase()),
                  )
                  .map((city) => (
                    <button
                      type="button"
                      key={city}
                      onClick={() =>
                        choose({
                          state: state.name,
                          stateCode: state.code,
                          city,
                        })
                      }
                      className="flex min-h-11 w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-brand-400"
                    >
                      {city}
                      <ChevronRight
                        className="size-4 text-slate-300"
                        aria-hidden="true"
                      />
                    </button>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
