import { Component, Input, inject } from '@angular/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { JsonRecord, DetailViewMode } from '../../models/catalog.models';
import { CatalogService } from '../../services/catalog.service';
import { PreferencesService } from '../../services/preferences.service';
import { JsonTreeComponent } from '../json-tree/json-tree.component';
import { SkillPresentationComponent } from '../skill-presentation/skill-presentation.component';
import { MaterialPresentationComponent } from '../material-presentation/material-presentation.component';
import { PropertyPresentationComponent } from '../property-presentation/property-presentation.component';

@Component({
  selector: 'app-record-detail',
  standalone: true,
  imports: [
    MatChipsModule,
    MatIconModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatTooltipModule,
    JsonTreeComponent,
    SkillPresentationComponent,
    MaterialPresentationComponent,
    PropertyPresentationComponent,
  ],
  template: `
    @if (!record) {
      <div class="empty">
        <mat-icon>touch_app</mat-icon>
        <p>Select a record to inspect its presentation or JSON shape.</p>
      </div>
    } @else {
      <header class="detail-header">
        <div>
          <p class="eyebrow">{{ kindLabel }}</p>
          <h2>{{ catalog.getRecordTitle(record) }}</h2>
          <p class="id">{{ catalog.getRecordId(record) }}</p>
        </div>
        <div class="header-actions">
          <mat-button-toggle-group
            class="view-toggle"
            [value]="prefs.detailView()"
            (change)="onViewChange($event.value)"
            aria-label="Detail view mode"
          >
            <mat-button-toggle value="presentation" matTooltip="Presentation view">
              <mat-icon>dashboard</mat-icon>
              Present
            </mat-button-toggle>
            <mat-button-toggle value="json" matTooltip="Raw JSON tree">
              <mat-icon>data_object</mat-icon>
              JSON
            </mat-button-toggle>
          </mat-button-toggle-group>

          <button
            mat-stroked-button
            type="button"
            (click)="catalog.toggleCompare(catalog.getRecordId(record))"
          >
            <mat-icon>{{ comparing ? 'remove' : 'compare' }}</mat-icon>
            {{ comparing ? 'Remove compare' : 'Compare' }}
          </button>
        </div>
      </header>

      @if (catalog.getRecordDescription(record); as description) {
        <p class="description">{{ description }}</p>
      }

      <mat-chip-set class="tags">
        @for (tag of catalog.getRecordTags(record); track tag) {
          <mat-chip (click)="catalog.toggleTagFilter(tag)" [highlighted]="isActiveTag(tag)">
            {{ tag }}
          </mat-chip>
        }
      </mat-chip-set>

      @if (prefs.detailView() === 'presentation') {
        @if (isSkillRecord) {
          <app-skill-presentation [record]="record" />
        } @else if (isMaterialRecord) {
          <app-material-presentation [record]="record" />
        } @else if (isPropertyRecord) {
          <app-property-presentation [record]="record" />
        } @else {
          <section class="generic-presentation">
            <p class="hint">
              No specialized presentation for this record shape yet. Showing notable fields;
              switch to JSON for the full tree.
            </p>
            <app-json-tree
              [value]="presentationFields"
              rootLabel="highlights"
              [defaultOpenDepth]="2"
            />
          </section>
        }
      } @else {
        <section class="tree-section">
          <div class="section-title">
            <mat-icon>account_tree</mat-icon>
            <h3>Record fields</h3>
          </div>
          <app-json-tree [value]="record" rootLabel="record" [defaultOpenDepth]="1" />
        </section>
      }
    }
  `,
  styles: `
    :host {
      display: block;
      height: 100%;
    }

    .empty {
      height: 100%;
      min-height: 18rem;
      display: grid;
      place-content: center;
      gap: 0.5rem;
      text-align: center;
      color: var(--tb-muted);
    }

    .empty mat-icon {
      margin: 0 auto;
      font-size: 2.5rem;
      width: 2.5rem;
      height: 2.5rem;
    }

    .detail-header {
      display: flex;
      justify-content: space-between;
      gap: 1rem;
      align-items: start;
    }

    .header-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      justify-content: flex-end;
      align-items: center;
    }

    .view-toggle {
      border-radius: 999px;
    }

    .eyebrow {
      margin: 0;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      font-size: 0.72rem;
      color: var(--tb-accent-strong);
      font-weight: 700;
    }

    h2 {
      margin: 0.15rem 0;
      font-size: 1.6rem;
      line-height: 1.15;
    }

    .id {
      margin: 0;
      color: var(--tb-muted);
      font-size: 0.85rem;
    }

    .description {
      margin: 1rem 0;
      line-height: 1.55;
      color: color-mix(in srgb, var(--tb-ink) 82%, transparent);
    }

    .tags {
      margin-bottom: 1rem;
    }

    mat-chip {
      cursor: pointer;
    }

    .tree-section,
    .generic-presentation {
      margin-top: 0.25rem;
    }

    .section-title {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      margin-bottom: 0.5rem;
    }

    .section-title h3 {
      margin: 0;
      font-size: 0.95rem;
    }

    .section-title mat-icon {
      font-size: 1.1rem;
      width: 1.1rem;
      height: 1.1rem;
      color: var(--tb-muted);
    }

    .hint {
      margin: 0 0 0.75rem;
      color: var(--tb-muted);
      font-size: 0.88rem;
    }

    @media (max-width: 700px) {
      .detail-header {
        flex-direction: column;
      }

      .header-actions {
        justify-content: flex-start;
      }
    }
  `,
})
export class RecordDetailComponent {
  readonly catalog = inject(CatalogService);
  readonly prefs = inject(PreferencesService);

  @Input() record: JsonRecord | null = null;

  get comparing(): boolean {
    if (!this.record) return false;
    const id = this.catalog.getRecordId(this.record);
    return this.catalog.compareIds().includes(id);
  }

  get kindLabel(): string {
    if (!this.record) return '';
    const field = this.catalog.activeDataset()?.definition.recordKindField ?? 'kind';
    const value = this.record[field];
    return typeof value === 'string' ? value : 'record';
  }

  get isSkillRecord(): boolean {
    if (!this.record) return false;
    const datasetId = this.catalog.activeDatasetId();
    if (datasetId === 'skills') return true;
    const kind = this.record['kind'];
    return kind === 'profession' || kind === 'common';
  }

  get isMaterialRecord(): boolean {
    if (!this.record) return false;
    const datasetId = this.catalog.activeDatasetId();
    if (datasetId === 'materials') return true;
    return this.record['kind'] === 'material';
  }

  get isPropertyRecord(): boolean {
    if (!this.record) return false;
    const datasetId = this.catalog.activeDatasetId();
    if (datasetId === 'item-properties') return true;
    return this.record['kind'] === 'item-property';
  }

  /** Fields useful in a generic presentation without repeating header/tags. */
  get presentationFields(): JsonRecord {
    if (!this.record) return {};
    const skip = new Set([
      'id',
      'name',
      'tags',
      'description',
      'kind',
    ]);
    const result: JsonRecord = {};
    for (const [key, value] of Object.entries(this.record)) {
      if (!skip.has(key)) result[key] = value;
    }
    return result;
  }

  isActiveTag(tag: string): boolean {
    return this.catalog.filters().tags.includes(tag);
  }

  onViewChange(value: DetailViewMode | undefined): void {
    if (value === 'presentation' || value === 'json') {
      this.prefs.setDetailView(value);
    }
  }
}
