import { Component, Input, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { JsonRecord } from '../../models/catalog.models';
import { CatalogService } from '../../services/catalog.service';
import { RecordMediaService } from '../../services/record-media.service';
import { MediaImage } from '../../models/media.models';
import { MediaPreviewComponent } from '../media-preview/media-preview.component';

/**
 * Open-ended bestiary presentation: media first, then light optional sections.
 * Schema is intentionally loose while entries are still being authored.
 */
@Component({
  selector: 'app-bestiary-presentation',
  standalone: true,
  imports: [MatIconModule, MediaPreviewComponent],
  template: `
    @if (record) {
      <div class="presentation">
        <app-media-preview
          [modelUrl]="modelUrl"
          [posterUrl]="posterUrl"
          [images]="images"
          [record]="record"
          layout="split"
        />

        <div class="meta-line">
          @if (kind) {
            <span><mat-icon>pets</mat-icon> {{ kind }}</span>
          }
          @if (temperament) {
            <span><mat-icon>psychology</mat-icon> {{ temperament }}</span>
          }
          @if (size) {
            <span><mat-icon>straighten</mat-icon> {{ size }}</span>
          }
        </div>

        @if (habitats.length) {
          <section class="panel">
            <div class="section-title">
              <mat-icon>public</mat-icon>
              <h3>Habitat</h3>
            </div>
            <div class="chip-row">
              @for (item of habitats; track item) {
                <span>{{ item }}</span>
              }
            </div>
          </section>
        }

        @if (behaviors.length) {
          <section class="panel">
            <div class="section-title">
              <mat-icon>directions_run</mat-icon>
              <h3>Behaviors</h3>
            </div>
            <ul class="plain-list">
              @for (item of behaviors; track item) {
                <li>{{ item }}</li>
              }
            </ul>
          </section>
        }

        @if (drops.length) {
          <section class="panel">
            <div class="section-title">
              <mat-icon>inventory_2</mat-icon>
              <h3>Drops / yields</h3>
            </div>
            <div class="chip-row">
              @for (item of drops; track item) {
                <span>{{ item }}</span>
              }
            </div>
          </section>
        }

        @if (linkedSkills.length || linkedMaterials.length) {
          <section class="split">
            @if (linkedMaterials.length) {
              <div class="panel">
                <div class="section-title">
                  <mat-icon>category</mat-icon>
                  <h3>Linked materials</h3>
                </div>
                <div class="chip-row">
                  @for (id of linkedMaterials; track id) {
                    <button type="button" class="link-chip" (click)="openMaterial(id)">
                      {{ id }}
                      <mat-icon>north_east</mat-icon>
                    </button>
                  }
                </div>
              </div>
            }
            @if (linkedSkills.length) {
              <div class="panel">
                <div class="section-title">
                  <mat-icon>psychology</mat-icon>
                  <h3>Linked skills</h3>
                </div>
                <div class="chip-row">
                  @for (skill of linkedSkills; track skill) {
                    <button type="button" class="link-chip" (click)="openSkill(skill)">
                      {{ skill }}
                      <mat-icon>north_east</mat-icon>
                    </button>
                  }
                </div>
              </div>
            }
          </section>
        }

        @if (notes) {
          <section class="panel">
            <div class="section-title">
              <mat-icon>notes</mat-icon>
              <h3>Notes</h3>
            </div>
            <p>{{ notes }}</p>
          </section>
        }

        @if (extraKeys.length) {
          <section class="panel subtle">
            <div class="section-title">
              <mat-icon>more_horiz</mat-icon>
              <h3>Other fields</h3>
            </div>
            <div class="kv-list">
              @for (key of extraKeys; track key) {
                <div class="kv">
                  <span class="label">{{ key }}</span>
                  <strong>{{ formatValue(record[key]) }}</strong>
                </div>
              }
            </div>
          </section>
        }
      </div>
    }
  `,
  styles: `
    .presentation { display: grid; gap: 0.75rem; }
    .meta-line {
      display: flex; flex-wrap: wrap; gap: 0.75rem;
      color: var(--tb-muted); font-size: 0.84rem;
    }
    .meta-line span { display: inline-flex; align-items: center; gap: 0.25rem; }
    .meta-line mat-icon { font-size: 1rem; width: 1rem; height: 1rem; }
    .panel {
      background: var(--tb-card);
      border: 1px solid color-mix(in srgb, var(--tb-ink) 10%, transparent);
      border-radius: 12px; padding: 0.8rem 0.9rem;
    }
    .panel.subtle { opacity: 0.92; }
    .section-title {
      display: flex; align-items: center; gap: 0.4rem; margin-bottom: 0.45rem;
    }
    .section-title h3 { margin: 0; font-size: 0.95rem; }
    .section-title mat-icon {
      font-size: 1.1rem; width: 1.1rem; height: 1.1rem; color: var(--tb-muted);
    }
    .panel p, .plain-list {
      margin: 0; font-size: 0.84rem; line-height: 1.45; color: var(--tb-muted);
    }
    .plain-list { padding-left: 1.1rem; }
    .chip-row { display: flex; flex-wrap: wrap; gap: 0.35rem; }
    .chip-row span, .link-chip {
      font-size: 0.78rem; padding: 0.25rem 0.55rem; border-radius: 999px;
      background: color-mix(in srgb, var(--tb-ink) 8%, transparent);
    }
    .link-chip {
      border: 1px solid color-mix(in srgb, var(--tb-ink) 12%, transparent);
      color: inherit; font: inherit; cursor: pointer;
      display: inline-flex; align-items: center; gap: 0.15rem;
    }
    .link-chip:hover { border-color: var(--tb-accent-strong); }
    .link-chip mat-icon { font-size: 0.9rem; width: 0.9rem; height: 0.9rem; }
    .split { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
    .kv-list { display: grid; gap: 0.4rem; }
    .kv .label {
      display: block; font-size: 0.72rem; text-transform: uppercase;
      letter-spacing: 0.06em; color: var(--tb-muted);
    }
    .kv strong { font-size: 0.84rem; font-weight: 600; }
    @media (max-width: 900px) { .split { grid-template-columns: 1fr; } }
  `,
})
export class BestiaryPresentationComponent {
  private readonly catalog = inject(CatalogService);
  private readonly recordMedia = inject(RecordMediaService);

  @Input({ required: true }) record!: JsonRecord;

  private readonly knownKeys = new Set([
    'id', 'name', 'description', 'tags', 'kind', 'media', 'modelUrl', 'posterUrl',
    'referenceImages', 'images', 'temperament', 'size', 'habitats', 'habitat',
    'behaviors', 'drops', 'yields', 'linkedSkills', 'linkedMaterials', 'notes', 'source',
  ]);

  get modelUrl(): string | null {
    return this.recordMedia.resolve(this.record).modelUrl;
  }

  get posterUrl(): string | null {
    return this.recordMedia.resolve(this.record).posterUrl;
  }

  get images(): MediaImage[] {
    return this.recordMedia.resolve(this.record).images;
  }

  get kind(): string {
    return this.asText(this.record['kind']);
  }

  get temperament(): string {
    return this.asText(this.record['temperament']);
  }

  get size(): string {
    return this.asText(this.record['size']);
  }

  get habitats(): string[] {
    return this.asStringArray(this.record['habitats'] ?? this.record['habitat']);
  }

  get behaviors(): string[] {
    return this.asStringArray(this.record['behaviors']);
  }

  get drops(): string[] {
    return this.asStringArray(this.record['drops'] ?? this.record['yields']);
  }

  get linkedSkills(): string[] {
    return this.asStringArray(this.record['linkedSkills']);
  }

  get linkedMaterials(): string[] {
    return this.asStringArray(this.record['linkedMaterials']);
  }

  get notes(): string {
    return this.asText(this.record['notes']);
  }

  get extraKeys(): string[] {
    return Object.keys(this.record).filter((key) => !this.knownKeys.has(key));
  }

  openSkill(skillId: string): void {
    void this.catalog.selectDataset('skills').then(() => this.catalog.selectRecord(skillId));
  }

  openMaterial(materialId: string): void {
    void this.catalog.selectDataset('materials').then(() => this.catalog.selectRecord(materialId));
  }

  formatValue(value: unknown): string {
    if (value == null) return '—';
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      return String(value);
    }
    return JSON.stringify(value);
  }

  private asText(value: unknown): string {
    return typeof value === 'string' ? value : '';
  }

  private asStringArray(value: unknown): string[] {
    if (!Array.isArray(value)) return [];
    return value.filter((v): v is string => typeof v === 'string');
  }
}
