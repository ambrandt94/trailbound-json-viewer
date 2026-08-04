import { Component, computed, inject, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DatasetDefinition, JsonRecord } from '../../models/catalog.models';
import { CatalogService } from '../../services/catalog.service';
import { MusicPlayerService } from '../../services/music-player.service';
import { PreferencesService } from '../../services/preferences.service';
import { resolveMusicAudioUrl } from '../../utils/music-audio';
import { formatSheetCell, sheetColumnsFor, SheetColumnDef } from '../../sheet/sheet-columns';

@Component({
  selector: 'app-sheet-view',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatTooltipModule],
  template: `
    <div class="sheet">
      <header class="toolbar">
        <div class="toolbar-left">
          <h3>
            <mat-icon>table_chart</mat-icon>
            Sheet
          </h3>
          <span class="count">{{ records().length }} rows</span>
        </div>
        <div class="toolbar-actions">
          <button mat-button type="button" (click)="collapseAll()" matTooltip="Collapse all columns">
            <mat-icon>view_column</mat-icon>
            Collapse all
          </button>
          <button mat-button type="button" (click)="expandAll()" matTooltip="Expand all columns">
            <mat-icon>view_week</mat-icon>
            Expand all
          </button>
        </div>
      </header>

      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th class="actions-col sticky-col" [class.with-play]="isMusicSheet()" scope="col">
                <span class="sr-only">Actions</span>
              </th>
              @for (col of columns(); track col.key) {
                <th
                  scope="col"
                  [class.collapsed]="isCollapsed(col.key)"
                  [attr.title]="col.label"
                >
                  @if (isCollapsed(col.key)) {
                    <button
                      type="button"
                      class="collapsed-header"
                      (click)="expandColumn(col.key)"
                      [attr.aria-label]="'Expand column ' + col.label"
                    >
                      <span class="vertical-label">{{ col.label }}</span>
                    </button>
                  } @else {
                    <div class="header-row">
                      <span class="header-label">{{ col.label }}</span>
                      <button
                        mat-icon-button
                        type="button"
                        class="collapse-btn"
                        matTooltip="Collapse column"
                        (click)="collapseColumn(col.key); $event.stopPropagation()"
                        [attr.aria-label]="'Collapse column ' + col.label"
                      >
                        <mat-icon>chevron_left</mat-icon>
                      </button>
                    </div>
                  }
                </th>
              }
            </tr>
          </thead>
          <tbody>
            @for (record of records(); track catalog.getRecordId(record)) {
              <tr
                [class.active]="isSelected(record)"
                [class.comparing]="isComparing(record)"
                [class.playing-row]="isPlayingRow(record)"
                (click)="select.emit(catalog.getRecordId(record))"
              >
                <td
                  class="actions-col sticky-col"
                  [class.with-play]="isMusicSheet()"
                  (click)="$event.stopPropagation()"
                >
                  @if (isMusicSheet()) {
                    <button
                      mat-icon-button
                      type="button"
                      class="play-action"
                      [class.active]="isPlayingRow(record)"
                      [disabled]="!canPlay(record)"
                      [matTooltip]="playTooltip(record)"
                      [attr.aria-label]="playTooltip(record)"
                      (click)="onPlay(record)"
                    >
                      <mat-icon>{{ playIcon(record) }}</mat-icon>
                    </button>
                  }
                  <button
                    mat-icon-button
                    type="button"
                    matTooltip="Open detail view"
                    (click)="openDetail.emit(catalog.getRecordId(record))"
                  >
                    <mat-icon>search</mat-icon>
                  </button>
                  <button
                    mat-icon-button
                    type="button"
                    matTooltip="Toggle compare"
                    (click)="toggleCompare.emit(catalog.getRecordId(record))"
                  >
                    <mat-icon>{{
                      isComparing(record) ? 'check_box' : 'check_box_outline_blank'
                    }}</mat-icon>
                  </button>
                </td>
                @for (col of columns(); track col.key) {
                  @if (isCollapsed(col.key)) {
                    <td
                      class="collapsed"
                      (click)="expandColumn(col.key); $event.stopPropagation()"
                      [attr.title]="'Expand ' + col.label"
                    ></td>
                  } @else {
                    <td>
                      <span class="cell" [title]="cellValue(record, col)">{{
                        cellValue(record, col)
                      }}</span>
                    </td>
                  }
                }
              </tr>
            } @empty {
              <tr class="empty-row">
                <td [attr.colspan]="columns().length + 1">
                  <div class="empty">
                    <mat-icon>search_off</mat-icon>
                    <p>No records match the current filters.</p>
                  </div>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: `
    :host {
      display: block;
      height: 100%;
      min-height: 0;
    }

    .sheet {
      display: flex;
      flex-direction: column;
      height: 100%;
      min-height: 0;
    }

    .toolbar {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 0.75rem;
      padding: 0.85rem 1rem;
      border-bottom: 1px solid color-mix(in srgb, var(--tb-ink) 10%, transparent);
      flex-shrink: 0;
    }

    .toolbar-left {
      display: flex;
      align-items: baseline;
      gap: 0.75rem;
    }

    .toolbar h3 {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      margin: 0;
      font-size: 1.05rem;
    }

    .toolbar h3 mat-icon {
      font-size: 1.25rem;
      width: 1.25rem;
      height: 1.25rem;
      color: var(--tb-accent);
    }

    .count {
      font-size: 0.85rem;
      color: var(--tb-muted);
    }

    .toolbar-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 0.25rem;
    }

    .table-wrap {
      flex: 1;
      min-height: 0;
      overflow: auto;
    }

    table {
      border-collapse: separate;
      border-spacing: 0;
      width: max-content;
      min-width: 100%;
      font-size: 0.86rem;
    }

    th,
    td {
      border-bottom: 1px solid color-mix(in srgb, var(--tb-ink) 8%, transparent);
      border-right: 1px solid color-mix(in srgb, var(--tb-ink) 6%, transparent);
      padding: 0.45rem 0.65rem;
      text-align: left;
      vertical-align: middle;
      max-width: 18rem;
    }

    th {
      position: sticky;
      top: 0;
      z-index: 2;
      background: color-mix(in srgb, var(--tb-panel) 92%, var(--tb-ink));
      font-weight: 600;
      white-space: nowrap;
    }

    th.collapsed,
    td.collapsed {
      width: 1.85rem;
      min-width: 1.85rem;
      max-width: 1.85rem;
      padding: 0;
      overflow: hidden;
      background: color-mix(in srgb, var(--tb-accent) 10%, var(--tb-panel));
      cursor: pointer;
      vertical-align: middle;
    }

    .header-row {
      display: flex;
      align-items: center;
      gap: 0.15rem;
    }

    .header-label {
      flex: 1;
    }

    .collapse-btn {
      width: 1.75rem;
      height: 1.75rem;
      padding: 0;
      flex-shrink: 0;
    }

    .collapse-btn mat-icon {
      font-size: 1.1rem;
      width: 1.1rem;
      height: 1.1rem;
    }

    .collapsed-header {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      min-height: 2.5rem;
      max-height: 8rem;
      padding: 0.4rem 0;
      border: 0;
      background: transparent;
      color: var(--tb-ink);
      cursor: pointer;
    }

    .collapsed-header:hover,
    td.collapsed:hover {
      background: color-mix(in srgb, var(--tb-accent) 20%, var(--tb-panel));
    }

    .vertical-label {
      writing-mode: vertical-rl;
      transform: rotate(180deg);
      font-size: 0.75rem;
      font-weight: 600;
      letter-spacing: 0.03em;
      white-space: nowrap;
      line-height: 1;
      max-height: 7.5rem;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .actions-col {
      width: 5.5rem;
      min-width: 5.5rem;
      max-width: 5.5rem;
      white-space: nowrap;
      padding: 0.2rem 0.25rem;
    }

    .actions-col.with-play {
      width: 7.75rem;
      min-width: 7.75rem;
      max-width: 7.75rem;
    }

    .play-action {
      color: var(--tb-accent-strong);
    }

    .play-action.active {
      color: var(--tb-accent-strong);
      background: color-mix(in srgb, var(--tb-accent) 18%, transparent);
    }

    .play-action:disabled {
      opacity: 0.35;
    }

    .sticky-col {
      position: sticky;
      left: 0;
      z-index: 1;
      background: var(--tb-panel);
    }

    th.sticky-col {
      z-index: 3;
      background: color-mix(in srgb, var(--tb-panel) 92%, var(--tb-ink));
    }

    tbody tr {
      cursor: pointer;
    }

    tbody tr:hover td:not(.collapsed) {
      background: color-mix(in srgb, var(--tb-accent) 8%, transparent);
    }

    tbody tr:hover td.sticky-col {
      background: color-mix(in srgb, var(--tb-panel) 88%, var(--tb-accent));
    }

    tbody tr.active td:not(.collapsed) {
      background: color-mix(in srgb, var(--tb-accent) 14%, transparent);
    }

    tbody tr.active td.sticky-col {
      background: color-mix(in srgb, var(--tb-panel) 82%, var(--tb-accent));
    }

    tbody tr.playing-row td.sticky-col {
      box-shadow: inset 3px 0 0 var(--tb-accent-strong);
    }

    tbody tr.comparing td.sticky-col {
      box-shadow: inset 3px 0 0 var(--tb-accent-strong);
    }

    .cell {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      word-break: break-word;
      white-space: normal;
      line-height: 1.35;
      color: var(--tb-ink);
    }

    .empty-row td {
      border: 0;
      max-width: none;
    }

    .empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      padding: 2.5rem 1rem;
      color: var(--tb-muted);
    }

    .empty mat-icon {
      font-size: 2rem;
      width: 2rem;
      height: 2rem;
    }

    .empty p {
      margin: 0;
    }

    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    }
  `,
})
export class SheetViewComponent {
  readonly catalog = inject(CatalogService);
  readonly prefs = inject(PreferencesService);
  readonly musicPlayer = inject(MusicPlayerService);

  readonly records = input.required<JsonRecord[]>();
  readonly definition = input.required<DatasetDefinition>();
  readonly selectedIds = input<string[]>([]);
  readonly compareIds = input<string[]>([]);

  readonly select = output<string>();
  readonly openDetail = output<string>();
  readonly toggleCompare = output<string>();

  readonly columns = computed(() => sheetColumnsFor(this.definition()));

  readonly collapsedSet = computed(() => {
    const keys = this.prefs.collapsedColumnsFor(this.definition().id);
    return new Set(keys);
  });

  isMusicSheet(): boolean {
    return this.definition().id === 'music';
  }

  canPlay(record: JsonRecord): boolean {
    return !!resolveMusicAudioUrl(record);
  }

  isPlayingRow(record: JsonRecord): boolean {
    const id = this.catalog.getRecordId(record, this.definition());
    return this.musicPlayer.isPlayingRecord(id);
  }

  playIcon(record: JsonRecord): string {
    const id = this.catalog.getRecordId(record, this.definition());
    return this.musicPlayer.isPlayingRecord(id) ? 'pause' : 'play_arrow';
  }

  playTooltip(record: JsonRecord): string {
    if (!this.canPlay(record)) return 'No audio asset';
    const id = this.catalog.getRecordId(record, this.definition());
    if (this.musicPlayer.isPlayingRecord(id)) return 'Pause';
    if (this.musicPlayer.isCurrent(id)) return 'Resume';
    return 'Play';
  }

  onPlay(record: JsonRecord): void {
    if (!this.canPlay(record)) return;
    this.musicPlayer.playOrToggle(record);
  }

  isCollapsed(key: string): boolean {
    return this.collapsedSet().has(key);
  }

  cellValue(record: JsonRecord, col: SheetColumnDef): string {
    return formatSheetCell(record, col, this.definition());
  }

  isSelected(record: JsonRecord): boolean {
    return this.selectedIds().includes(this.catalog.getRecordId(record));
  }

  isComparing(record: JsonRecord): boolean {
    return this.compareIds().includes(this.catalog.getRecordId(record));
  }

  collapseColumn(key: string): void {
    if (!this.isCollapsed(key)) {
      this.prefs.toggleCollapsedColumn(this.definition().id, key);
    }
  }

  expandColumn(key: string): void {
    if (this.isCollapsed(key)) {
      this.prefs.toggleCollapsedColumn(this.definition().id, key);
    }
  }

  collapseAll(): void {
    this.prefs.setCollapsedColumns(
      this.definition().id,
      this.columns().map((c) => c.key),
    );
  }

  expandAll(): void {
    this.prefs.setCollapsedColumns(this.definition().id, []);
  }
}
