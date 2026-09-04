'use client';

import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronDown } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
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
      errors[field.id] = t
        ? t('categoryFields.required', { label })
        : `${label} is required.`;
      continue;
    }

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
        errors[field.id] = t
          ? t('categoryFields.valid', { label })
          : `Choose a valid ${label.toLowerCase()}.`;
        continue;
      }
    }

    if (field.type === 'number' && !isEmpty) {
      const numeric = Number(value);
      if (!Number.isFinite(numeric)) {
        errors[field.id] = t
          ? t('categoryFields.valid', { label })
          : `Enter a valid ${label.toLowerCase()}.`;
      } else if (field.min !== undefined && numeric < field.min) {
        errors[field.id] = t
          ? t('categoryFields.min', {
              label,
              min: field.min,
              unit: field.unit ? ` ${field.unit}` : '',
            })
          : `${label} must be at least ${field.min}${field.unit ? ` ${field.unit}` : ''}.`;
      } else if (field.max !== undefined && numeric > field.max) {
        errors[field.id] = t
          ? t('categoryFields.max', {
              label,
              max: field.max,
              unit: field.unit ? ` ${field.unit}` : '',
            })
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
  const result: Record<string, string | number> = {};
  const groups = new Map<string, string[]>();

  for (const field of config.fields) {
    const value = values[field.id];
    if (field.type === 'boolean') {
      if (field.uiGroup) {
        if (value === true) {
          const selected = groups.get(field.uiGroup) ?? [];
          selected.push(field.label);
          groups.set(field.uiGroup, selected);
        }
      } else if (value !== undefined) {
        result[field.label] = value ? 'Yes' : 'No';
      }
      continue;
    }

    if (empty(value)) continue;
    const optionLabel = field.options?.find(
      (option) => option.value === String(value),
    )?.label;
    const displayed =
      optionLabel ??
      (field.type === 'select'
        ? humanizeCatalogValue(String(value))
        : (value as string | number));
    result[field.label] =
      field.unit && !optionLabel ? `${displayed} ${field.unit}` : displayed;
  }

  for (const [label, selected] of groups) {
    if (selected.length) result[label] = selected.join(', ');
  }

  return result;
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
  const [catalogSearch, setCatalogSearch] = useState('');
  const debouncedCatalogSearch = useDebouncedValue(catalogSearch, 250);
  const otherSelected = otherParentToken === parentToken;

  const optionQuery = useQuery({
    queryKey: [
      'category-field-options',
      config.id,
      field.id,
      parentValue == null ? '' : String(parentValue),
      debouncedCatalogSearch,
    ],
    queryFn: () =>
      categoryService.getFieldOptions(
        config.id,
        field.id,
        parentValue == null ? undefined : String(parentValue),
        debouncedCatalogSearch || undefined,
      ),
    enabled: usesCatalog && (!field.dependsOn || !empty(parentValue)),
    staleTime: 10 * 60_000,
  });

  const options = useMemo<CategoryFieldOption[]>(
    () => (usesCatalog ? optionQuery.data ?? [] : field.options ?? []),
    [field.options, optionQuery.data, usesCatalog],
  );

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

  useEffect(() => {
    if (
      !field.dependsOn ||
      !field.required ||
      disabledByParent ||
      optionQuery.isLoading ||
      otherSelected ||
      rawValue !== '' ||
      options.length !== 1
    ) {
      return;
    }

    // Safe deterministic prefill: when a required dependent field has exactly
    // one known valid choice for the selected parent, choose it automatically.
    // The seller can still switch to "Other / Not listed" where custom values
    // are allowed.
    onValue(options[0].value);
  }, [
    disabledByParent,
    field.dependsOn,
    field.required,
    onValue,
    optionQuery.isLoading,
    options,
    otherSelected,
    rawValue,
  ]);

  const autoFilled =
    Boolean(field.dependsOn) &&
    field.required &&
    options.length === 1 &&
    rawValue === options[0]?.value;

  // Dependent catalogs (for example make -> model -> year) must remain one
  // control per answer. Their parent selection already narrows the option set,
  // so a second search box only duplicates the field and makes the form noisy.
  const showCatalogSearch =
    usesCatalog &&
    !field.dependsOn &&
    !disabledByParent &&
    (field.optionCount ?? 0) > 250;

  return (
    <div className="space-y-2">
      {showCatalogSearch && (
        <Input
          value={catalogSearch}
          onChange={(event) => setCatalogSearch(event.target.value)}
          placeholder={t('categoryFields.search', { label: label.toLowerCase() })}
          autoComplete="off"
          aria-label={`Search ${label}`}
        />
      )}

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
          setCatalogSearch('');
          onValue(next);
        }}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
        className="h-11 w-full rounded-xl border bg-white px-3 text-sm outline-none disabled:bg-slate-50 disabled:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
      >
        <option value="">
          {disabledByParent
            ? t('categoryFields.chooseFirst', {
                label: parentField
                  ? tr(parentField.label)
                  : t('categoryFields.previousAnswer'),
              })
            : optionQuery.isLoading
              ? t('categoryFields.loading')
              : debouncedCatalogSearch && options.length === 0
                ? t('categoryFields.noMatch', { search: debouncedCatalogSearch })
                : placeholder ?? t('categoryFields.select', { label })}
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {tr(option.label)}
          </option>
        ))}
        {field.allowCustomValue && (
          <option value="__marketlift_other__">{t('categoryFields.other')}</option>
        )}
      </select>

      {autoFilled && <span className="sr-only">{t('categoryFields.autoSelected')}</span>}

      {optionQuery.isError && !disabledByParent && (
        <button
          type="button"
          onClick={() => optionQuery.refetch()}
          className="text-xs font-bold text-brand-700 hover:underline"
        >
          {t('categoryFields.loadError')}
        </button>
      )}

      {showCustom && (
        <Input
          autoFocus
          value={rawValue}
          placeholder={t('categoryFields.enter', { label: label.toLowerCase() })}
          onChange={(event) => onValue(event.target.value)}
        />
      )}
    </div>
  );
}

