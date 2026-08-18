import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, "aria-invalid": ariaInvalid, ...props }, ref) => (
  <input
    ref={ref}
    aria-invalid={ariaInvalid}
    className={cn(
      "h-12 w-full rounded-xl border bg-white px-3.5 text-base text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500 sm:text-sm",
      ariaInvalid &&
        "border-rose-400 focus:border-rose-500 focus:ring-rose-100",
      className,
    )}
    {...props}
  />
));
Input.displayName = "Input";
