export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonObject | JsonValue[];
export type JsonObject = { [key: string]: JsonValue };
export type JsonRecord = JsonObject;

export type FontChoice = 'capriola' | 'poppins' | 'sen' | 'ubuntu';
export type ThemeMode = 'light' | 'dark';
export type DetailViewMode = 'presentation' | 'json';
export type BrowseViewMode = 'list' | 'sheet';

export interface DatasetDefinition {
  id: string;
  label: string;
  path: string;
  icon?: string;
  description?: string;
  idField?: string;
  titleField?: string;
  tagField?: string;
  descriptionField?: string;
  recordKindField?: string;
  defaultSort?: string;
}

export interface CatalogManifest {
  version: number;
  appName: string;
  datasets: DatasetDefinition[];
}

export interface LoadedDataset {
  definition: DatasetDefinition;
  meta: JsonObject | null;
  records: JsonRecord[];
  allTags: string[];
  fieldStats: FieldStat[];
  /** Optional root-level schema bags (e.g. materials.propertyDefinitions). */
  extras: JsonObject;
}

export interface FieldStat {
  path: string;
  type: string;
  presentIn: number;
  coverage: number;
  sample?: string;
}

export type SortDirection = 'asc' | 'desc';

export interface BrowserFilters {
  search: string;
  tags: string[];
  tagMode: 'any' | 'all';
  kind: string | 'all';
  sortField: string;
  sortDirection: SortDirection;
}

export const FONT_OPTIONS: { id: FontChoice; label: string; stack: string }[] = [
  { id: 'capriola', label: 'Capriola', stack: "'Capriola', sans-serif" },
  { id: 'poppins', label: 'Poppins', stack: "'Poppins', sans-serif" },
  { id: 'sen', label: 'Sen', stack: "'Sen', sans-serif" },
  { id: 'ubuntu', label: 'Ubuntu', stack: "'Ubuntu', sans-serif" },
];
