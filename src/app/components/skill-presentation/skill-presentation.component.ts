import { Component, Input, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { JsonRecord, JsonValue } from '../../models/catalog.models';
import { CatalogService } from '../../services/catalog.service';

interface SubskillView {
  id: string;
  name: string;
  description: string;
}

interface RelatedSkillView {
  id: string;
  name: string;
  kind: string;
  description: string;
  exists: boolean;
}

interface GridNodeView {
  id: string;
  name: string;
  type: string;
  description: string;
}

@Component({
  selector: 'app-skill-presentation',
  standalone: true,
  imports: [MatIconModule, MatTooltipModule],
  template: `
    @if (record) {
      <div class="presentation">
        @if (role || sourceLabel || activation) {
          <div class="meta-line">
            @if (role) {
              <span><mat-icon>badge</mat-icon> {{ role }}</span>
            }
            @if (sourceLabel) {
              <span><mat-icon>source</mat-icon> {{ sourceLabel }}</span>
            }
            @if (activation) {
              <span><mat-icon>tune</mat-icon> {{ activation }}</span>
            }
          </div>
        }

        @if (subskills.length) {
          <section class="panel">
            <div class="section-title">
              <mat-icon>account_tree</mat-icon>
              <h3>Subskills</h3>
              <span class="count">{{ subskills.length }}</span>
            </div>
            <div class="subskill-list">
              @for (sub of subskills; track sub.id) {
                <article class="subskill">
                  <div>
                    <strong>{{ sub.name }}</strong>
                    <p>{{ sub.description }}</p>
                  </div>
                </article>
              }
            </div>
          </section>
        }

        @if (relatedSkills.length) {
          <section class="panel">
            <div class="section-title">
              <mat-icon>share</mat-icon>
              <h3>{{ relatedSectionTitle }}</h3>
            </div>
            <div class="related-list">
              @for (rel of relatedSkills; track rel.id) {
                <button
                  type="button"
                  class="related"
                  [disabled]="!rel.exists"
                  [matTooltip]="rel.exists ? 'Open ' + rel.name : 'Missing record: ' + rel.id"
                  (click)="openRelated(rel)"
                >
                  <span class="related-kind">{{ rel.kind }}</span>
                  <strong>{{ rel.name }}</strong>
                  <span class="related-desc">{{ rel.description }}</span>
                  <mat-icon>chevron_right</mat-icon>
                </button>
              }
            </div>
          </section>
        }

        @if (gridNodes.length) {
          <section class="panel">
            <div class="section-title">
              <mat-icon>hub</mat-icon>
              <h3>Possible grid nodes</h3>
              <span class="count">{{ gridNodes.length }}</span>
            </div>
            <p class="hint">
              Workshop ideas for a future sphere-grid JSON — not layout or shapes yet.
            </p>
            <div class="node-list">
              @for (node of gridNodes; track node.id) {
                <article class="node" [attr.data-type]="node.type">
                  <div class="node-top">
                    <strong>{{ node.name }}</strong>
                    <span class="node-type">{{ node.type }}</span>
                  </div>
                  <p>{{ node.description }}</p>
                </article>
              }
            </div>
          </section>
        }

        @if (skillTypes) {
          <section class="split">
            <div class="panel">
              <div class="section-title">
                <mat-icon>visibility</mat-icon>
                <h3>Passive</h3>
              </div>
              <ul>
                @for (item of skillTypes.passive; track item) {
                  <li>{{ item }}</li>
                } @empty {
                  <li class="empty-li">None listed</li>
                }
              </ul>
            </div>
            <div class="panel">
              <div class="section-title">
                <mat-icon>bolt</mat-icon>
                <h3>Active</h3>
              </div>
              <ul>
                @for (item of skillTypes.active; track item) {
                  <li>{{ item }}</li>
                } @empty {
                  <li class="empty-li">None listed</li>
                }
              </ul>
            </div>
          </section>
        }

        @if (influences) {
          <section class="split">
            <div class="panel influence ot">
              <div class="section-title">
                <mat-icon>landscape</mat-icon>
                <h3>Oregon Trail</h3>
              </div>
              <p>{{ otLens }}</p>
              <ul>
                @for (beat of otBeats; track beat) {
                  <li>{{ beat }}</li>
                }
              </ul>
            </div>
            <div class="panel influence dnd">
              <div class="section-title">
                <mat-icon>casino</mat-icon>
                <h3>D&amp;D 5e</h3>
              </div>
              <p>{{ dndLens }}</p>
              @if (dndAbilities.length) {
                <div class="ability-row">
                  @for (ability of dndAbilities; track ability) {
                    <span>{{ ability }}</span>
                  }
                </div>
              }
              <ul>
                @for (beat of dndBeats; track beat) {
                  <li>{{ beat }}</li>
                }
              </ul>
            </div>
          </section>
        }

        @if (commonFraming) {
          <section class="panel">
            <div class="section-title">
              <mat-icon>menu_book</mat-icon>
              <h3>Framing</h3>
            </div>
            <div class="framing">
              @if (commonFraming.dndAbility) {
                <div>
                  <span class="label">5e ability</span>
                  <strong>{{ commonFraming.dndAbility }}</strong>
                </div>
              }
              @if (commonFraming.dndSkillAnalog) {
                <div>
                  <span class="label">5e analog</span>
                  <strong>{{ commonFraming.dndSkillAnalog }}</strong>
                </div>
              }
            </div>
            @if (commonFraming.oregonTrailNote) {
              <p>{{ commonFraming.oregonTrailNote }}</p>
            }
          </section>
        }

        @if (linkedSystems.length) {
          <section class="panel">
            <div class="section-title">
              <mat-icon>device_hub</mat-icon>
              <h3>Linked systems</h3>
            </div>
            <div class="system-row">
              @for (system of linkedSystems; track system) {
                <span>{{ system }}</span>
              }
            </div>
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

    .section-title {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      margin-bottom: 0.55rem;
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

    .hint {
      margin: -0.15rem 0 0.65rem;
      font-size: 0.82rem;
      color: var(--tb-muted);
    }

    .subskill-list,
    .related-list,
    .node-list {
      display: grid;
      gap: 0.55rem;
    }

    .subskill {
      padding: 0.55rem 0.15rem;
      border-top: 1px solid color-mix(in srgb, var(--tb-ink) 8%, transparent);
    }

    .subskill:first-child {
      border-top: 0;
      padding-top: 0;
    }

    .subskill p,
    .node p {
      margin: 0.25rem 0 0;
      font-size: 0.86rem;
      line-height: 1.4;
      color: color-mix(in srgb, var(--tb-ink) 82%, transparent);
    }

    .node {
      padding: 0.55rem 0.65rem;
      border-radius: 10px;
      border: 1px solid color-mix(in srgb, var(--tb-ink) 10%, transparent);
      background: color-mix(in srgb, var(--tb-bg) 45%, transparent);
    }

    .node-top {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .node-type {
      font-size: 0.7rem;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--tb-accent-strong);
      font-weight: 700;
    }

    .node[data-type='passive'] {
      border-color: color-mix(in srgb, #7eb8a0 35%, transparent);
    }

    .node[data-type='active'] {
      border-color: color-mix(in srgb, var(--tb-accent) 40%, transparent);
    }

    .node[data-type='branch'] {
      border-color: color-mix(in srgb, #6b8cae 40%, transparent);
    }

    .related {
      display: grid;
      grid-template-columns: auto 1fr auto;
      grid-template-areas:
        'kind title chevron'
        'kind desc chevron';
      gap: 0.1rem 0.65rem;
      text-align: left;
      border: 1px solid color-mix(in srgb, var(--tb-ink) 10%, transparent);
      background: color-mix(in srgb, var(--tb-bg) 55%, transparent);
      color: inherit;
      border-radius: 10px;
      padding: 0.55rem 0.65rem;
      cursor: pointer;
      font: inherit;
    }

    .related:hover:not(:disabled) {
      border-color: var(--tb-accent-strong);
    }

    .related:disabled {
      opacity: 0.55;
      cursor: not-allowed;
    }

    .related-kind {
      grid-area: kind;
      align-self: center;
      writing-mode: vertical-rl;
      transform: rotate(180deg);
      font-size: 0.65rem;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--tb-accent-strong);
      font-weight: 700;
    }

    .related strong {
      grid-area: title;
    }

    .related-desc {
      grid-area: desc;
      font-size: 0.8rem;
      color: var(--tb-muted);
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .related mat-icon {
      grid-area: chevron;
      align-self: center;
      color: var(--tb-muted);
    }

    .split {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.75rem;
    }

    .panel ul {
      margin: 0;
      padding-left: 1.1rem;
      font-size: 0.86rem;
      line-height: 1.4;
    }

    .panel li + li {
      margin-top: 0.28rem;
    }

    .panel p {
      margin: 0 0 0.45rem;
      font-size: 0.88rem;
      line-height: 1.45;
    }

    .empty-li {
      color: var(--tb-muted);
      list-style: none;
      margin-left: -1.1rem;
    }

    .influence.ot {
      border-color: color-mix(in srgb, #c47a3a 35%, transparent);
    }

    .influence.dnd {
      border-color: color-mix(in srgb, #6b8cae 40%, transparent);
    }

    .ability-row,
    .system-row {
      display: flex;
      flex-wrap: wrap;
      gap: 0.35rem;
    }

    .ability-row {
      margin-bottom: 0.45rem;
    }

    .ability-row span,
    .system-row span {
      font-size: 0.78rem;
      padding: 0.2rem 0.5rem;
      border-radius: 999px;
      background: color-mix(in srgb, var(--tb-ink) 8%, transparent);
    }

    .framing {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.75rem;
      margin-bottom: 0.4rem;
    }

    .framing .label {
      display: block;
      font-size: 0.72rem;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--tb-muted);
    }

    @media (max-width: 900px) {
      .split,
      .framing {
        grid-template-columns: 1fr;
      }
    }
  `,
})
export class SkillPresentationComponent {
  private readonly catalog = inject(CatalogService);

  @Input({ required: true }) record!: JsonRecord;

  get role(): string {
    return this.asText(this.record['role']);
  }

  get sourceLabel(): string {
    return this.asText(this.record['source']);
  }

  get activation(): string {
    return this.asText(this.record['activation']);
  }

  get subskills(): SubskillView[] {
    const raw = this.record['subskills'];
    if (!Array.isArray(raw)) return [];
    return raw
      .filter((item): item is JsonRecord => this.isObject(item))
      .map((item, index) => {
        const id = this.asText(item['id']) || `sub-${index}`;
        return {
          id,
          name: this.asText(item['name']) || id,
          description: this.asText(item['description']),
        };
      });
  }

  get relatedSectionTitle(): string {
    return this.asStringArray(this.record['commonSkillIds']).length
      ? 'Common skills'
      : 'Used by professions';
  }

  get relatedSkills(): RelatedSkillView[] {
    const commonIds = this.asStringArray(this.record['commonSkillIds']);
    const usedBy = this.asStringArray(this.record['usedBy']);
    if (commonIds.length) return this.resolveRelated(commonIds, 'common');
    if (usedBy.length) return this.resolveRelated(usedBy, 'profession');
    return [];
  }

  get gridNodes(): GridNodeView[] {
    const raw = this.record['possibleGridNodes'];
    if (!Array.isArray(raw)) return [];
    return raw
      .filter((item): item is JsonRecord => this.isObject(item))
      .map((item, index) => ({
        id: this.asText(item['id']) || `node-${index}`,
        name: this.asText(item['name']) || this.asText(item['id']) || `Node ${index + 1}`,
        type: this.asText(item['type']) || 'idea',
        description: this.asText(item['description']),
      }));
  }

  get skillTypes(): { passive: string[]; active: string[] } | null {
    const value = this.asObject(this.record['skillTypes']);
    if (!value) return null;
    return {
      passive: this.asStringArray(value['passive']),
      active: this.asStringArray(value['active']),
    };
  }

  get influences(): Record<string, JsonValue> | null {
    return this.asObject(this.record['influences']);
  }

  get otLens(): string {
    const ot = this.asObject(this.influences?.['oregonTrail']);
    return this.asText(ot?.['lens']) || this.asText(this.influences?.['oregonTrail']);
  }

  get otBeats(): string[] {
    return this.asStringArray(this.asObject(this.influences?.['oregonTrail'])?.['beats']);
  }

  get dndLens(): string {
    const dnd = this.asObject(this.influences?.['dnd5e']);
    return this.asText(dnd?.['lens']) || this.asText(this.influences?.['dnd5e']);
  }

  get dndBeats(): string[] {
    return this.asStringArray(this.asObject(this.influences?.['dnd5e'])?.['beats']);
  }

  get dndAbilities(): string[] {
    return this.asStringArray(this.asObject(this.influences?.['dnd5e'])?.['abilityAnchors']);
  }

  get commonFraming(): {
    dndAbility?: string;
    dndSkillAnalog?: string;
    oregonTrailNote?: string;
  } | null {
    if (this.record['kind'] !== 'common') return null;
    return {
      dndAbility: this.asText(this.record['dndAbility']) || undefined,
      dndSkillAnalog: this.asText(this.record['dndSkillAnalog']) || undefined,
      oregonTrailNote: this.asText(this.record['oregonTrailNote']) || undefined,
    };
  }

  get linkedSystems(): string[] {
    return this.asStringArray(this.record['linkedSystems']);
  }

  openRelated(rel: RelatedSkillView): void {
    if (!rel.exists) return;
    this.catalog.selectRecord(rel.id);
  }

  private resolveRelated(ids: string[], fallbackKind: string): RelatedSkillView[] {
    const dataset = this.catalog.activeDataset();
    if (!dataset) return [];
    return ids.map((id) => {
      const match = dataset.records.find((r) => this.catalog.getRecordId(r) === id);
      if (!match) {
        return {
          id,
          name: id,
          kind: fallbackKind,
          description: 'Record not found in dataset',
          exists: false,
        };
      }
      return {
        id,
        name: this.catalog.getRecordTitle(match),
        kind: this.asText(match['kind']) || fallbackKind,
        description: this.catalog.getRecordDescription(match),
        exists: true,
      };
    });
  }

  private isObject(value: unknown): value is JsonRecord {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }

  private asObject(value: unknown): Record<string, JsonValue> | null {
    return this.isObject(value) ? value : null;
  }

  private asText(value: unknown): string {
    return typeof value === 'string' ? value : '';
  }

  private asStringArray(value: unknown): string[] {
    if (!Array.isArray(value)) return [];
    return value.filter((v): v is string => typeof v === 'string');
  }
}
