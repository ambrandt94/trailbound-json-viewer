import { DecimalPipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { CatalogService } from '../../services/catalog.service';
import { PreferencesService } from '../../services/preferences.service';
import { RecordDetailComponent } from '../record-detail/record-detail.component';
import { ComparePanelComponent } from '../compare-panel/compare-panel.component';
import { SheetViewComponent } from '../sheet-view/sheet-view.component';
import { MusicMiniPlayerComponent } from '../music-mini-player/music-mini-player.component';
import { JsonRecord, BrowseViewMode } from '../../models/catalog.models';

@Component({
  selector: 'app-dataset-browser',
  standalone: true,
  imports: [
    DecimalPipe,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    MatIconModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatTooltipModule,
    MatProgressBarModule,
    RecordDetailComponent,
    ComparePanelComponent,
    SheetViewComponent,
    MusicMiniPlayerComponent,
  ],
  template: `
    @if (catalog.loading()) {
      <mat-progress-bar mode="indeterminate"></mat-progress-bar>
    }

    @if (catalog.error(); as error) {
      <div class="error">
        <mat-icon>error</mat-icon>
        <span>{{ error }}</span>
      </div>
    }

    @if (dataset(); as ds) {
      <div class="browser" [class.sheet-mode]="prefs.browseView() === 'sheet'">
        <aside class="filters">
          <div class="filters-scroll">
            <div class="dataset-meta">
              <h2>{{ ds.definition.label }}</h2>
              <p>{{ ds.definition.description || ds.meta?.['description'] || 'JSON dataset' }}</p>
              <div class="stats">
                <span
                  ><mat-icon>inventory_2</mat-icon> {{ filtered().length }} /
                  {{ ds.records.length }}</span
                >
                <span><mat-icon>sell</mat-icon> {{ ds.allTags.length }} tags</span>
                <span><mat-icon>schema</mat-icon> {{ ds.fieldStats.length }} fields</span>
              </div>
            </div>

            <mat-button-toggle-group
              class="browse-toggle"
              [value]="prefs.browseView()"
              (change)="onBrowseViewChange($event.value)"
            >
              <mat-button-toggle value="list">
                <mat-icon>view_agenda</mat-icon>
                List
              </mat-button-toggle>
              <mat-button-toggle value="sheet">
                <mat-icon>table_chart</mat-icon>
                Sheet
              </mat-button-toggle>
            </mat-button-toggle-group>

            <mat-form-field appearance="outline" class="full">
              <mat-label>Search</mat-label>
              <mat-icon matPrefix>search</mat-icon>
              <input
                matInput
                [ngModel]="filters().search"
                (ngModelChange)="catalog.patchFilters({ search: $event })"
                placeholder="Name, tag, id, or any field…"
              />
            </mat-form-field>

            <div class="row">
              <mat-form-field appearance="outline">
                <mat-label>Kind</mat-label>
                <mat-select
                  [ngModel]="filters().kind"
                  (ngModelChange)="catalog.patchFilters({ kind: $event })"
                >
                  <mat-option value="all">All</mat-option>
                  @for (kind of catalog.kindOptions(); track kind) {
                    <mat-option [value]="kind">{{ kind }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Sort</mat-label>
                <mat-select
                  [ngModel]="filters().sortField"
                  (ngModelChange)="catalog.patchFilters({ sortField: $event })"
                >
                  @for (field of sortableFields(); track field) {
                    <mat-option [value]="field">{{ field }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>
            </div>

            <div class="sort-dir">
              <mat-button-toggle-group
                [value]="filters().sortDirection"
                (change)="catalog.patchFilters({ sortDirection: $event.value })"
              >
                <mat-button-toggle value="asc">
                  <mat-icon>arrow_upward</mat-icon> Asc
                </mat-button-toggle>
                <mat-button-toggle value="desc">
                  <mat-icon>arrow_downward</mat-icon> Desc
                </mat-button-toggle>
              </mat-button-toggle-group>

              <mat-button-toggle-group
                [value]="filters().tagMode"
                (change)="catalog.patchFilters({ tagMode: $event.value })"
              >
                <mat-button-toggle value="any" matTooltip="Match any selected tag">Any</mat-button-toggle>
                <mat-button-toggle value="all" matTooltip="Match all selected tags">All</mat-button-toggle>
              </mat-button-toggle-group>
            </div>

            <div class="tag-block">
              <div class="tag-header">
                <h3>Tags</h3>
                <button mat-button type="button" (click)="catalog.clearFilters()">
                  <mat-icon>filter_alt_off</mat-icon>
                  Reset
                </button>
              </div>
              <mat-chip-set>
                @for (tag of ds.allTags; track tag) {
                  <mat-chip
                    [highlighted]="filters().tags.includes(tag)"
                    (click)="catalog.toggleTagFilter(tag)"
                  >
                    {{ tag }}
                  </mat-chip>
                }
              </mat-chip-set>
            </div>

            <details class="schema">
              <summary>
                <mat-icon>insights</mat-icon>
                Schema coverage
              </summary>
              <div class="schema-list">
                @for (field of ds.fieldStats; track field.path) {
                  <div class="schema-row">
                    <span class="path">{{ field.path }}</span>
                    <span class="type">{{ field.type }}</span>
                    <span class="coverage">{{ (field.coverage * 100) | number: '1.0-0' }}%</span>
                  </div>
                }
              </div>
            </details>
          </div>

          <app-music-mini-player class="sidebar-player" />
        </aside>

        @if (prefs.browseView() === 'sheet') {
          <section class="sheet-pane">
            <app-sheet-view
              [records]="filtered()"
              [definition]="ds.definition"
              [selectedIds]="catalog.selectedIds()"
              [compareIds]="catalog.compareIds()"
              (select)="catalog.selectRecord($event)"
              (openDetail)="openRecordDetail($event)"
              (toggleCompare)="catalog.toggleCompare($event)"
            />
          </section>
        } @else {
          <section class="list-pane">
            <div class="list">
              @for (record of filtered(); track catalog.getRecordId(record)) {
                <button
                  type="button"
                  class="record-card"
                  [class.active]="isSelected(record)"
                  [class.comparing]="isComparing(record)"
                  (click)="catalog.selectRecord(catalog.getRecordId(record))"
                >
                  <div class="card-top">
                    <div>
                      <strong>{{ catalog.getRecordTitle(record) }}</strong>
                      <span class="kind">{{ recordKind(record) }}</span>
                    </div>
                    <button
                      mat-icon-button
                      type="button"
                      matTooltip="Toggle compare"
                      (click)="$event.stopPropagation(); catalog.toggleCompare(catalog.getRecordId(record))"
                    >
                      <mat-icon>{{ isComparing(record) ? 'check_box' : 'check_box_outline_blank' }}</mat-icon>
                    </button>
                  </div>
                  <p>{{ catalog.getRecordDescription(record) }}</p>
                  <div class="card-tags">
                    @for (tag of catalog.getRecordTags(record).slice(0, 5); track tag) {
                      <span>{{ tag }}</span>
                    }
                  </div>
                </button>
              } @empty {
                <div class="empty-list">
                  <mat-icon>search_off</mat-icon>
                  <p>No records match the current filters.</p>
                </div>
              }
            </div>
          </section>

          <section class="detail-pane">
            <app-record-detail [record]="selectedRecord()" />
            <div class="compare-wrap">
              <app-compare-panel />
            </div>
          </section>
        }
      </div>
    }
  `,
  styles: `
    :host {
      display: block;
      height: 100%;
    }

    .error {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin: 1rem;
      padding: 0.75rem 1rem;
      border-radius: 8px;
      background: var(--tb-error-bg);
      color: var(--tb-error-ink);
    }

    .browser {
      display: grid;
      grid-template-columns: minmax(16rem, 22rem) minmax(18rem, 24rem) minmax(22rem, 1fr);
      gap: 1rem;
      height: calc(100vh - 4.25rem);
      padding: 1rem;
      box-sizing: border-box;
    }

    .browser.sheet-mode {
      grid-template-columns: minmax(16rem, 22rem) minmax(0, 1fr);
    }

    .filters,
    .list-pane,
    .detail-pane,
    .sheet-pane {
      background: var(--tb-panel);
      border: 1px solid color-mix(in srgb, var(--tb-ink) 10%, transparent);
      border-radius: 14px;
      overflow: auto;
      min-height: 0;
    }

    .sheet-pane {
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    .filters {
      padding: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      overflow: hidden;
    }

    .filters-scroll {
      flex: 1;
      min-height: 0;
      overflow: auto;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .sidebar-player {
      flex-shrink: 0;
      margin-top: auto;
    }

    .dataset-meta,
    .browse-toggle,
    .full,
    .row,
    .sort-dir,
    .schema {
      flex-shrink: 0;
    }

    .browse-toggle {
      width: 100%;
      min-height: 2.5rem;
    }

    .browse-toggle mat-button-toggle {
      flex: 1;
    }

    .tag-block {
      flex: 1 1 auto;
      min-height: 6rem;
      overflow: auto;
    }

    .dataset-meta h2 {
      margin: 0;
      font-size: 1.35rem;
    }

    .dataset-meta p {
      margin: 0.35rem 0 0.75rem;
      color: var(--tb-muted);
      font-size: 0.9rem;
      line-height: 1.4;
    }

    .stats {
      display: flex;
      flex-wrap: wrap;
      gap: 0.65rem;
      margin-bottom: 0.35rem;
      font-size: 0.82rem;
      color: var(--tb-muted);
    }

    .stats span {
      display: inline-flex;
      align-items: center;
      gap: 0.2rem;
    }

    .stats mat-icon {
      font-size: 1rem;
      width: 1rem;
      height: 1rem;
    }

    .full {
      width: 100%;
    }

    .row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.5rem;
    }

    .sort-dir {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .tag-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .tag-header h3 {
      margin: 0;
      font-size: 0.95rem;
    }

    mat-chip {
      cursor: pointer;
    }

    .schema {
      margin-top: auto;
      border-top: 1px solid color-mix(in srgb, var(--tb-ink) 10%, transparent);
      padding-top: 0.75rem;
    }

    .schema summary {
      display: flex;
      align-items: center;
      gap: 0.35rem;
      cursor: pointer;
      font-weight: 600;
      list-style: none;
    }

    .schema summary::-webkit-details-marker {
      display: none;
    }

    .schema-list {
      margin-top: 0.5rem;
      max-height: 12rem;
      overflow: auto;
      font-size: 0.78rem;
    }

    .schema-row {
      display: grid;
      grid-template-columns: 1.4fr 1fr auto;
      gap: 0.35rem;
      padding: 0.25rem 0;
      border-bottom: 1px solid color-mix(in srgb, var(--tb-ink) 6%, transparent);
    }

    .schema-row .path {
      font-weight: 600;
      word-break: break-word;
    }

    .schema-row .type,
    .schema-row .coverage {
      color: var(--tb-muted);
    }

    .list {
      display: flex;
      flex-direction: column;
      gap: 0.55rem;
      padding: 0.75rem;
    }

    .record-card {
      text-align: left;
      border: 1px solid color-mix(in srgb, var(--tb-ink) 10%, transparent);
      background: var(--tb-card);
      border-radius: 12px;
      padding: 0.75rem;
      cursor: pointer;
      font: inherit;
      color: inherit;
      transition: border-color 120ms ease, transform 120ms ease, box-shadow 120ms ease;
    }

    .record-card:hover {
      border-color: color-mix(in srgb, var(--tb-accent) 55%, transparent);
      transform: translateY(-1px);
    }

    .record-card.active {
      border-color: var(--tb-accent-strong);
      box-shadow: 0 0 0 1px color-mix(in srgb, var(--tb-accent) 35%, transparent);
    }

    .record-card.comparing {
      background: var(--tb-card-compare);
    }

    .card-top {
      display: flex;
      justify-content: space-between;
      gap: 0.35rem;
      align-items: start;
    }

    .card-top strong {
      display: block;
      font-size: 1rem;
    }

    .kind {
      display: inline-block;
      margin-top: 0.15rem;
      font-size: 0.72rem;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--tb-accent-strong);
      font-weight: 700;
    }

    .record-card p {
      margin: 0.45rem 0;
      color: var(--tb-muted);
      font-size: 0.84rem;
      line-height: 1.4;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .card-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 0.3rem;
    }

    .card-tags span {
      font-size: 0.72rem;
      padding: 0.15rem 0.45rem;
      border-radius: 999px;
      background: color-mix(in srgb, var(--tb-ink) 8%, transparent);
    }

    .empty-list {
      text-align: center;
      color: var(--tb-muted);
      padding: 2rem 1rem;
    }

    .detail-pane {
      padding: 1rem;
      display: grid;
      grid-template-rows: 1fr auto;
      gap: 1rem;
    }

    .compare-wrap {
      border-top: 1px solid color-mix(in srgb, var(--tb-ink) 10%, transparent);
      padding-top: 1rem;
    }

    @media (max-width: 1100px) {
      .browser,
      .browser.sheet-mode {
        grid-template-columns: 1fr;
        height: auto;
      }

      .list-pane,
      .sheet-pane {
        max-height: 28rem;
      }
    }
  `,
})
export class DatasetBrowserComponent {
  readonly catalog = inject(CatalogService);
  readonly prefs = inject(PreferencesService);
  readonly dataset = this.catalog.activeDataset;
  readonly filtered = this.catalog.filteredRecords;
  readonly filters = this.catalog.filters;

  readonly selectedRecord = computed(() => this.catalog.selectedRecords()[0] ?? null);

  readonly sortableFields = computed(() => {
    const ds = this.dataset();
    if (!ds) return ['name', 'id'];
    const top = ds.fieldStats
      .filter((f) => !f.path.includes('.') && !f.path.includes('['))
      .map((f) => f.path);
    const preferred = [
      ds.definition.titleField ?? 'name',
      ds.definition.idField ?? 'id',
      ds.definition.recordKindField ?? 'kind',
      'source',
      'role',
    ];
    return [...new Set([...preferred, ...top])];
  });

  isSelected(record: JsonRecord): boolean {
    return this.catalog.selectedIds().includes(this.catalog.getRecordId(record));
  }

  isComparing(record: JsonRecord): boolean {
    return this.catalog.compareIds().includes(this.catalog.getRecordId(record));
  }

  recordKind(record: JsonRecord): string {
    const field = this.dataset()?.definition.recordKindField ?? 'kind';
    const value = record[field];
    return typeof value === 'string' ? value : 'record';
  }

  openRecordDetail(id: string): void {
    this.catalog.selectRecord(id);
    this.prefs.setBrowseView('list');
  }

  onBrowseViewChange(value: string | undefined | null): void {
    if (value === 'list' || value === 'sheet') {
      this.prefs.setBrowseView(value as BrowseViewMode);
    }
  }
}
