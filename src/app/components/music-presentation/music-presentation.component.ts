import { Component, Input, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { JsonRecord } from '../../models/catalog.models';
import { MusicPlayerService } from '../../services/music-player.service';
import { CatalogService } from '../../services/catalog.service';
import { resolveMusicAudioUrl } from '../../utils/music-audio';

@Component({
  selector: 'app-music-presentation',
  standalone: true,
  imports: [MatIconModule, MatButtonModule, MatTooltipModule],
  template: `
    @if (record) {
      <div class="presentation">
        @if (audioUrl) {
          <div class="player" [class.playing]="isPlaying">
            <button
              mat-mini-fab
              type="button"
              class="play-btn"
              (click)="onPlay()"
              [matTooltip]="isPlaying ? 'Pause' : 'Play'"
              [attr.aria-label]="isPlaying ? 'Pause' : 'Play'"
            >
              <mat-icon>{{ isPlaying ? 'pause' : 'play_arrow' }}</mat-icon>
            </button>

            <div class="meta">
              <div class="track-title">{{ trackTitle }}</div>
              <div class="times">
                <span>{{ player.formatTime(displayCurrent) }}</span>
                <span class="sep">/</span>
                <span>{{ player.formatTime(displayDuration) }}</span>
              </div>
            </div>

            <input
              class="scrub"
              type="range"
              min="0"
              [max]="displayDuration || 0"
              step="0.1"
              [value]="displayCurrent"
              (input)="onScrub($event)"
              [disabled]="!isCurrent || !displayDuration"
              aria-label="Seek"
            />
          </div>
        } @else {
          <div class="empty-player">
            <mat-icon>music_off</mat-icon>
            <span>No audio asset</span>
          </div>
        }

        <div class="meta-line">
          @if (kind) {
            <span><mat-icon>music_note</mat-icon> {{ kind }}</span>
          }
          @if (mood) {
            <span><mat-icon>spa</mat-icon> {{ mood }}</span>
          }
          @if (durationHint) {
            <span><mat-icon>schedule</mat-icon> {{ durationHint }}</span>
          }
        </div>

        @if (usage.length) {
          <section class="panel">
            <div class="section-title">
              <mat-icon>place</mat-icon>
              <h3>Usage</h3>
            </div>
            <div class="chip-row">
              @for (item of usage; track item) {
                <span>{{ item }}</span>
              }
            </div>
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

    .player {
      display: grid;
      grid-template-columns: auto minmax(0, 1fr);
      grid-template-areas:
        'play meta'
        'scrub scrub';
      gap: 0.45rem 0.65rem;
      align-items: center;
      padding: 0.75rem 0.85rem;
      border-radius: 12px;
      background: var(--tb-card);
      border: 1px solid color-mix(in srgb, var(--tb-ink) 10%, transparent);
    }

    .play-btn {
      grid-area: play;
      background: var(--tb-accent-strong) !important;
      color: #fff !important;
      box-shadow: none !important;
    }

    .meta {
      grid-area: meta;
      min-width: 0;
    }

    .track-title {
      font-size: 0.92rem;
      font-weight: 600;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .times {
      font-size: 0.75rem;
      color: var(--tb-muted);
      font-variant-numeric: tabular-nums;
    }

    .sep { margin: 0 0.2rem; opacity: 0.6; }

    .scrub {
      grid-area: scrub;
      width: 100%;
      accent-color: var(--tb-accent-strong);
      cursor: pointer;
    }

    .empty-player {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.85rem;
      border-radius: 12px;
      color: var(--tb-muted);
      background: var(--tb-card);
      border: 1px dashed color-mix(in srgb, var(--tb-ink) 14%, transparent);
      font-size: 0.88rem;
    }

    .empty-player mat-icon {
      font-size: 1.2rem;
      width: 1.2rem;
      height: 1.2rem;
    }

    @media (min-width: 720px) {
      .player {
        grid-template-columns: auto minmax(7rem, 12rem) minmax(0, 1fr);
        grid-template-areas: 'play meta scrub';
      }
    }

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
    .panel p {
      margin: 0; font-size: 0.84rem; line-height: 1.45; color: var(--tb-muted);
    }
    .chip-row { display: flex; flex-wrap: wrap; gap: 0.35rem; }
    .chip-row span {
      font-size: 0.78rem; padding: 0.25rem 0.55rem; border-radius: 999px;
      background: color-mix(in srgb, var(--tb-ink) 8%, transparent);
    }
    .kv-list { display: grid; gap: 0.4rem; }
    .kv .label {
      display: block; font-size: 0.72rem; text-transform: uppercase;
      letter-spacing: 0.06em; color: var(--tb-muted);
    }
    .kv strong { font-size: 0.84rem; font-weight: 600; }
  `,
})
export class MusicPresentationComponent {
  @Input({ required: true }) record!: JsonRecord;

  readonly player = inject(MusicPlayerService);
  private readonly catalog = inject(CatalogService);

  private readonly knownKeys = new Set([
    'id', 'name', 'description', 'tags', 'kind', 'audioUrl', 'audio', 'src',
    'mood', 'usage', 'durationHint', 'notes', 'source', 'composer', 'file',
  ]);

  get audioUrl(): string | null {
    return resolveMusicAudioUrl(this.record);
  }

  get trackTitle(): string {
    return this.asText(this.record['name']);
  }

  get recordId(): string {
    return this.catalog.getRecordId(this.record);
  }

  get isCurrent(): boolean {
    return this.player.isCurrent(this.recordId);
  }

  get isPlaying(): boolean {
    return this.player.isPlayingRecord(this.recordId);
  }

  get displayCurrent(): number {
    return this.isCurrent ? this.player.currentTime() : 0;
  }

  get displayDuration(): number {
    return this.isCurrent ? this.player.duration() : 0;
  }

  get kind(): string {
    return this.asText(this.record['kind']);
  }

  get mood(): string {
    return this.asText(this.record['mood']);
  }

  get durationHint(): string {
    return this.asText(this.record['durationHint']);
  }

  get usage(): string[] {
    return this.asStringArray(this.record['usage']);
  }

  get notes(): string {
    return this.asText(this.record['notes']);
  }

  get extraKeys(): string[] {
    return Object.keys(this.record).filter((key) => !this.knownKeys.has(key));
  }

  onPlay(): void {
    this.player.playOrToggle(this.record);
  }

  onScrub(event: Event): void {
    if (!this.isCurrent) return;
    const value = Number((event.target as HTMLInputElement).value);
    this.player.seek(value);
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
