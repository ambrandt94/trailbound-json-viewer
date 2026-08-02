import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import {
  BrowserFilters,
  CatalogManifest,
  DatasetDefinition,
  FieldStat,
  JsonObject,
  JsonRecord,
  JsonValue,
  LoadedDataset,
} from '../models/catalog.models';

@Injectable({ providedIn: 'root' })
export class CatalogService {
  private readonly http = inject(HttpClient);

  readonly catalog = signal<CatalogManifest | null>(null);
  readonly activeDatasetId = signal<string | null>(null);
  readonly loadedDatasets = signal<Record<string, LoadedDataset>>({});
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly selectedIds = signal<string[]>([]);
  readonly compareIds = signal<string[]>([]);
  readonly filters = signal<BrowserFilters>({
    search: '',
    tags: [],
    tagMode: 'any',
    kind: 'all',
    sortField: 'name',
    sortDirection: 'asc',
  });

  readonly activeDataset = computed(() => {
    const id = this.activeDatasetId();
    if (!id) return null;
    return this.loadedDatasets()[id] ?? null;
  });

  readonly filteredRecords = computed(() => {
    const dataset = this.activeDataset();
    if (!dataset) return [];
    return this.applyFilters(dataset, this.filters());
  });

  readonly selectedRecords = computed(() => {
    const dataset = this.activeDataset();
    if (!dataset) return [];
    const ids = new Set(this.selectedIds());
    const idField = dataset.definition.idField ?? 'id';
    return dataset.records.filter((r) => ids.has(String(r[idField] ?? '')));
  });

  readonly compareRecords = computed(() => {
    const dataset = this.activeDataset();
    if (!dataset) return [];
    const ids = new Set(this.compareIds());
    const idField = dataset.definition.idField ?? 'id';
    return dataset.records.filter((r) => ids.has(String(r[idField] ?? '')));
  });

  readonly kindOptions = computed(() => {
    const dataset = this.activeDataset();
    if (!dataset) return [];
    const field = dataset.definition.recordKindField ?? 'kind';
    const kinds = new Set<string>();
    for (const record of dataset.records) {
      const value = record[field];
      if (typeof value === 'string' && value) kinds.add(value);
    }
    return [...kinds].sort();
  });

