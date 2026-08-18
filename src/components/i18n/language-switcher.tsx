"use client";

import { ChevronDown, Languages } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Locale } from "@/i18n/config";
import { useLocale } from "@/providers/locale-provider";

interface LanguageSwitcherProps {
  compact?: boolean;
  inverse?: boolean;
  className?: string;
}

const options: Array<{
  value: Locale;
  shortLabel: string;
  nativeLabel: string;
}> = [
  {
    value: "en",
    shortLabel: "EN",
    nativeLabel: "English",
  },
  {
    value: "pt-BR",
    shortLabel: "PT",
    nativeLabel: "Português (Brasil)",
  },
];

export function LanguageSwitcher({
  compact = false,
  inverse = false,
  className,
}: LanguageSwitcherProps) {
  const { locale, setLocale, t } = useLocale();

  const current =
    options.find((option) => option.value === locale) ?? options[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          aria-label={`${t("settings.language")}: ${current.nativeLabel}`}
          className={cn(
            "h-11 shrink-0 gap-1.5 px-2.5 font-bold",
            !compact && "px-3",
            inverse &&
              "border-white/20 bg-white/10 text-white hover:bg-white/15 hover:text-white",
            className,
          )}
        >
          <Languages className="size-4" />
          <span>{current.shortLabel}</span>
          {!compact && (
            <ChevronDown className="size-3.5 opacity-60" />
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          {t("settings.language")}
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuRadioGroup
          value={locale}
          onValueChange={(value) => setLocale(value as Locale)}
        >
          {options.map((option) => (
            <DropdownMenuRadioItem
              key={option.value}
              value={option.value}
              className="min-h-11 cursor-pointer"
            >
              <span className="flex min-w-0 items-center gap-3">
                <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-slate-100 text-[11px] font-black text-slate-600">
                  {option.shortLabel}
                </span>

                <span className="truncate font-medium">
                  {option.nativeLabel}
                </span>
              </span>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
