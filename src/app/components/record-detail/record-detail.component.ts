import { Component, Input, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { JsonRecord, DetailViewMode } from '../../models/catalog.models';
import { CatalogService } from '../../services/catalog.service';
import { PreferencesService } from '../../services/preferences.service';
import { RecordEditsService } from '../../services/record-edits.service';
import { JsonTreeComponent } from '../json-tree/json-tree.component';
import { SkillPresentationComponent } from '../skill-presentation/skill-presentation.component';
import { MaterialPresentationComponent } from '../material-presentation/material-presentation.component';
import { PropertyPresentationComponent } from '../property-presentation/property-presentation.component';
import { BestiaryPresentationComponent } from '../bestiary-presentation/bestiary-presentation.component';
import { ResourcePresentationComponent } from '../resource-presentation/resource-presentation.component';
import { ItemPresentationComponent } from '../item-presentation/item-presentation.component';
import { MusicPresentationComponent } from '../music-presentation/music-presentation.component';

@Component({
  selector: 'app-record-detail',
  standalone: true,
  imports: [
    FormsModule,
    MatChipsModule,
    MatIconModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatTooltipModule,
    MatFormFieldModule,
    MatInputModule,
    JsonTreeComponent,
    SkillPresentationComponent,
    MaterialPresentationComponent,
    PropertyPresentationComponent,
    BestiaryPresentationComponent,
    ResourcePresentationComponent,
    ItemPresentationComponent,
    MusicPresentationComponent,
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
            [class.active-edit]="edits.editing()"
            (click)="edits.toggleEditing()"
            matTooltip="Edit tags and reference images on this entry"
          >
            <mat-icon>{{ edits.editing() ? 'edit_off' : 'edit' }}</mat-icon>
            {{ edits.editing() ? 'Done editing' : 'Edit' }}
          </button>

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

      <section class="tags-section" [class.editing]="edits.editing()">
        <div class="tags-header">
          <span class="tags-label">Tags</span>
          @if (isDirty) {
            <span class="dirty-pill">Unsaved</span>
          }
        </div>

        <mat-chip-set class="tags" [attr.aria-label]="edits.editing() ? 'Editable tags' : 'Tags'">
          @for (tag of displayTags; track tag) {
            @if (edits.editing()) {
              <mat-chip [removable]="true" (removed)="onRemoveTag(tag)">
                {{ tag }}
                <button matChipRemove type="button" [attr.aria-label]="'Remove ' + tag">
                  <mat-icon>cancel</mat-icon>
                </button>
              </mat-chip>
            } @else {
              <mat-chip
                (click)="catalog.toggleTagFilter(tag)"
                [highlighted]="isActiveTag(tag)"
              >
                {{ tag }}
              </mat-chip>
            }
          }
        </mat-chip-set>

        @if (edits.editing()) {
          <div class="tag-add-row">
            <mat-form-field appearance="outline" class="tag-field" subscriptSizing="dynamic">
              <mat-label>Add tag</mat-label>
              <input
                matInput
                [(ngModel)]="newTag"
                (keydown.enter)="$event.preventDefault(); onAddTag()"
                placeholder="e.g. caravan"
              />
            </mat-form-field>
            <button mat-flat-button color="primary" type="button" (click)="onAddTag()" [disabled]="!newTag.trim()">
              <mat-icon>add</mat-icon>
              Add
            </button>
          </div>
        }

        @if (isDirty) {
          <div class="edit-bar">
            <span>Changes are draft until you save. Saved edits persist in this browser.</span>
            <div class="edit-actions">
              <button mat-stroked-button type="button" (click)="onDiscard()">
                <mat-icon>undo</mat-icon>
                Discard
              </button>
              <button mat-flat-button color="primary" type="button" (click)="onSave()">
                <mat-icon>save</mat-icon>
                Save
              </button>
            </div>
          </div>
        }
      </section>

      @if (prefs.detailView() === 'presentation') {
        @if (isSkillRecord) {
          <app-skill-presentation [record]="record" />
        } @else if (isMaterialRecord) {
          <app-material-presentation [record]="record" />
        } @else if (isPropertyRecord) {
          <app-property-presentation [record]="record" />
        } @else if (isBestiaryRecord) {
          <app-bestiary-presentation [record]="record" />
        } @else if (isResourceRecord) {
          <app-resource-presentation [record]="record" />
        } @else if (isItemRecord) {
          <app-item-presentation [record]="record" />
        } @else if (isMusicRecord) {
          <app-music-presentation [record]="record" />
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

    .active-edit {
      border-color: var(--tb-accent-strong);
      color: var(--tb-accent-strong);
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

    .tags-section {
      margin-bottom: 1rem;
      display: grid;
      gap: 0.55rem;
    }

    .tags-section.editing {
      padding: 0.75rem 0.85rem;
      border-radius: 12px;
      background: color-mix(in srgb, var(--tb-accent) 8%, var(--tb-card));
      border: 1px solid color-mix(in srgb, var(--tb-accent) 28%, transparent);
    }

    .tags-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .tags-label {
      font-size: 0.72rem;
      font-weight: 700;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: var(--tb-muted);
    }

    .dirty-pill {
      font-size: 0.72rem;
      font-weight: 700;
      padding: 0.15rem 0.45rem;
      border-radius: 999px;
      background: color-mix(in srgb, var(--tb-accent) 22%, transparent);
      color: var(--tb-accent-strong);
    }

    .tags mat-chip {
      cursor: pointer;
    }

    .tag-add-row {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      align-items: center;
    }

    .tag-field {
      flex: 1 1 12rem;
      min-width: 10rem;
    }

    .edit-bar {
      display: flex;
      flex-wrap: wrap;
      gap: 0.65rem;
      justify-content: space-between;
      align-items: center;
      padding-top: 0.35rem;
      border-top: 1px solid color-mix(in srgb, var(--tb-ink) 10%, transparent);
      font-size: 0.82rem;
      color: var(--tb-muted);
    }

    .edit-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 0.4rem;
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

      .edit-bar {
        flex-direction: column;
        align-items: stretch;
      }
    }
  `,
})
export class RecordDetailComponent {
  readonly catalog = inject(CatalogService);
  readonly prefs = inject(PreferencesService);
  readonly edits = inject(RecordEditsService);

  @Input() record: JsonRecord | null = null;

  newTag = '';

  get comparing(): boolean {
    if (!this.record) return false;
    const id = this.catalog.getRecordId(this.record);
    return this.catalog.compareIds().includes(id);
  }

  get isDirty(): boolean {
    // Touch override signals so the template refreshes on draft/save.
    this.edits.draft();
    this.edits.committed();
    return !!this.record && this.catalog.isRecordDirty(this.record);
  }

  get displayTags(): string[] {
    this.edits.draft();
    this.edits.committed();
    return this.record ? this.catalog.getRecordTags(this.record) : [];
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

  get isBestiaryRecord(): boolean {
    if (!this.record) return false;
    return this.catalog.activeDatasetId() === 'bestiary';
  }

  get isResourceRecord(): boolean {
    if (!this.record) return false;
    return this.catalog.activeDatasetId() === 'resource-glossary';
  }

  get isItemRecord(): boolean {
    if (!this.record) return false;
    return this.catalog.activeDatasetId() === 'items';
  }

  get isMusicRecord(): boolean {
    if (!this.record) return false;
    return this.catalog.activeDatasetId() === 'music';
  }

  get presentationFields(): JsonRecord {
    if (!this.record) return {};
    const skip = new Set(['id', 'name', 'tags', 'description', 'kind']);
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

  onAddTag(): void {
    if (!this.record || !this.newTag.trim()) return;
    this.catalog.addRecordTag(this.record, this.newTag);
    this.newTag = '';
  }

  onRemoveTag(tag: string): void {
    if (!this.record) return;
    this.catalog.removeRecordTag(this.record, tag);
  }

  onSave(): void {
    if (!this.record) return;
    this.catalog.saveRecordEdits(this.record);
  }

  onDiscard(): void {
    if (!this.record) return;
    this.catalog.discardRecordEdits(this.record);
  }
}
