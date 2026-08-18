"use client";

import { useLocale } from "@/providers/locale-provider";

export function SkipLink() {
  const { t } = useLocale();

  return (
    <a href="#main-content" className="skip-link">
      {t("a11y.skipToContent")}
    </a>
  );
}
