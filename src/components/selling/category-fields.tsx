'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import { Input } from '@/components/ui/input';
import { useLocale } from '@/providers/locale-provider';
import { categoryService } from '@/services/category.service';
import type {
  CategoryConfiguration,
  CategoryFieldDefinition,
  CategoryFieldOption,
  CategoryFieldValue,
  ListingAttributes,
} from '@/types';

export type CategoryFieldErrors = Record<string, string>;
type Translate = (key: string, values?: Record<string, string | number>) => string;
type TranslateValue = (value: string) => string;

function valueFor(values: ListingAttributes, field: CategoryFieldDefinition) {
  const value = values[field.id];
  if (field.type === 'boolean') return Boolean(value);
  return value ?? '';
}

function empty(value: unknown) {
  return value === undefined || value === null || value === '';
}

function humanizeCatalogValue(value: string) {
  return value
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function validateCategoryAttributes(
  config: CategoryConfiguration,
  values: ListingAttributes,
  t?: Translate,
  tr: TranslateValue = (value) => value,
): CategoryFieldErrors {
  const errors: CategoryFieldErrors = {};

  for (const field of config.fields) {
    const value = values[field.id];
    const isEmpty = empty(value);
    const label = tr(field.label);

    if (field.required && isEmpty) {
      errors[field.id] = t ? t('categoryFields.required', { label }) : `${label} is required.`;
      continue;
    }

    // Inline/static choices can be checked client-side. Lazy/dependent catalogs
    // are validated authoritatively by Django because only the current option
    // slice is loaded into the browser.
    if (
      field.type === 'select' &&
      !isEmpty &&
      !field.allowCustomValue &&
      !field.lazyOptions &&
      !field.dependsOn &&
      field.options?.length
    ) {
      const selected = String(value);
      if (!field.options.some((option) => option.value === selected)) {
        errors[field.id] = t ? t('categoryFields.valid', { label }) : `Choose a valid ${label.toLowerCase()}.`;
        continue;
      }
    }

    if (field.type === 'number' && !isEmpty) {
      const numeric = Number(value);
      if (!Number.isFinite(numeric)) {
        errors[field.id] = t ? t('categoryFields.valid', { label }) : `Enter a valid ${label.toLowerCase()}.`;
      } else if (field.min !== undefined && numeric < field.min) {
        errors[field.id] = t
          ? t('categoryFields.min', { label, min: field.min, unit: field.unit ? ` ${field.unit}` : '' })
          : `${label} must be at least ${field.min}${field.unit ? ` ${field.unit}` : ''}.`;
      } else if (field.max !== undefined && numeric > field.max) {
        errors[field.id] = t
          ? t('categoryFields.max', { label, max: field.max, unit: field.unit ? ` ${field.unit}` : '' })
          : `${label} must be at most ${field.max}${field.unit ? ` ${field.unit}` : ''}.`;
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
      if (empty(value)) return [];
      if (field.type === 'boolean') return [[field.label, value ? 'Yes' : 'No']];

      const optionLabel = field.options?.find((option) => option.value === String(value))?.label;
      const displayed = optionLabel ?? (
        field.type === 'select' ? humanizeCatalogValue(String(value)) : value
      );
      const withUnit = field.unit && !optionLabel ? `${displayed} ${field.unit}` : displayed;
      return [[field.label, withUnit as string | number]];
    }),
  );
}

function descendantIds(config: CategoryConfiguration, parentId: string) {
  const result: string[] = [];
  const visit = (id: string) => {
    for (const field of config.fields) {
      if (field.dependsOn !== id || result.includes(field.id)) continue;
      result.push(field.id);
      visit(field.id);
    }
  };
  visit(parentId);
  return result;
}

function SelectField({
  config,
  field,
  values,
  error,
  label,
  placeholder,
  describedBy,
  onValue,
}: {
  config: CategoryConfiguration;
  field: CategoryFieldDefinition;
  values: ListingAttributes;
  error?: string;
  label: string;
  placeholder?: string;
  describedBy?: string;
  onValue: (value: CategoryFieldValue) => void;
}) {
  const { t, tr } = useLocale();
  const rawValue = String(valueFor(values, field));
  const parentValue = field.dependsOn ? values[field.dependsOn] : undefined;
  const usesCatalog = Boolean(field.lazyOptions || field.dependsOn);
  const parentToken = field.dependsOn
    ? String(parentValue ?? '')
    : '__marketlift_root__';
  const [otherParentToken, setOtherParentToken] = useState<string | null>(null);
  const otherSelected = otherParentToken === parentToken;

  const optionQuery = useQuery({
    queryKey: [
      'category-field-options',
      config.id,
      field.id,
      parentValue == null ? '' : String(parentValue),
    ],
    queryFn: () =>
      categoryService.getFieldOptions(
        config.id,
        field.id,
        parentValue == null ? undefined : String(parentValue),
      ),
    enabled: usesCatalog && (!field.dependsOn || !empty(parentValue)),
    staleTime: 10 * 60_000,
  });

  const options: CategoryFieldOption[] = usesCatalog
    ? optionQuery.data ?? []
    : field.options ?? [];

  // Existing listings may contain the canonical option value even before a
  // lazy request finishes. Match by either canonical value or human label.
  const selectedOption = options.find(
    (option) => option.value === rawValue || option.label === rawValue,
  );
  const customValue =
    Boolean(field.allowCustomValue) &&
    !empty(rawValue) &&
    !selectedOption &&
    !optionQuery.isLoading;
  const showCustom = otherSelected || customValue;

  const parentField = field.dependsOn
    ? config.fields.find((item) => item.id === field.dependsOn)
    : undefined;
  const disabledByParent = Boolean(field.dependsOn && empty(parentValue));

  return (
    <div className="space-y-2">
      <select
        id={`category-field-${field.id}`}
        value={showCustom ? '__marketlift_other__' : selectedOption?.value ?? rawValue}
        disabled={disabledByParent || optionQuery.isLoading}
        onChange={(event) => {
          const next = event.target.value;
          if (next === '__marketlift_other__') {
            setOtherParentToken(parentToken);
            onValue('');
            return;
          }
          setOtherParentToken(null);
          onValue(next);
        }}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
        className="h-11 w-full rounded-xl border bg-white px-3 text-sm outline-none disabled:bg-slate-50 disabled:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
      >
        <option value="">
          {disabledByParent
            ? `Choose ${parentField ? tr(parentField.label) : 'the previous answer'} first`
            : optionQuery.isLoading
              ? 'Loading choices…'
              : placeholder ?? t('categoryFields.select', { label })}
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {tr(option.label)}
          </option>
        ))}
        {field.allowCustomValue && (
          <option value="__marketlift_other__">Other / Not listed</option>
        )}
      </select>

      {optionQuery.isError && !disabledByParent && (
        <button
          type="button"
          onClick={() => optionQuery.refetch()}
          className="text-xs font-bold text-brand-700 hover:underline"
        >
          Couldn&apos;t load choices. Try again
        </button>
      )}

      {showCustom && (
        <Input
          autoFocus
          value={rawValue}
          placeholder={`Enter ${label.toLowerCase()}`}
          onChange={(event) => onValue(event.target.value)}
        />
      )}
    </div>
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
  const { tr } = useLocale();

  const descendants = useMemo(
    () => new Map(config.fields.map((field) => [field.id, descendantIds(config, field.id)])),
    [config],
  );

  const change = (field: CategoryFieldDefinition, value: CategoryFieldValue) => {
    onChange(field.id, value);
    for (const childId of descendants.get(field.id) ?? []) {
      onChange(childId, '');
    }
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {config.fields.map((field) => {
        const inputId = `category-field-${field.id}`;
        const error = errors[field.id];
        const label = tr(field.label);
        const helpText = field.helpText ? tr(field.helpText) : undefined;
        const placeholder = field.placeholder ? tr(field.placeholder) : undefined;
        const describedBy = [helpText ? `${inputId}-help` : '', error ? `${inputId}-error` : '']
          .filter(Boolean)
          .join(' ') || undefined;

        if (field.type === 'boolean') {
          return (
            <label key={field.id} htmlFor={inputId} className="flex min-h-16 items-center gap-3 rounded-xl border p-4 sm:col-span-2">
              <input
                id={inputId}
                type="checkbox"
                checked={Boolean(valueFor(values, field))}
                onChange={(event) => change(field, event.target.checked)}
                className="size-5 rounded border-slate-300 accent-brand-600"
              />
              <span>
                <span className="block text-sm font-bold">{label}</span>
                {helpText && <span id={`${inputId}-help`} className="mt-0.5 block text-xs text-slate-500">{helpText}</span>}
              </span>
            </label>
          );
        }

        return (
          <label key={field.id} htmlFor={inputId} className={field.type === 'textarea' ? 'sm:col-span-2' : ''}>
            <span className="mb-1.5 block text-sm font-bold">
              {label}{field.required && <span className="ml-1 text-red-600" aria-hidden="true">*</span>}
            </span>

            {field.type === 'select' ? (
              <SelectField
                config={config}
                field={field}
                values={values}
                error={error}
                label={label}
                placeholder={placeholder}
                describedBy={describedBy}
                onValue={(value) => change(field, value)}
              />
            ) : field.type === 'textarea' ? (
              <textarea
                id={inputId}
                value={String(valueFor(values, field))}
                onChange={(event) => change(field, event.target.value)}
                placeholder={placeholder}
                aria-invalid={Boolean(error)}
                aria-describedby={describedBy}
                className="min-h-28 w-full rounded-xl border bg-white p-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              />
            ) : (
              <div className="relative">
                <Input
                  id={inputId}
                  type={field.type === 'number' ? 'number' : 'text'}
                  value={String(valueFor(values, field))}
                  min={field.min}
                  max={field.max}
                  step={field.step}
                  placeholder={placeholder}
                  aria-invalid={Boolean(error)}
                  aria-describedby={describedBy}
                  onChange={(event) =>
                    change(
                      field,
                      field.type === 'number'
                        ? event.target.value === ''
                          ? ''
                          : Number(event.target.value)
                        : event.target.value,
                    )
                  }
                  className={field.unit ? 'pr-16' : undefined}
                />
                {field.unit && (
                  <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs font-semibold text-slate-400">
                    {field.unit}
                  </span>
                )}
              </div>
            )}

            {helpText && <span id={`${inputId}-help`} className="mt-1 block text-xs text-slate-500">{helpText}</span>}
            {error && <span id={`${inputId}-error`} className="mt-1 block text-sm font-medium text-red-600">{error}</span>}
          </label>
        );
      })}
    </div>
  );
}
