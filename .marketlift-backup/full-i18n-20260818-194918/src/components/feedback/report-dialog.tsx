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
import type { ReportReason } from "@/types";

type ReportTargetType = "listing" | "seller" | "message";

interface ReportDialogProps {
  targetType: ReportTargetType;
  targetId: string;

  /**
   * Use this when ReportDialog should render its own button.
   *
   * Example:
   * <ReportDialog
   *   targetType="listing"
   *   targetId={listing.id}
   *   triggerLabel="Report listing"
   * />
   */
  triggerLabel?: string;

  /**
   * Controlled mode.
   *
   * Useful when another component, such as a dropdown menu,
   * controls when this dialog opens.
   */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const reportReasons: Array<{
  value: ReportReason;
  label: string;
  description: string;
}> = [
  {
    value: "fraud",
    label: "Fraud or scam",
    description:
      "The user may be attempting to scam, deceive, or steal from someone.",
  },
  {
    value: "fake_listing",
    label: "Fake listing",
    description: "The listing, product, service, or offer appears to be fake.",
  },
  {
    value: "incorrect_info",
    label: "Incorrect information",
    description: "Important information appears misleading or inaccurate.",
  },
  {
    value: "prohibited",
    label: "Prohibited content",
    description: "The content may violate Marketlift marketplace rules.",
  },
  {
    value: "offensive",
    label: "Abusive or offensive behaviour",
    description:
      "The user sent threatening, abusive, hateful, or inappropriate content.",
  },
  {
    value: "duplicate",
    label: "Duplicate or spam",
    description: "The same content is being repeatedly posted or sent.",
  },
  {
    value: "other",
    label: "Something else",
    description: "Report another safety or marketplace concern.",
  },
];

async function submitMockReport(input: {
  targetType: ReportTargetType;
  targetId: string;
  reason: ReportReason;
  description: string;
}) {
  /*
   * Temporary frontend service boundary.
   *
   * Replace this function later with the real API call, e.g.
   *
   * return reportService.createReport(input);
   *
   * POST /api/reports/
   */

  await new Promise((resolve) => setTimeout(resolve, 500));

  return {
    id: `report-${Date.now()}`,
    ...input,
    status: "open" as const,
  };
}

export function ReportDialog({
  targetType,
  targetId,
  triggerLabel,
  open,
  onOpenChange,
}: ReportDialogProps) {
  /*
   * Supports both:
   *
   * 1. Standalone trigger mode:
   *    <ReportDialog triggerLabel="Report listing" ... />
   *
   * 2. Controlled mode:
   *    <ReportDialog
   *      open={reportOpen}
   *      onOpenChange={setReportOpen}
   *      ...
   *    />
   */

  const [internalOpen, setInternalOpen] = useState(false);

  const [reason, setReason] = useState<ReportReason | null>(null);

  const [description, setDescription] = useState("");

  const [submitted, setSubmitted] = useState(false);

  const controlled = open !== undefined;

  const isOpen = controlled ? open : internalOpen;

  function setOpen(nextOpen: boolean) {
    if (!controlled) {
      setInternalOpen(nextOpen);
    }

    onOpenChange?.(nextOpen);

    /*
     * Reset the form after the dialog has closed.
     * We don't reset while open because that would erase
     * the user's current selections.
     */
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
      if (!reason) {
        throw new Error("Choose a reason for your report.");
      }

      return submitMockReport({
        targetType,
        targetId,
        reason,
        description: description.trim(),
      });
    },

    onSuccess: () => {
      setSubmitted(true);
    },
  });

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!reason || submitMutation.isPending) {
      return;
    }

    submitMutation.mutate();
  }

  const targetLabel = targetType === "message" ? "conversation" : targetType;

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      {triggerLabel && (
        <DialogTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            className="text-slate-500 hover:text-rose-700"
          >
            <Flag className="size-4" />
            {triggerLabel}
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
              <DialogTitle className="text-xl font-black">
                Report received
              </DialogTitle>

              <DialogDescription className="mx-auto mt-2 max-w-sm leading-6">
                Thanks for helping keep Marketlift safe. We&apos;ll review this{" "}
                {targetLabel} and take action when necessary.
              </DialogDescription>
            </div>

            <div className="mt-6 flex justify-center">
              <Button type="button" onClick={() => setOpen(false)}>
                Done
              </Button>
            </div>
          </div>
        ) : (
          <>
            <DialogHeader>
              <div className="mb-2 flex size-11 items-center justify-center rounded-xl bg-rose-50 text-rose-700">
                <ShieldAlert className="size-5" />
              </div>

              <DialogTitle>Report {targetLabel}</DialogTitle>

              <DialogDescription>
                Tell us what&apos;s wrong. Reports help us investigate unsafe
                behaviour and marketplace rule violations.
              </DialogDescription>
            </DialogHeader>

            <form className="mt-2 space-y-5" onSubmit={handleSubmit}>
              <fieldset>
                <legend className="mb-3 text-sm font-bold text-slate-900">
                  What&apos;s the problem?
                </legend>

                <div className="space-y-2">
                  {reportReasons.map((item) => (
                    <label
                      key={item.value}
                      className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition ${
                        reason === item.value
                          ? "border-blue-600 bg-blue-50/60 ring-1 ring-blue-600"
                          : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="report-reason"
                        value={item.value}
                        checked={reason === item.value}
                        onChange={() => setReason(item.value)}
                        className="mt-1 size-4 accent-blue-700"
                      />

                      <span className="min-w-0">
                        <span className="block text-sm font-bold text-slate-900">
                          {item.label}
                        </span>

                        <span className="mt-0.5 block text-xs leading-5 text-slate-500">
                          {item.description}
                        </span>
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <div>
                <label
                  htmlFor={`report-description-${targetId}`}
                  className="mb-2 block text-sm font-bold text-slate-900"
                >
                  Additional details
                  <span className="ml-1 font-normal text-slate-400">
                    (optional)
                  </span>
                </label>

                <textarea
                  id={`report-description-${targetId}`}
                  value={description}
                  onChange={(event) =>
                    setDescription(event.target.value.slice(0, 500))
                  }
                  rows={4}
                  maxLength={500}
                  placeholder="Add any details that can help us understand the issue."
                  className="min-h-28 w-full resize-y rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />

                <div className="mt-1 flex justify-end">
                  <span className="text-[11px] text-slate-400">
                    {description.length}/500
                  </span>
                </div>
              </div>

              {submitMutation.isError && (
                <div
                  role="alert"
                  className="rounded-xl bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700"
                >
                  {submitMutation.error instanceof Error
                    ? submitMutation.error.message
                    : "Could not submit your report. Please try again."}
                </div>
              )}

              <div className="rounded-xl bg-slate-50 p-3 text-xs leading-5 text-slate-500">
                Your report is private. The person you report won&apos;t be told
                who submitted it.
              </div>

              <DialogFooter className="gap-2 sm:gap-2">
                <Button
                  type="button"
                  variant="outline"
                  disabled={submitMutation.isPending}
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  disabled={!reason || submitMutation.isPending}
                  className="bg-rose-600 text-white hover:bg-rose-700"
                >
                  {submitMutation.isPending ? (
                    <>
                      <LoaderCircle className="size-4 animate-spin" />
                      Submitting…
                    </>
                  ) : (
                    <>
                      <Flag className="size-4" />
                      Submit report
                    </>
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
