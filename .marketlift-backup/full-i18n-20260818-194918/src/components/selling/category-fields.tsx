import type {
  CategoryConfiguration,
  CategoryFieldDefinition,
  CategoryFieldValue,
  ListingAttributes,
} from "@/types";
import { Input } from "@/components/ui/input";

export type CategoryFieldErrors = Record<string, string>;

function valueFor(values: ListingAttributes, field: CategoryFieldDefinition) {
  const value = values[field.id];
  if (field.type === "boolean") return Boolean(value);
  return value ?? "";
}

export function validateCategoryAttributes(
  config: CategoryConfiguration,
  values: ListingAttributes,
): CategoryFieldErrors {
  const errors: CategoryFieldErrors = {};

  for (const field of config.fields) {
    const value = values[field.id];
    const empty = value === undefined || value === null || value === "";

    if (field.required && empty) {
      errors[field.id] = `${field.label} is required.`;
      continue;
    }

    if (field.type === "number" && !empty) {
      const numeric = Number(value);
      if (!Number.isFinite(numeric)) {
        errors[field.id] = `Enter a valid ${field.label.toLowerCase()}.`;
      } else if (field.min !== undefined && numeric < field.min) {
        errors[field.id] =
          `${field.label} must be at least ${field.min}${field.unit ? ` ${field.unit}` : ""}.`;
      } else if (field.max !== undefined && numeric > field.max) {
        errors[field.id] =
          `${field.label} must be at most ${field.max}${field.unit ? ` ${field.unit}` : ""}.`;
      }
    }
  }

  return errors;
}

export function toListingSpecifications(
  config: CategoryConfiguration,
  values: ListingAttributes,
): Record<string, string | number> {
  return Object.fromEntries(
    config.fields.flatMap((field) => {
      const value = values[field.id];
      if (value === undefined || value === null || value === "") return [];

      if (field.type === "boolean") {
        return [[field.label, value ? "Yes" : "No"]];
      }

      const optionLabel = field.options?.find(
        (option) => option.value === String(value),
      )?.label;
      const displayed = optionLabel ?? value;
      const withUnit =
        field.unit && !optionLabel ? `${displayed} ${field.unit}` : displayed;
      return [[field.label, withUnit as string | number]];
    }),
  );
}

export function CategoryFields({
  config,
  values,
  errors = {},
  onChange,
}: {
  config: CategoryConfiguration;
  values: ListingAttributes;
  errors?: CategoryFieldErrors;
  onChange: (fieldId: string, value: CategoryFieldValue) => void;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {config.fields.map((field) => {
        const inputId = `category-field-${field.id}`;
        const error = errors[field.id];
        const describedBy =
          [
            field.helpText ? `${inputId}-help` : "",
            error ? `${inputId}-error` : "",
          ]
            .filter(Boolean)
            .join(" ") || undefined;

        if (field.type === "boolean") {
          return (
            <label
              key={field.id}
              htmlFor={inputId}
              className="flex min-h-16 items-center gap-3 rounded-xl border p-4 sm:col-span-2"
            >
              <input
                id={inputId}
                type="checkbox"
                checked={Boolean(valueFor(values, field))}
                onChange={(event) => onChange(field.id, event.target.checked)}
                className="size-5 rounded border-slate-300 accent-brand-600"
              />
              <span>
                <span className="block text-sm font-bold">{field.label}</span>
                {field.helpText && (
                  <span
                    id={`${inputId}-help`}
                    className="mt-0.5 block text-xs text-slate-500"
                  >
                    {field.helpText}
                  </span>
                )}
              </span>
            </label>
          );
        }

        return (
          <label
            key={field.id}
            htmlFor={inputId}
            className={field.type === "textarea" ? "sm:col-span-2" : ""}
          >
            <span className="mb-1.5 block text-sm font-bold">
              {field.label}
              {field.required && (
                <span className="ml-1 text-red-600" aria-hidden="true">
                  *
                </span>
              )}
            </span>

            {field.type === "select" ? (
              <select
                id={inputId}
                value={String(valueFor(values, field))}
                onChange={(event) => onChange(field.id, event.target.value)}
                aria-invalid={Boolean(error)}
                aria-describedby={describedBy}
                className="h-11 w-full rounded-xl border bg-white px-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              >
                <option value="">Select {field.label.toLowerCase()}</option>
                {field.options?.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : field.type === "textarea" ? (
              <textarea
                id={inputId}
                value={String(valueFor(values, field))}
                onChange={(event) => onChange(field.id, event.target.value)}
                placeholder={field.placeholder}
                aria-invalid={Boolean(error)}
                aria-describedby={describedBy}
                className="min-h-28 w-full rounded-xl border bg-white p-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              />
            ) : (
              <div className="relative">
                <Input
                  id={inputId}
                  type={field.type === "number" ? "number" : "text"}
                  value={String(valueFor(values, field))}
                  min={field.min}
                  max={field.max}
                  step={field.step}
                  placeholder={field.placeholder}
                  aria-invalid={Boolean(error)}
                  aria-describedby={describedBy}
                  onChange={(event) =>
                    onChange(
                      field.id,
                      field.type === "number"
                        ? event.target.value === ""
                          ? ""
                          : Number(event.target.value)
                        : event.target.value,
                    )
                  }
                  className={field.unit ? "pr-16" : undefined}
                />
                {field.unit && (
                  <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs font-semibold text-slate-400">
                    {field.unit}
                  </span>
                )}
              </div>
            )}

            {field.helpText && (
              <span
                id={`${inputId}-help`}
                className="mt-1 block text-xs text-slate-500"
              >
                {field.helpText}
              </span>
            )}
            {error && (
              <span
                id={`${inputId}-error`}
                className="mt-1 block text-sm font-medium text-red-600"
              >
                {error}
              </span>
            )}
          </label>
        );
      })}
    </div>
  );
}
