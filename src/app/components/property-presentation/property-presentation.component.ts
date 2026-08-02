import { Component, Input, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { JsonRecord } from '../../models/catalog.models';
import { CatalogService } from '../../services/catalog.service';

@Component({
  selector: 'app-property-presentation',
  standalone: true,
  imports: [MatIconModule, MatTooltipModule],
  template: `
    @if (record) {
      <div class="presentation">
        <div class="meta-line">
          <span><mat-icon>data_object</mat-icon> {{ valueType }}</span>
          @if (sourceLabel) {
            <span><mat-icon>source</mat-icon> {{ sourceLabel }}</span>
          }
          <span><mat-icon>link</mat-icon> {{ usedByCount }} materials</span>
        </div>

        <section class="panel schema">
          <div class="section-title">
            <mat-icon>schema</mat-icon>
            <h3>Definition schema</h3>
          </div>
          <div class="schema-grid">
            <div>
              <span class="label">Value type</span>
              <strong>{{ valueType }}</strong>
            </div>
            @if (rangeDisplay) {
              <div>
                <span class="label">Range</span>
                <strong>{{ rangeDisplay }}</strong>
              </div>
            }
            <div>
              <span class="label">Player-visible default</span>
              <strong>{{ visibleDefault ? 'Yes' : 'No' }}</strong>
            </div>
            @if (color) {
              <div class="color-row">
                <span class="label">Authoring color</span>
                <span class="swatch" [style.background]="color"></span>
                <strong>{{ color }}</strong>
              </div>
            }
          </div>

          @if (enumOptions.length) {
            <div class="enum-block">
              <span class="label">Enum ladder</span>
              <div class="ladder">
                @for (opt of enumOptions; track opt; let i = $index) {
                  <span class="step">
                    <em>{{ i }}</em>
                    {{ opt }}
                    <small>{{ ladderRatio(i) }}</small>
                  </span>
                }
              </div>
            </div>
          }
        </section>

        @if (appliesTo.length) {
          <section class="panel">
            <div class="section-title">
              <mat-icon>hub</mat-icon>
              <h3>Applies to</h3>
            </div>
            <div class="chip-row">
              @for (domain of appliesTo; track domain) {
                <span>{{ domain }}</span>
              }
            </div>
          </section>
        }

        @if (ratioNotes || formulaRole) {
          <section class="split">
            @if (ratioNotes) {
              <div class="panel">
                <div class="section-title">
                  <mat-icon>percent</mat-icon>
                  <h3>Ratio behavior</h3>
                </div>
                <p>{{ ratioNotes }}</p>
              </div>
            }
            @if (formulaRole) {
              <div class="panel">
                <div class="section-title">
                  <mat-icon>functions</mat-icon>
                  <h3>Formula role</h3>
                </div>
                <p>{{ formulaRole }}</p>
              </div>
            }
          </section>
        }

        @if (effectHooks.length) {
          <section class="panel">
            <div class="section-title">
              <mat-icon>auto_fix</mat-icon>
              <h3>Effect hooks</h3>
            </div>
            <ul>
              @for (hook of effectHooks; track hook) {
                <li>{{ hook }}</li>
              }
            </ul>
          </section>
        }

        @if (usedByMaterials.length) {
          <section class="panel">
            <div class="section-title">
              <mat-icon>category</mat-icon>
              <h3>Used by materials</h3>
              <span class="count">{{ usedByMaterials.length }}</span>
            </div>
            <div class="chip-row">
              @for (matId of usedByMaterials; track matId) {
                <button type="button" class="link-chip" (click)="openMaterial(matId)">
                  {{ matId }}
                  <mat-icon>north_east</mat-icon>
                </button>
              }
            </div>
          </section>
        }

        @if (sourceColumn || notes) {
          <section class="panel">
            <div class="section-title">
              <mat-icon>notes</mat-icon>
              <h3>Notes</h3>
            </div>
            @if (sourceColumn) {
              <p><strong>Sheet column:</strong> {{ sourceColumn }}</p>
            }
            @if (notes) {
              <p>{{ notes }}</p>
            }
          </section>
        }

        <section class="panel subtle">
          <div class="section-title">
            <mat-icon>integration_instructions</mat-icon>
            <h3>Engine mapping</h3>
          </div>
          <p>
            Maps to ChainLink <strong>ItemProperty</strong> (definition) with runtime
            <strong>ItemPropertyValue</strong> bindings on materials/items via
            <strong>IHaveProperties</strong>.
          </p>
        </section>
      </div>
    }
  `,
  styles: `
    .presentation {
      display: grid;
      gap: 0.75rem;
    }

    .meta-line {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
      color: var(--tb-muted);
      font-size: 0.84rem;
    }

    .meta-line span {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
    }

    .meta-line mat-icon {
      font-size: 1rem;
      width: 1rem;
      height: 1rem;
    }

    .panel {
      background: var(--tb-card);
      border: 1px solid color-mix(in srgb, var(--tb-ink) 10%, transparent);
      border-radius: 12px;
      padding: 0.8rem 0.9rem;
    }

    .panel.subtle {
      opacity: 0.92;
    }

    .section-title {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      margin-bottom: 0.45rem;
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

    .count {
      margin-left: auto;
      font-size: 0.75rem;
      color: var(--tb-muted);
    }

    .schema-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 0.75rem;
      margin-bottom: 0.5rem;
    }

    .label {
      display: block;
      font-size: 0.72rem;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--tb-muted);
      margin-bottom: 0.15rem;
    }

    .color-row {
      display: grid;
      grid-template-columns: auto auto 1fr;
      gap: 0.4rem;
      align-items: center;
    }

    .color-row .label {
      grid-column: 1 / -1;
    }

    .swatch {
      width: 1rem;
      height: 1rem;
      border-radius: 4px;
      border: 1px solid color-mix(in srgb, var(--tb-ink) 20%, transparent);
    }

    .enum-block {
      margin-top: 0.5rem;
    }

    .ladder {
      display: flex;
      flex-wrap: wrap;
      gap: 0.35rem;
      margin-top: 0.35rem;
    }

    .step {
      display: inline-flex;
      align-items: center;
      gap: 0.3rem;
      padding: 0.25rem 0.5rem;
      border-radius: 999px;
      background: color-mix(in srgb, var(--tb-accent) 14%, transparent);
      font-size: 0.8rem;
    }

    .step em {
      font-style: normal;
      font-weight: 700;
      color: var(--tb-accent-strong);
      font-size: 0.72rem;
    }

    .step small {
      color: var(--tb-muted);
    }

    .chip-row {
      display: flex;
      flex-wrap: wrap;
      gap: 0.35rem;
    }

    .chip-row span,
    .link-chip {
      font-size: 0.78rem;
      padding: 0.25rem 0.55rem;
      border-radius: 999px;
      background: color-mix(in srgb, var(--tb-ink) 8%, transparent);
    }

    .link-chip {
      border: 1px solid color-mix(in srgb, var(--tb-ink) 12%, transparent);
      color: inherit;
      font: inherit;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.15rem;
    }

    .link-chip:hover {
      border-color: var(--tb-accent-strong);
    }

    .link-chip mat-icon {
      font-size: 0.9rem;
      width: 0.9rem;
      height: 0.9rem;
    }

    .split {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.75rem;
    }

    .panel p,
    .panel ul {
      margin: 0;
      font-size: 0.86rem;
      line-height: 1.45;
      color: color-mix(in srgb, var(--tb-ink) 85%, transparent);
    }

    .panel ul {
      padding-left: 1.1rem;
    }

    .panel li + li {
      margin-top: 0.25rem;
    }

    @media (max-width: 900px) {
      .schema-grid,
      .split {
        grid-template-columns: 1fr;
      }
    }
  `,
})
export class PropertyPresentationComponent {
  private readonly catalog = inject(CatalogService);

  @Input({ required: true }) record!: JsonRecord;

  get valueType(): string {
    return this.asText(this.record['valueType']) || 'Unknown';
  }

  get sourceLabel(): string {
    return this.asText(this.record['source']);
  }

  get usedByCount(): number {
    const count = this.record['usedByMaterialCount'];
    return typeof count === 'number' ? count : this.usedByMaterials.length;
  }

  get rangeDisplay(): string {
    const min = this.record['min'];
    const max = this.record['max'];
    if (typeof min === 'number' && typeof max === 'number') return `${min} – ${max}`;
    return '';
  }

  get visibleDefault(): boolean {
    return this.record['isVisibleToPlayerDefault'] !== false;
  }

  get color(): string {
    return this.asText(this.record['color']);
  }

  get enumOptions(): string[] {
    return this.asStringArray(this.record['enumOptions']);
  }

  get appliesTo(): string[] {
    return this.asStringArray(this.record['appliesTo']);
  }

  get ratioNotes(): string {
    return this.asText(this.record['ratioNotes']);
  }

  get formulaRole(): string {
    return this.asText(this.record['formulaRole']);
  }

  get effectHooks(): string[] {
    return this.asStringArray(this.record['effectHooks']);
  }

  get usedByMaterials(): string[] {
    return this.asStringArray(this.record['usedByMaterials']);
  }

  get sourceColumn(): string {
    return this.asText(this.record['sourceColumn']);
  }

  get notes(): string {
    return this.asText(this.record['notes']);
  }

  ladderRatio(index: number): string {
    const count = this.enumOptions.length;
    if (count <= 1) return '100%';
    return `${Math.round((index / (count - 1)) * 100)}%`;
  }

  openMaterial(materialId: string): void {
    void this.catalog.selectDataset('materials').then(() => this.catalog.selectRecord(materialId));
  }

  private asText(value: unknown): string {
    return typeof value === 'string' ? value : '';
  }

  private asStringArray(value: unknown): string[] {
    if (!Array.isArray(value)) return [];
    return value.filter((v): v is string => typeof v === 'string');
  }
}
