"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { CheckCircle2, Flag, LoaderCircle, ShieldAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useLocale } from "@/providers/locale-provider";
import type { ReportReason } from "@/types";
import { socialService } from "@/services/social.service";

type ReportTargetType = "listing" | "seller" | "message";

interface ReportDialogProps {
  targetType: ReportTargetType;
  targetId: string;
  triggerLabel?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const reportReasons: Array<{
  value: ReportReason;
  labelKey: string;
  descriptionKey: string;
}> = [
  { value: "fraud", labelKey: "report.reason.fraud", descriptionKey: "report.reason.fraudBody" },
  { value: "fake_listing", labelKey: "report.reason.fake", descriptionKey: "report.reason.fakeBody" },
  { value: "incorrect_info", labelKey: "report.reason.incorrect", descriptionKey: "report.reason.incorrectBody" },
  { value: "prohibited", labelKey: "report.reason.prohibited", descriptionKey: "report.reason.prohibitedBody" },
  { value: "offensive", labelKey: "report.reason.offensive", descriptionKey: "report.reason.offensiveBody" },
  { value: "duplicate", labelKey: "report.reason.duplicate", descriptionKey: "report.reason.duplicateBody" },
  { value: "other", labelKey: "report.reason.other", descriptionKey: "report.reason.otherBody" },
];

export function ReportDialog({
  targetType,
  targetId,
  triggerLabel,
  open,
  onOpenChange,
}: ReportDialogProps) {
  const { t } = useLocale();
  const [internalOpen, setInternalOpen] = useState(false);
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [description, setDescription] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const controlled = open !== undefined;
  const isOpen = controlled ? open : internalOpen;
  const targetLabel = t(`report.target.${targetType}`);
  const standaloneTrigger = triggerLabel ?? (!controlled ? t("report.trigger") : undefined);

  function setOpen(nextOpen: boolean) {
    if (!controlled) setInternalOpen(nextOpen);
    onOpenChange?.(nextOpen);

    if (!nextOpen) {
      window.setTimeout(() => {
        setReason(null);
        setDescription("");
        setSubmitted(false);
      }, 150);
    }
  }

  const submitMutation = useMutation({
    mutationFn: () => {
      if (!reason) throw new Error(t("report.chooseReason"));

      return socialService.report({
        targetType,
        targetId,
        reporter: '',
        reason,
        description: description.trim(),
      });
    },
    onSuccess: () => setSubmitted(true),
  });

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!reason || submitMutation.isPending) return;
    submitMutation.mutate();
  }

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      {standaloneTrigger && (
        <DialogTrigger asChild>
          <Button type="button" variant="ghost" className="text-slate-500 hover:text-rose-700">
            <Flag className="size-4" />
            {standaloneTrigger}
          </Button>
        </DialogTrigger>
      )}

      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
        {submitted ? (
          <div className="py-3">
            <div className="mx-auto grid size-14 place-items-center rounded-full bg-emerald-50 text-emerald-700">
              <CheckCircle2 className="size-7" />
            </div>

            <div className="mt-5 text-center">
              <DialogTitle className="text-xl font-black">{t("report.received")}</DialogTitle>
              <DialogDescription className="mx-auto mt-2 max-w-sm leading-6">
                {t("report.receivedBody", { target: targetLabel })}
              </DialogDescription>
            </div>

            <div className="mt-6 flex justify-center">
              <Button type="button" onClick={() => setOpen(false)}>{t("common.done")}</Button>
            </div>
          </div>
        ) : (
          <>
            <DialogHeader>
              <div className="mb-2 flex size-11 items-center justify-center rounded-xl bg-rose-50 text-rose-700">
                <ShieldAlert className="size-5" />
              </div>
              <DialogTitle>{t("report.title", { target: targetLabel })}</DialogTitle>
              <DialogDescription>{t("report.description")}</DialogDescription>
            </DialogHeader>

            <form className="mt-2 space-y-5" onSubmit={handleSubmit}>
              <fieldset>
                <legend className="mb-3 text-sm font-bold text-slate-900">{t("report.problem")}</legend>
                <div className="space-y-2">
                  {reportReasons.map((item) => (
                    <label
                      key={item.value}
                      className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition ${
                        reason === item.value
                          ? "border-brand-600 bg-brand-50/60 ring-1 ring-brand-600"
                          : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="report-reason"
                        value={item.value}
                        checked={reason === item.value}
                        onChange={() => setReason(item.value)}
                        className="mt-1 size-4 accent-brand-700"
                      />
                      <span className="min-w-0">
                        <span className="block text-sm font-bold text-slate-900">{t(item.labelKey)}</span>
                        <span className="mt-0.5 block text-xs leading-5 text-slate-500">{t(item.descriptionKey)}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <div>
                <label htmlFor={`report-description-${targetId}`} className="mb-2 block text-sm font-bold text-slate-900">
                  {t("report.details")} <span className="ml-1 font-normal text-slate-400">{t("report.optional")}</span>
                </label>
                <textarea
                  id={`report-description-${targetId}`}
                  value={description}
                  onChange={(event) => setDescription(event.target.value.slice(0, 500))}
                  rows={4}
                  maxLength={500}
                  placeholder={t("report.detailsPlaceholder")}
                  className="min-h-28 w-full resize-y rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                />
                <div className="mt-1 flex justify-end">
                  <span className="text-[11px] text-slate-400">{description.length}/500</span>
                </div>
              </div>

              {submitMutation.isError && (
                <div role="alert" className="rounded-xl bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">
                  {submitMutation.error instanceof Error ? submitMutation.error.message : t("report.submitError")}
                </div>
              )}

              <div className="rounded-xl bg-slate-50 p-3 text-xs leading-5 text-slate-500">{t("report.private")}</div>

              <DialogFooter className="gap-2 sm:gap-2">
                <Button type="button" variant="outline" disabled={submitMutation.isPending} onClick={() => setOpen(false)}>
                  {t("common.cancel")}
                </Button>
                <Button type="submit" disabled={!reason || submitMutation.isPending} className="bg-rose-600 text-white hover:bg-rose-700">
                  {submitMutation.isPending ? (
                    <><LoaderCircle className="size-4 animate-spin" />{t("report.submitting")}</>
                  ) : (
                    <><Flag className="size-4" />{t("report.submit")}</>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