  async init(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const catalog = await firstValueFrom(
        this.http.get<CatalogManifest>('data/catalog.json'),
      );
      this.catalog.set(catalog);
      const first = catalog.datasets[0];
      if (first) {
        await this.selectDataset(first.id);
      }
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'Failed to load catalog');
    } finally {
      this.loading.set(false);
    }
  }

  async selectDataset(datasetId: string): Promise<void> {
    const catalog = this.catalog();
    const definition = catalog?.datasets.find((d) => d.id === datasetId);
    if (!definition) {
      this.error.set(`Unknown dataset: ${datasetId}`);
      return;
    }

    this.activeDatasetId.set(datasetId);
    this.selectedIds.set([]);
    this.compareIds.set([]);
    this.filters.set({
      search: '',
      tags: [],
      tagMode: 'any',
      kind: 'all',
      sortField: definition.defaultSort ?? definition.titleField ?? 'name',
      sortDirection: 'asc',
    });

    if (this.loadedDatasets()[datasetId]) return;

    this.loading.set(true);
    this.error.set(null);
    try {
      const raw = await firstValueFrom(this.http.get<unknown>(definition.path));
      const loaded = this.normalizeDataset(definition, raw);
      this.loadedDatasets.update((map) => ({ ...map, [datasetId]: loaded }));
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : `Failed to load ${datasetId}`);
    } finally {
      this.loading.set(false);
    }
  }

  patchFilters(partial: Partial<BrowserFilters>): void {
    this.filters.update((current) => ({ ...current, ...partial }));
  }

  toggleTagFilter(tag: string): void {
    this.filters.update((current) => {
      const tags = current.tags.includes(tag)
        ? current.tags.filter((t) => t !== tag)
        : [...current.tags, tag];
      return { ...current, tags };
    });
  }

  clearFilters(): void {
    const dataset = this.activeDataset();
    this.filters.set({
      search: '',
      tags: [],
      tagMode: 'any',
      kind: 'all',
      sortField: dataset?.definition.defaultSort ?? dataset?.definition.titleField ?? 'name',
      sortDirection: 'asc',
    });
  }

  selectRecord(id: string): void {
    this.selectedIds.set([id]);
  }

  toggleCompare(id: string): void {
    this.compareIds.update((ids) =>
      ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id].slice(0, 4),
    );
  }

  clearCompare(): void {
    this.compareIds.set([]);
  }

  getRecordTitle(record: JsonRecord, definition?: DatasetDefinition): string {
    const field = definition?.titleField ?? this.activeDataset()?.definition.titleField ?? 'name';
    const value = record[field] ?? record['id'] ?? 'Untitled';
    return String(value);
  }

  getRecordId(record: JsonRecord, definition?: DatasetDefinition): string {
    const field = definition?.idField ?? this.activeDataset()?.definition.idField ?? 'id';
    return String(record[field] ?? '');
  }

  getRecordTags(record: JsonRecord, definition?: DatasetDefinition): string[] {
    const field = definition?.tagField ?? this.activeDataset()?.definition.tagField ?? 'tags';
    const value = record[field];
    if (!Array.isArray(value)) return [];
    return value.filter((t): t is string => typeof t === 'string');
  }

  getRecordDescription(record: JsonRecord, definition?: DatasetDefinition): string {
    const field =
      definition?.descriptionField ??
      this.activeDataset()?.definition.descriptionField ??
      'description';
    const value = record[field];
    return typeof value === 'string' ? value : '';
  }

  private normalizeDataset(definition: DatasetDefinition, raw: unknown): LoadedDataset {
    let meta: JsonObject | null = null;
    let records: JsonRecord[] = [];
    const extras: JsonObject = {};

    if (Array.isArray(raw)) {
      records = raw.filter(isObject);
    } else if (isObject(raw)) {
      meta = isObject(raw['meta']) ? (raw['meta'] as JsonObject) : null;
      if (Array.isArray(raw['records'])) {
        records = raw['records'].filter(isObject);
      } else if (Array.isArray(raw['items'])) {
        records = raw['items'].filter(isObject);
      } else if (Array.isArray(raw['data'])) {
        records = raw['data'].filter(isObject);
      } else {
        // Treat object values as records when they look like entities.
        const candidates = Object.values(raw).filter(isObject);
        if (candidates.length && candidates.every((c) => 'id' in c || 'name' in c)) {
          records = candidates;
        }
      }

      for (const [key, value] of Object.entries(raw)) {
        if (['meta', 'records', 'items', 'data'].includes(key)) continue;
        extras[key] = value as JsonValue;
      }
    }

    const tagField = definition.tagField ?? 'tags';
    const allTags = new Set<string>();
    for (const record of records) {
      for (const tag of this.getRecordTags(record, definition)) {
        allTags.add(tag);
      }
      // Also discover tags if field differs but tags exists.
      if (tagField !== 'tags') {
        const fallback = record['tags'];
        if (Array.isArray(fallback)) {
          for (const tag of fallback) {
            if (typeof tag === 'string') allTags.add(tag);
          }
        }
      }
    }

    return {
      definition,
      meta,
      records,
      allTags: [...allTags].sort((a, b) => a.localeCompare(b)),
      fieldStats: this.computeFieldStats(records),
      extras,
    };
  }

  private computeFieldStats(records: JsonRecord[]): FieldStat[] {
    const stats = new Map<string, { types: Set<string>; presentIn: number; sample?: string }>();

    const visit = (value: JsonValue, path: string, recordIndex: number, seen: Set<string>) => {
      const type = valueType(value);
      if (!stats.has(path)) {
        stats.set(path, { types: new Set(), presentIn: 0 });
      }
      const entry = stats.get(path)!;
      entry.types.add(type);
      if (!seen.has(path)) {
        entry.presentIn += 1;
        seen.add(path);
      }
      if (!entry.sample) {
        entry.sample = summarize(value);
      }

      if (isObject(value)) {
        for (const [key, child] of Object.entries(value)) {
          visit(child, path ? `${path}.${key}` : key, recordIndex, seen);
        }
      } else if (Array.isArray(value) && value.length && isObject(value[0])) {
        visit(value[0], `${path}[]`, recordIndex, seen);
      }
    };

    records.forEach((record, index) => {
      const seen = new Set<string>();
      for (const [key, value] of Object.entries(record)) {
        visit(value, key, index, seen);
      }
    });

    const total = Math.max(records.length, 1);
    return [...stats.entries()]
      .map(([path, entry]) => ({
        path,
        type: [...entry.types].join(' | '),
        presentIn: entry.presentIn,
        coverage: entry.presentIn / total,
        sample: entry.sample,
      }))
      .sort((a, b) => a.path.localeCompare(b.path));
  }

  private applyFilters(dataset: LoadedDataset, filters: BrowserFilters): JsonRecord[] {
    const titleField = dataset.definition.titleField ?? 'name';
    const descField = dataset.definition.descriptionField ?? 'description';
    const kindField = dataset.definition.recordKindField ?? 'kind';
    const search = filters.search.trim().toLowerCase();

    let results = dataset.records.filter((record) => {
      if (filters.kind !== 'all') {
        if (String(record[kindField] ?? '') !== filters.kind) return false;
      }

      const tags = this.getRecordTags(record, dataset.definition);
      if (filters.tags.length) {
        if (filters.tagMode === 'all') {
          if (!filters.tags.every((t) => tags.includes(t))) return false;
        } else if (!filters.tags.some((t) => tags.includes(t))) {
          return false;
        }
      }

      if (search) {
        const haystack = [
          this.getRecordTitle(record, dataset.definition),
          this.getRecordId(record, dataset.definition),
          this.getRecordDescription(record, dataset.definition),
          tags.join(' '),
          JSON.stringify(record),
        ]
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(search)) return false;
      }

      return true;
    });

    const sortField = filters.sortField || titleField;
    const direction = filters.sortDirection === 'desc' ? -1 : 1;
    results = [...results].sort((a, b) => {
      const av = normalizeSortValue(a[sortField] ?? a[titleField] ?? a[descField]);
      const bv = normalizeSortValue(b[sortField] ?? b[titleField] ?? b[descField]);
      if (av < bv) return -1 * direction;
      if (av > bv) return 1 * direction;
      return 0;
    });

    return results;
  }
}

function isObject(value: unknown): value is JsonRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function valueType(value: JsonValue): string {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  return typeof value;
}

function summarize(value: JsonValue): string {
  if (value === null) return 'null';
  if (typeof value === 'string') return value.slice(0, 80);
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (Array.isArray(value)) return `array(${value.length})`;
  return `object(${Object.keys(value).length})`;
}

function normalizeSortValue(value: JsonValue | undefined): string | number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') return value.toLowerCase();
  if (typeof value === 'boolean') return value ? 1 : 0;
  if (Array.isArray(value)) return String(value.length);
  if (value && typeof value === 'object') return Object.keys(value).length;
  return '';
}
