import { DecimalPipe } from '@angular/common';
import { Component, Input, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { JsonRecord } from '../../models/catalog.models';
import { CatalogService } from '../../services/catalog.service';

interface PropertyRow {
  propertyId: string;
  name: string;
  valueType: string;
  valueDisplay: string;
  rangeDisplay: string;
  ratio: number | null;
  isVisibleToPlayer: boolean;
  isStatic: boolean;
}

@Component({
  selector: 'app-material-presentation',
  standalone: true,
  imports: [DecimalPipe, MatIconModule, MatTooltipModule],
  template: `
    @if (record) {
      <div class="presentation">
        <div class="meta-line">
          @if (category) {
            <span><mat-icon>category</mat-icon> {{ category }}</span>
          }
          @if (tier) {
            <span><mat-icon>signal_cellular_alt</mat-icon> Tier {{ tier }}</span>
          }
          @if (sourceLabel) {
            <span><mat-icon>source</mat-icon> {{ sourceLabel }}</span>
          }
          <span><mat-icon>science</mat-icon> {{ properties.length }} properties</span>
        </div>

        @if (irlInspo || gameName) {
          <section class="panel">
            <div class="section-title">
              <mat-icon>translate</mat-icon>
              <h3>Naming</h3>
            </div>
            <div class="framing">
              @if (gameName) {
                <div>
                  <span class="label">Game name</span>
                  <strong>{{ gameName }}</strong>
                </div>
              }
              @if (irlInspo) {
                <div>
                  <span class="label">IRL inspiration</span>
                  <strong>{{ irlInspo }}</strong>
                </div>
              }
            </div>
          </section>
        }

        @if (properties.length) {
          <section class="panel">
            <div class="section-title">
              <mat-icon>tune</mat-icon>
              <h3>Property bindings</h3>
            </div>
            <p class="hint">
              ItemPropertyValue-style rows: typed values with optional clamps and visibility flags.
            </p>
            <div class="prop-table">
              <div class="prop-head">
                <span>Property</span>
                <span>Type</span>
                <span>Value</span>
                <span>Range / ladder</span>
                <span>Ratio</span>
              </div>
              @for (prop of properties; track prop.propertyId) {
                <div class="prop-row" [class.hidden-prop]="!prop.isVisibleToPlayer">
                  <span class="name">
                    {{ prop.name }}
                    @if (prop.isStatic) {
                      <mat-icon matTooltip="Static / read-only authored value">lock</mat-icon>
                    }
                    @if (!prop.isVisibleToPlayer) {
                      <mat-icon matTooltip="Not visible to player">visibility_off</mat-icon>
                    }
                  </span>
                  <span class="type">{{ prop.valueType }}</span>
                  <span class="value">{{ prop.valueDisplay }}</span>
                  <span class="range">{{ prop.rangeDisplay }}</span>
                  <span class="ratio">
                    @if (prop.ratio !== null) {
                      <span class="bar" [style.--p]="prop.ratio"></span>
                      {{ (prop.ratio * 100) | number: '1.0-0' }}%
                    } @else {
                      —
                    }
                  </span>
                </div>
              }
            </div>
          </section>
        }

        @if (uses.length) {
          <section class="panel">
            <div class="section-title">
              <mat-icon>handyman</mat-icon>
              <h3>Uses</h3>
            </div>
            <div class="chip-row">
              @for (use of uses; track use) {
                <span>{{ use }}</span>
              }
            </div>
          </section>
        }

        @if (linkedSkills.length) {
          <section class="panel">
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
          </section>
        }

        @if (gatherMethods.length || biomes.length) {
          <section class="split">
            @if (gatherMethods.length) {
              <div class="panel">
                <div class="section-title">
                  <mat-icon>hiking</mat-icon>
                  <h3>Gather methods</h3>
                </div>
                <div class="chip-row">
                  @for (method of gatherMethods; track method) {
                    <span>{{ method }}</span>
                  }
                </div>
              </div>
            }
            @if (biomes.length) {
              <div class="panel">
                <div class="section-title">
                  <mat-icon>public</mat-icon>
                  <h3>Biomes</h3>
                </div>
                <div class="chip-row">
                  @for (biome of biomes; track biome) {
                    <span>{{ biome }}</span>
                  }
                </div>
              </div>
            }
          </section>
        }

        @if (linkedSystems.length) {
          <section class="panel">
            <div class="section-title">
              <mat-icon>device_hub</mat-icon>
              <h3>Linked systems</h3>
            </div>
            <div class="chip-row">
              @for (system of linkedSystems; track system) {
                <span>{{ system }}</span>
              }
            </div>
          </section>
        }

        @if (preferenceNotes || notes) {
          <section class="panel">
            <div class="section-title">
              <mat-icon>notes</mat-icon>
              <h3>Notes</h3>
            </div>
            @if (preferenceNotes) {
              <p><strong>Preferences:</strong> {{ preferenceNotes }}</p>
            }
            @if (notes) {
              <p>{{ notes }}</p>
            }
          </section>
        }

        @if (definitionCount) {
          <section class="panel subtle">
            <div class="section-title">
              <mat-icon>menu_book</mat-icon>
              <h3>Dataset schema</h3>
            </div>
            <p>
              This dataset defines <strong>{{ definitionCount }}</strong> shared property
              definitions (ItemProperty pool). Bindings above reference those ids.
            </p>
          </section>
        }
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

    .hint,
    .panel p {
      margin: 0 0 0.55rem;
      font-size: 0.84rem;
      line-height: 1.45;
      color: var(--tb-muted);
    }

    .prop-table {
      display: grid;
      gap: 0.35rem;
      font-size: 0.84rem;
    }

    .prop-head,
    .prop-row {
      display: grid;
      grid-template-columns: minmax(7rem, 1.3fr) 0.7fr 0.8fr 1fr 0.9fr;
      gap: 0.5rem;
      align-items: center;
    }

    .prop-head {
      font-size: 0.72rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--tb-muted);
      font-weight: 700;
      padding-bottom: 0.25rem;
      border-bottom: 1px solid color-mix(in srgb, var(--tb-ink) 10%, transparent);
    }

    .prop-row {
      padding: 0.35rem 0;
      border-bottom: 1px solid color-mix(in srgb, var(--tb-ink) 6%, transparent);
    }

    .prop-row.hidden-prop {
      opacity: 0.55;
    }

    .name {
      display: inline-flex;
      align-items: center;
      gap: 0.2rem;
      font-weight: 600;
    }

    .name mat-icon {
      font-size: 0.95rem;
      width: 0.95rem;
      height: 0.95rem;
      color: var(--tb-muted);
    }

    .type {
      color: var(--tb-accent-strong);
      font-size: 0.78rem;
      font-weight: 700;
      text-transform: uppercase;
    }

    .ratio {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      color: var(--tb-muted);
      font-size: 0.78rem;
    }

    .bar {
      width: 4rem;
      height: 0.45rem;
      border-radius: 999px;
      background: color-mix(in srgb, var(--tb-ink) 12%, transparent);
      position: relative;
      overflow: hidden;
    }

    .bar::after {
      content: '';
      position: absolute;
      inset: 0;
      width: calc(var(--p) * 100%);
      background: var(--tb-accent-strong);
    }

    .framing {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.75rem;
    }

    .framing .label {
      display: block;
      font-size: 0.72rem;
      text-transform: uppercase;
      letter-spacing: 0.06em;
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

    @media (max-width: 900px) {
      .prop-head,
      .prop-row {
        grid-template-columns: 1fr 1fr;
      }

      .prop-head span:nth-child(n + 3),
      .prop-row span:nth-child(n + 3) {
        grid-column: 1 / -1;
      }

      .split {
        grid-template-columns: 1fr;
      }
    }
  `,
})
export class MaterialPresentationComponent {
  private readonly catalog = inject(CatalogService);

  @Input({ required: true }) record!: JsonRecord;

  get category(): string {
    return this.asText(this.record['category']);
  }

  get tier(): string {
    return this.asText(this.record['tier']);
  }

  get gameName(): string {
    return this.asText(this.record['gameName']);
  }

  get irlInspo(): string {
    return this.asText(this.record['irlInspo']);
  }

  get uses(): string[] {
    return this.asStringArray(this.record['uses']);
  }

  get sourceLabel(): string {
    return this.asText(this.record['source']);
  }

  get notes(): string {
    return this.asText(this.record['notes']);
  }

  get preferenceNotes(): string {
    return this.asText(this.record['preferenceNotes']);
  }

  get linkedSkills(): string[] {
    return this.asStringArray(this.record['linkedSkills']);
  }

  get linkedSystems(): string[] {
    return this.asStringArray(this.record['linkedSystems']);
  }

  get gatherMethods(): string[] {
    return this.asStringArray(this.record['gatherMethods']);
  }

  get biomes(): string[] {
    return this.asStringArray(this.record['biomes']);
  }

  get definitionCount(): number {
    const defs = this.catalog.activeDataset()?.extras?.['propertyDefinitions'];
    return Array.isArray(defs) ? defs.length : this.properties.length;
  }

  get properties(): PropertyRow[] {
    const raw = this.record['properties'];
    if (!Array.isArray(raw)) return [];
    return raw
      .filter((item): item is JsonRecord => this.isObject(item))
      .map((item) => this.toPropertyRow(item));
  }

  openSkill(skillId: string): void {
    const skills = this.catalog.loadedDatasets()['skills'];
    if (!skills) {
      void this.catalog.selectDataset('skills').then(() => this.catalog.selectRecord(skillId));
      return;
    }
    void this.catalog.selectDataset('skills').then(() => this.catalog.selectRecord(skillId));
  }

  private toPropertyRow(item: JsonRecord): PropertyRow {
    const valueType = this.asText(item['valueType']) || 'Float';
    const value = item['value'];
    const min = typeof item['min'] === 'number' ? item['min'] : null;
    const max = typeof item['max'] === 'number' ? item['max'] : null;
    const enumOptions = this.asStringArray(item['enumOptions']);

    let valueDisplay = '—';
    let rangeDisplay = '—';
    let ratio: number | null = null;

    if (valueType === 'Enum') {
      valueDisplay = typeof value === 'string' ? value : String(value ?? '—');
      rangeDisplay = enumOptions.length ? enumOptions.join(' → ') : 'enum';
      if (typeof value === 'string' && enumOptions.length) {
        const idx = enumOptions.indexOf(value);
        if (idx >= 0) ratio = enumOptions.length <= 1 ? 1 : idx / (enumOptions.length - 1);
      }
    } else if (typeof value === 'number') {
      valueDisplay = String(value);
      if (min !== null && max !== null) {
        rangeDisplay = `${min}–${max}`;
        ratio = max === min ? 0 : Math.min(1, Math.max(0, (value - min) / (max - min)));
      }
    } else if (typeof value === 'string') {
      valueDisplay = value;
    }

    return {
      propertyId: this.asText(item['propertyId']) || this.asText(item['name']) || 'property',
      name: this.asText(item['name']) || this.asText(item['propertyId']) || 'Property',
      valueType,
      valueDisplay,
      rangeDisplay,
      ratio,
      isVisibleToPlayer: item['isVisibleToPlayer'] !== false,
      isStatic: item['isStatic'] === true,
    };
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