function BooleanGroup({
  label,
  fields,
  values,
  onChange,
}: {
  label: string;
  fields: CategoryFieldDefinition[];
  values: ListingAttributes;
  onChange: (field: CategoryFieldDefinition, value: boolean) => void;
}) {
  const { t, tr } = useLocale();
  const [open, setOpen] = useState(false);
  const selected = fields.filter((field) => values[field.id] === true);
  const summary =
    selected.length === 0
      ? t('categoryFields.selectOptions')
      : selected.length <= 2
        ? selected.map((field) => tr(field.label)).join(', ')
        : `${selected.slice(0, 2).map((field) => tr(field.label)).join(', ')} +${selected.length - 2}`;

  return (
    <div className="relative sm:col-span-2">
      <span className="mb-1.5 block text-sm font-bold">{tr(label)}</span>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className="flex min-h-11 w-full items-center justify-between gap-3 rounded-xl border bg-white px-3 py-2 text-left text-sm outline-none hover:border-brand-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
      >
        <span className={selected.length ? 'font-semibold text-slate-800' : 'text-slate-500'}>
          {summary}
        </span>
        <ChevronDown
          className={`size-4 shrink-0 text-slate-400 transition ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="mt-2 grid max-h-72 overflow-y-auto rounded-xl border bg-white sm:grid-cols-2">
          {fields.map((field) => (
            <label
              key={field.id}
              className="flex min-h-11 cursor-pointer items-center gap-3 border-b px-3 py-2 text-sm last:border-b-0 hover:bg-slate-50 sm:nth-last-[-n+2]:border-b-0"
            >
              <input
                type="checkbox"
                checked={values[field.id] === true}
                onChange={(event) => onChange(field, event.target.checked)}
                className="size-4 rounded border-slate-300 accent-brand-600"
              />
              <span className="font-medium">{tr(field.label)}</span>
            </label>
          ))}
        </div>
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
  const { t, tr } = useLocale();

  const descendants = useMemo(
    () =>
      new Map(
        config.fields.map((field) => [
          field.id,
          descendantIds(config, field.id),
        ]),
      ),
    [config],
  );

  const renderItems = useMemo(() => {
    const groups = new Map<string, CategoryFieldDefinition[]>();
    for (const field of config.fields) {
      if (!field.uiGroup || field.type !== 'boolean') continue;
      const items = groups.get(field.uiGroup) ?? [];
      items.push(field);
      groups.set(field.uiGroup, items);
    }

    const seenGroups = new Set<string>();
    const result: Array<
      | { kind: 'field'; field: CategoryFieldDefinition }
      | { kind: 'group'; label: string; fields: CategoryFieldDefinition[] }
    > = [];

    for (const field of config.fields) {
      if (field.uiGroup && field.type === 'boolean') {
        if (seenGroups.has(field.uiGroup)) continue;
        seenGroups.add(field.uiGroup);
        result.push({
          kind: 'group',
          label: field.uiGroup,
          fields: groups.get(field.uiGroup) ?? [],
        });
        continue;
      }
      result.push({ kind: 'field', field });
    }

    return result;
  }, [config.fields]);

  const change = (
    field: CategoryFieldDefinition,
    value: CategoryFieldValue,
  ) => {
    onChange(field.id, value);
    for (const childId of descendants.get(field.id) ?? []) {
      onChange(childId, '');
    }
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {renderItems.map((item) => {
        if (item.kind === 'group') {
          return (
            <BooleanGroup
              key={`group-${item.label}`}
              label={item.label}
              fields={item.fields}
              values={values}
              onChange={(field, value) => change(field, value)}
            />
          );
        }

        const field = item.field;
        const inputId = `category-field-${field.id}`;
        const error = errors[field.id];
        const label = tr(field.label);
        const helpText = field.helpText ? tr(field.helpText) : undefined;
        const placeholder = field.placeholder ? tr(field.placeholder) : undefined;
        const describedBy =
          [
            helpText ? `${inputId}-help` : '',
            error ? `${inputId}-error` : '',
          ]
            .filter(Boolean)
            .join(' ') || undefined;

        if (field.type === 'boolean') {
          const current = values[field.id];
          return (
            <fieldset key={field.id} className="min-w-0">
              <legend className="mb-1.5 text-sm font-bold">{label}</legend>
              <div className="grid grid-cols-2 overflow-hidden rounded-xl border bg-white">
                <label className={`flex min-h-11 cursor-pointer items-center justify-center gap-2 px-3 text-sm font-semibold ${current === true ? 'bg-brand-50 text-brand-800' : 'text-slate-600 hover:bg-slate-50'}`}>
                  <input
                    type="radio"
                    name={inputId}
                    checked={current === true}
                    onChange={() => change(field, true)}
                    className="accent-brand-600"
                  />
                  {t('common.yes')}
                </label>
                <label className={`flex min-h-11 cursor-pointer items-center justify-center gap-2 border-l px-3 text-sm font-semibold ${current === false ? 'bg-brand-50 text-brand-800' : 'text-slate-600 hover:bg-slate-50'}`}>
                  <input
                    type="radio"
                    name={inputId}
                    checked={current === false}
                    onChange={() => change(field, false)}
                    className="accent-brand-600"
                  />
                  {t('common.no')}
                </label>
              </div>
              {helpText && (
                <span id={`${inputId}-help`} className="mt-1 block text-xs text-slate-500">
                  {helpText}
                </span>
              )}
              {error && (
                <span id={`${inputId}-error`} className="mt-1 block text-sm font-medium text-red-600">
                  {error}
                </span>
              )}
            </fieldset>
          );
        }

        return (
          <label
            key={field.id}
            htmlFor={inputId}
            className={field.type === 'textarea' ? 'sm:col-span-2' : ''}
          >
            <span className="mb-1.5 block text-sm font-bold">
              {label}
              {field.required && (
                <span className="ml-1 text-red-600" aria-hidden="true">*</span>
              )}
            </span>

            {field.type === 'select' ? (
              <SelectField
                key={`${field.id}:${
                  field.dependsOn
                    ? String(values[field.dependsOn] ?? '')
                    : '__marketlift_root__'
                }`}
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

            {helpText && (
              <span id={`${inputId}-help`} className="mt-1 block text-xs text-slate-500">
                {helpText}
              </span>
            )}
            {error && (
              <span id={`${inputId}-error`} className="mt-1 block text-sm font-medium text-red-600">
                {error}
              </span>
            )}
          </label>
        );
      })}
    </div>
  );
}
