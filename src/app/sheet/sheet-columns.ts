import { DatasetDefinition, JsonRecord, JsonValue } from '../models/catalog.models';

export interface SheetColumnDef {
  /** Stable key used for collapse persistence. */
  key: string;
  /** Header label. */
  label: string;
  /** Top-level field path on the record. */
  field: string;
  /** Soft max characters for cell text; 0 = no truncate. */
  maxLength?: number;
}

const SHARED_COLUMNS: SheetColumnDef[] = [
  { key: 'id', label: 'Id', field: 'id' },
  { key: 'name', label: 'Name', field: 'name' },
  { key: 'kind', label: 'Kind', field: '__kind__' },
  { key: 'tags', label: 'Tags', field: 'tags', maxLength: 80 },
  { key: 'description', label: 'Description', field: 'description', maxLength: 120 },
];

/** Two example type-specific columns per dataset (top-level only). */
const DATASET_EXTRA_COLUMNS: Record<string, SheetColumnDef[]> = {
  skills: [
    { key: 'role', label: 'Role', field: 'role' },
    { key: 'skillTypes', label: 'Skill types', field: 'skillTypes', maxLength: 100 },
  ],
  materials: [
    { key: 'tier', label: 'Tier', field: 'tier' },
    { key: 'irlInspo', label: 'IRL inspo', field: 'irlInspo' },
  ],
  'item-properties': [
    { key: 'valueType', label: 'Value type', field: 'valueType' },
    { key: 'usedByMaterialCount', label: 'Used by materials', field: 'usedByMaterialCount' },
  ],
  bestiary: [
    { key: 'temperament', label: 'Temperament', field: 'temperament' },
    { key: 'size', label: 'Size', field: 'size' },
  ],
  'resource-glossary': [
    { key: 'interaction', label: 'Interaction', field: 'interaction' },
    { key: 'rarity', label: 'Rarity', field: 'rarity' },
  ],
  items: [
    { key: 'category', label: 'Category', field: 'category' },
    { key: 'addressableAsset', label: 'Addressable asset', field: 'addressableAsset' },
  ],
  music: [
    { key: 'mood', label: 'Mood', field: 'mood' },
    { key: 'durationHint', label: 'Duration hint', field: 'durationHint' },
  ],
};

export function sheetColumnsFor(definition: DatasetDefinition): SheetColumnDef[] {
  const kindField = definition.recordKindField ?? 'kind';
  const shared = SHARED_COLUMNS.map((col) => {
    if (col.key !== 'kind') return col;
    return {
      ...col,
      field: kindField,
      label: kindField === 'kind' ? 'Kind' : titleCase(kindField),
    };
  });

  const extras = DATASET_EXTRA_COLUMNS[definition.id] ?? [];
  return [...shared, ...extras];
}

export function formatSheetCell(
  record: JsonRecord,
  column: SheetColumnDef,
  definition?: DatasetDefinition,
): string {
  const field =
    column.key === 'kind' ? (definition?.recordKindField ?? column.field) : column.field;
  const raw = record[field];
  const text = formatJsonValue(raw);
  const max = column.maxLength ?? 0;
  if (max > 0 && text.length > max) {
    return `${text.slice(0, max - 1)}…`;
  }
  return text;
}

function formatJsonValue(value: JsonValue | undefined): string {
  if (value === undefined || value === null) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (item === null || typeof item !== 'object') return String(item);
        return compactObject(item as Record<string, JsonValue>);
      })
      .join(', ');
  }
  return compactObject(value as Record<string, JsonValue>);
}

function compactObject(obj: Record<string, JsonValue>): string {
  try {
    const json = JSON.stringify(obj);
    return json.length > 80 ? `${json.slice(0, 79)}…` : json;
  } catch {
    return '…';
  }
}

function titleCase(value: string): string {
  return value
    .replace(/([A-Z])/g, ' $1')
    .replace(/[-_]/g, ' ')
    .replace(/^\w/, (c) => c.toUpperCase())
    .trim();
}
