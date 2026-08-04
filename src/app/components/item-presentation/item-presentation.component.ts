import { Component, Input, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { JsonRecord } from '../../models/catalog.models';
import { CatalogService } from '../../services/catalog.service';
import { RecordMediaService } from '../../services/record-media.service';
import { MediaImage } from '../../models/media.models';
import { MediaPreviewComponent } from '../media-preview/media-preview.component';

interface PropertyRow {
  name: string;
  valueDisplay: string;
  valueType: string;
}

interface RecipeStepView {
  name: string;
  labor?: string;
  requirements: string[];
}

/**
 * Open-ended item database presentation aligned with ChainLink ItemBase / ItemRecipe ideas.
 */
@Component({
  selector: 'app-item-presentation',
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
            <span><mat-icon>inventory_2</mat-icon> {{ kind }}</span>
          }
          @if (category) {
            <span><mat-icon>category</mat-icon> {{ category }}</span>
          }
          @if (addressableAsset) {
            <span><mat-icon>link</mat-icon> {{ addressableAsset }}</span>
          }
        </div>

        @if (properties.length) {
          <section class="panel">
            <div class="section-title">
              <mat-icon>tune</mat-icon>
              <h3>Properties</h3>
            </div>
            <p class="hint">ItemPropertyValue-style bindings (open schema while authoring).</p>
            <div class="prop-list">
              @for (prop of properties; track prop.name) {
                <div class="prop-row">
                  <strong>{{ prop.name }}</strong>
                  <span class="type">{{ prop.valueType }}</span>
                  <span>{{ prop.valueDisplay }}</span>
                </div>
              }
            </div>
          </section>
        }

        @if (recipeSteps.length) {
          <section class="panel">
            <div class="section-title">
              <mat-icon>soup_kitchen</mat-icon>
              <h3>{{ recipeName || 'Craft recipe' }}</h3>
            </div>
            <div class="recipe-list">
              @for (step of recipeSteps; track step.name; let i = $index) {
                <article class="recipe-step">
                  <header>
                    <strong>{{ i + 1 }}. {{ step.name }}</strong>
                    @if (step.labor) {
                      <span class="labor">{{ step.labor }}</span>
                    }
                  </header>
                  @if (step.requirements.length) {
                    <div class="chip-row">
                      @for (req of step.requirements; track req) {
                        <span>{{ req }}</span>
                      }
                    </div>
                  }
                </article>
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
                  <h3>Materials</h3>
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
                  @for (id of linkedSkills; track id) {
                    <button type="button" class="link-chip" (click)="openSkill(id)">
                      {{ id }}
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
    .hint, .panel p {
      margin: 0 0 0.55rem; font-size: 0.84rem; line-height: 1.45; color: var(--tb-muted);
    }
    .prop-list { display: grid; gap: 0.35rem; font-size: 0.84rem; }
    .prop-row {
      display: grid; grid-template-columns: 1.2fr 0.7fr 1fr; gap: 0.5rem;
      padding: 0.3rem 0;
      border-bottom: 1px solid color-mix(in srgb, var(--tb-ink) 6%, transparent);
    }
    .type {
      color: var(--tb-accent-strong); font-size: 0.72rem; font-weight: 700;
      text-transform: uppercase;
    }
    .recipe-list { display: grid; gap: 0.55rem; }
    .recipe-step header {
      display: flex; justify-content: space-between; gap: 0.5rem;
      margin-bottom: 0.3rem; font-size: 0.86rem;
    }
    .labor { color: var(--tb-muted); font-size: 0.78rem; }
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
    @media (max-width: 900px) {
      .split { grid-template-columns: 1fr; }
      .prop-row { grid-template-columns: 1fr 1fr; }
    }
  `,
})
export class ItemPresentationComponent {
  private readonly catalog = inject(CatalogService);
  private readonly recordMedia = inject(RecordMediaService);

  @Input({ required: true }) record!: JsonRecord;

  private readonly knownKeys = new Set([
    'id', 'name', 'description', 'tags', 'kind', 'category', 'media', 'modelUrl',
    'posterUrl', 'referenceImages', 'images', 'addressableAsset', 'properties',
    'recipe', 'recipes', 'linkedSkills', 'linkedMaterials', 'notes', 'source',
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

  get category(): string {
    return this.asText(this.record['category']);
  }

  get addressableAsset(): string {
    return this.asText(this.record['addressableAsset']);
  }

  get notes(): string {
    return this.asText(this.record['notes']);
  }

  get linkedSkills(): string[] {
    return this.asStringArray(this.record['linkedSkills']);
  }

  get linkedMaterials(): string[] {
    return this.asStringArray(this.record['linkedMaterials']);
  }

  get recipeName(): string {
    const recipe = this.recipeObject;
    return recipe ? this.asText(recipe['name']) : '';
  }

  get properties(): PropertyRow[] {
    const raw = this.record['properties'];
    if (!Array.isArray(raw)) return [];
    return raw
      .filter((item): item is JsonRecord => this.isObject(item))
      .map((item) => ({
        name:
          this.asText(item['name']) ||
          this.asText(item['propertyId']) ||
          'Property',
        valueType: this.asText(item['valueType']) || '—',
        valueDisplay: this.formatPropValue(item['value']),
      }));
  }

  get recipeSteps(): RecipeStepView[] {
    const recipe = this.recipeObject;
    const steps = recipe?.['steps'];
    if (!Array.isArray(steps)) return [];
    return steps
      .filter((item): item is JsonRecord => this.isObject(item))
      .map((step) => ({
        name: this.asText(step['name']) || 'Step',
        labor:
          typeof step['laborRequirement'] === 'number'
            ? `Labor ${step['laborRequirement']}`
            : this.asText(step['labor']) || undefined,
        requirements: this.asStringArray(step['requirements']).length
          ? this.asStringArray(step['requirements'])
          : this.summarizeRequirements(step['requirements']),
      }));
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

  private get recipeObject(): JsonRecord | null {
    const recipe = this.record['recipe'];
    if (this.isObject(recipe)) return recipe;
    const recipes = this.record['recipes'];
    if (Array.isArray(recipes) && this.isObject(recipes[0])) return recipes[0];
    return null;
  }

  private summarizeRequirements(value: unknown): string[] {
    if (!Array.isArray(value)) return [];
    return value.map((item) => {
      if (typeof item === 'string') return item;
      if (!this.isObject(item)) return JSON.stringify(item);
      const itemId = this.asText(item['itemId'] ?? item['requiredItem'] ?? item['name']);
      const property = this.asText(item['propertyId'] ?? item['requiredProperty']);
      const tags = this.asText(item['tags'] ?? item['requiredTags']);
      const parts = [itemId, property && `prop:${property}`, tags && `tags:${tags}`].filter(
        Boolean,
      );
      return parts.join(' · ') || JSON.stringify(item);
    });
  }

  private formatPropValue(value: unknown): string {
    if (value == null) return '—';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  }

  private isObject(value: unknown): value is JsonRecord {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }

  private asText(value: unknown): string {
    return typeof value === 'string' ? value : '';
  }

  private asStringArray(value: unknown): string[] {
    if (!Array.isArray(value)) return [];
    return value.filter((v): v is string => typeof v === 'string');
  }
}
