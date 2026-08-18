# Marketlift Category Configuration Contract

The marketplace frontend now treats category-specific listing fields as API configuration, not hardcoded form branches.

## 1. Category summary

Suggested endpoint:

`GET /api/v1/categories`

Response item:

```json
{
  "id": "phones",
  "name": "Mobile Phones",
  "icon": "Smartphone"
}
```

Use stable machine IDs. Labels can later be localized without changing stored listing data.

## 2. Category configuration

Suggested endpoint:

`GET /api/v1/categories/{category_id}/configuration`

Shape mirrors `CategoryConfiguration` in `src/types/index.ts`:

```json
{
  "id": "phones",
  "name": "Mobile Phones",
  "icon": "Smartphone",
  "schemaVersion": 1,
  "description": "Tell buyers the key device details so they can compare phones quickly.",
  "pricing": {
    "mode": "required",
    "label": "Price (R$)",
    "placeholder": "e.g. 3500"
  },
  "condition": {
    "enabled": true,
    "required": true
  },
  "fields": [
    {
      "id": "brand",
      "label": "Brand",
      "type": "select",
      "required": true,
      "filterable": true,
      "options": [
        { "value": "apple", "label": "Apple" },
        { "value": "samsung", "label": "Samsung" }
      ]
    },
    {
      "id": "storage_gb",
      "label": "Storage",
      "type": "select",
      "required": true,
      "filterable": true,
      "unit": "GB",
      "options": [
        { "value": "128", "label": "128 GB" },
        { "value": "256", "label": "256 GB" }
      ]
    }
  ]
}
```

Supported frontend field types currently are:

- `text`
- `textarea`
- `number`
- `select`
- `boolean`

A field may also define `placeholder`, `helpText`, `unit`, `min`, `max`, `step`, and `options`.

`filterable: true` means the field is suitable for future category-specific search filters. The backend should index these values appropriately rather than trying to infer filterability from labels.

## 3. Listing create/update payload

Suggested create endpoint:

`POST /api/v1/listings`

The important category-specific portion should look like:

```json
{
  "category": "phones",
  "categorySchemaVersion": 1,
  "title": "iPhone 15 Pro 256GB",
  "description": "...",
  "price": 6200,
  "condition": "Like new",
  "negotiable": true,
  "location": {
    "stateCode": "SP",
    "city": "São Paulo",
    "district": "Vila Mariana"
  },
  "attributes": {
    "brand": "apple",
    "model": "iPhone 15 Pro",
    "storage_gb": "256",
    "color": "Natural Titanium",
    "battery_health": 94,
    "network": "5g"
  }
}
```

Do not create database columns such as `phone_storage`, `vehicle_mileage`, `property_bedrooms` directly on the common listing table simply because the frontend has those fields. The API contract intentionally sends category values in `attributes`.

A practical Django model can keep the common listing columns relational and category-specific values in validated JSON/JSONB or a normalized attribute model, depending on filtering/indexing requirements.

## 4. Backend validation is authoritative

Frontend validation is for UX only. Django must validate every submitted attribute against the active category schema:

- reject unknown attribute keys;
- reject missing required fields;
- validate types;
- validate allowed select values;
- enforce numeric min/max;
- enforce category pricing/condition rules;
- record or validate the schema version used by the listing.

If the schema changes, existing listings should remain readable. Do not reinterpret old data silently using a newer incompatible schema.

## 5. Stable values vs display labels

Store:

```json
{ "transmission": "automatic" }
```

Display:

`Automatic`

This lets Portuguese labels later become `Automático` without migrating listing data.

## 6. Current top-level categories covered

The mock configuration now defines fields for:

- Mobile Phones
- Electronics
- Computers
- Vehicles
- Properties
- Land
- Home & Garden
- Fashion
- Services
- Jobs
- Agriculture
- Business
- Other

No category currently falls through to a developer-facing “no extra fields configured” message.

## 7. Future admin frontend

The separate admin application can eventually edit these configurations. Recommended backend rules:

- category schema changes are versioned;
- field IDs cannot be casually renamed after listings use them;
- options use stable values and editable/localizable labels;
- disabling a field should not destroy historical listing values;
- dangerous schema changes require explicit migration/versioning;
- high-risk category publication/verification policies should be separate from ordinary form field configuration.
