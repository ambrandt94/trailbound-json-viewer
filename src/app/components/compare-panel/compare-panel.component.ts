import { Component, computed, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { CatalogService } from '../../services/catalog.service';
import { JsonRecord, JsonValue } from '../../models/catalog.models';

interface CompareRow {
  path: string;
  values: string[];
  differs: boolean;
}

@Component({
  selector: 'app-compare-panel',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatChipsModule],
  template: `
    <section class="compare">
      <header>
        <div>
          <h3>
            <mat-icon>compare_arrows</mat-icon>
            Compare
          </h3>
          <p>Select up to 4 records from the list to compare field shapes side by side.</p>
        </div>
        @if (records().length) {
          <button mat-button type="button" (click)="catalog.clearCompare()">
            <mat-icon>close</mat-icon>
            Clear
          </button>
        }
      </header>

      @if (!records().length) {
        <div class="empty">No records queued for comparison.</div>
      } @else {
        <div class="chips">
          @for (record of records(); track catalog.getRecordId(record)) {
            <mat-chip (removed)="catalog.toggleCompare(catalog.getRecordId(record))">
              {{ catalog.getRecordTitle(record) }}
              <button matChipRemove type="button">
                <mat-icon>cancel</mat-icon>
              </button>
            </mat-chip>
          }
        </div>

        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Field</th>
                @for (record of records(); track catalog.getRecordId(record)) {
                  <th>{{ catalog.getRecordTitle(record) }}</th>
                }
              </tr>
            </thead>
            <tbody>
              @for (row of rows(); track row.path) {
                <tr [class.differs]="row.differs">
                  <td class="path">{{ row.path }}</td>
                  @for (value of row.values; track $index) {
                    <td>{{ value }}</td>
                  }
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </section>
  `,
  styles: `
    .compare {
      display: grid;
      gap: 0.85rem;
    }

    header {
      display: flex;
      justify-content: space-between;
      gap: 1rem;
      align-items: start;
    }

    h3 {
      margin: 0;
      display: flex;
      align-items: center;
      gap: 0.35rem;
      font-size: 1.05rem;
    }

    header p {
      margin: 0.25rem 0 0;
      color: var(--tb-muted);
      font-size: 0.88rem;
    }

    .empty {
      color: var(--tb-muted);
      font-size: 0.9rem;
      padding: 0.75rem 0;
    }

    .chips {
      display: flex;
      flex-wrap: wrap;
      gap: 0.35rem;
    }

    .table-wrap {
      overflow: auto;
      border: 1px solid color-mix(in srgb, var(--tb-ink) 12%, transparent);
      border-radius: 10px;
      max-height: 22rem;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.85rem;
    }

    th,
    td {
      padding: 0.55rem 0.7rem;
      border-bottom: 1px solid color-mix(in srgb, var(--tb-ink) 8%, transparent);
      text-align: left;
      vertical-align: top;
      min-width: 9rem;
    }

    th {
      position: sticky;
      top: 0;
      background: var(--tb-panel);
      z-index: 1;
      font-weight: 700;
    }

    .path {
      font-weight: 600;
      position: sticky;
      left: 0;
      background: var(--tb-panel);
      min-width: 10rem;
    }

    tr.differs td {
      background: color-mix(in srgb, var(--tb-accent) 12%, transparent);
    }
  `,
})
export class ComparePanelComponent {
  readonly catalog = inject(CatalogService);
  readonly records = this.catalog.compareRecords;

  readonly rows = computed(() => {
    const records = this.records();
    if (!records.length) return [] as CompareRow[];

    const paths = new Set<string>();
    for (const record of records) {
      for (const path of collectPaths(record)) paths.add(path);
    }

    return [...paths].sort().map((path) => {
      const values = records.map((record) => formatValue(getPath(record, path)));
      const differs = values.some((v) => v !== values[0]);
      return { path, values, differs };
    });
  });
}

function collectPaths(value: JsonValue, prefix = ''): string[] {
  if (value === null || typeof value !== 'object') {
    return prefix ? [prefix] : [];
  }
  if (Array.isArray(value)) {
    if (!value.length) return prefix ? [prefix] : [];
    if (value.every((v) => typeof v !== 'object' || v === null)) {
      return prefix ? [prefix] : [];
    }
    const paths: string[] = [];
    value.forEach((item, index) => {
      paths.push(...collectPaths(item, `${prefix}[${index}]`));
    });
    return paths;
  }
  const paths: string[] = [];
  for (const [key, child] of Object.entries(value)) {
    const next = prefix ? `${prefix}.${key}` : key;
    if (child !== null && typeof child === 'object') {
      const nested = collectPaths(child, next);
      paths.push(...(nested.length ? nested : [next]));
    } else {
      paths.push(next);
    }
  }
  return paths;
}

function getPath(record: JsonRecord, path: string): JsonValue | undefined {
  const parts = path.replace(/\[(\d+)\]/g, '.$1').split('.').filter(Boolean);
  let current: JsonValue | undefined = record;
  for (const part of parts) {
    if (current === null || current === undefined) return undefined;
    if (Array.isArray(current)) {
      current = current[Number(part)] as JsonValue;
    } else if (typeof current === 'object') {
      current = current[part];
    } else {
      return undefined;
    }
  }
  return current;
}

function formatValue(value: JsonValue | undefined): string {
  if (value === undefined) return '—';
  if (value === null) return 'null';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return JSON.stringify(value);
}
