import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CatalogService } from '../../services/catalog.service';
import { MusicPlayerService } from '../../services/music-player.service';
import { RecordEditsService } from '../../services/record-edits.service';

const MUSIC_DATASET_ID = 'music';

@Component({
  selector: 'app-music-mini-player',
  standalone: true,
  imports: [
    FormsModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatChipsModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatMenuModule,
    MatTooltipModule,
  ],
  template: `
    @if (player.hasTrack()) {
      <div class="mini-player" role="region" aria-label="Now playing">
        <button
          mat-icon-button
          type="button"
          class="skip-btn"
          matTooltip="Previous"
          aria-label="Previous track"
          (click)="player.previous()"
        >
          <mat-icon>skip_previous</mat-icon>
        </button>

        <button
          mat-mini-fab
          type="button"
          class="play-btn"
          [matTooltip]="player.playing() ? 'Pause' : 'Play'"
          [attr.aria-label]="player.playing() ? 'Pause' : 'Play'"
          (click)="player.toggle()"
        >
          <mat-icon>{{ player.playing() ? 'pause' : 'play_arrow' }}</mat-icon>
        </button>

        <button
          mat-icon-button
          type="button"
          class="skip-btn"
          matTooltip="Next"
          aria-label="Next track"
          (click)="player.next()"
        >
          <mat-icon>skip_next</mat-icon>
        </button>

        <div class="track">
          <div class="name" [title]="player.trackTitle()">{{ player.trackTitle() }}</div>
          <div class="times">
            {{ player.formatTime(player.currentTime()) }}
            <span class="sep">/</span>
            {{ player.formatTime(player.duration()) }}
          </div>
        </div>

        <button
          mat-icon-button
          type="button"
          class="tag-btn"
          matTooltip="Add a tag"
          aria-label="Add a tag"
          [matMenuTriggerFor]="tagMenu"
          (menuOpened)="onTagMenuOpened()"
        >
          <mat-icon>new_label</mat-icon>
        </button>

        <mat-menu
          #tagMenu="matMenu"
          panelClass="music-tag-menu-panel"
          (closed)="tagDraft.set('')"
        >
          <div
            class="tag-panel"
            (click)="$event.stopPropagation()"
            (keydown)="$event.stopPropagation()"
          >
            <div class="tag-panel-title">Tag this track</div>

            @if (currentTags().length) {
              <mat-chip-set class="tag-chips" aria-label="Current tags">
                @for (tag of currentTags(); track tag) {
                  <mat-chip>{{ tag }}</mat-chip>
                }
              </mat-chip-set>
            } @else {
              <p class="tag-empty">No tags yet — add one that fits the mood.</p>
            }

            <mat-form-field appearance="outline" class="tag-field" subscriptSizing="dynamic">
              <mat-label>Add tag</mat-label>
              <input
                matInput
                [ngModel]="tagDraft()"
                (ngModelChange)="tagDraft.set($event)"
                [matAutocomplete]="tagOptions"
                (keydown.enter)="$event.preventDefault(); submitTag()"
                placeholder="existing or new"
              />
              <mat-autocomplete
                #tagOptions="matAutocomplete"
                (optionSelected)="onTagSelected($event)"
              >
                @for (tag of filteredSuggestions(); track tag) {
                  <mat-option [value]="tag">{{ tag }}</mat-option>
                }
              </mat-autocomplete>
            </mat-form-field>

            <button
              mat-flat-button
              color="primary"
              type="button"
              class="add-tag-btn"
              [disabled]="!tagDraft().trim()"
              (click)="submitTag()"
            >
              <mat-icon>add</mat-icon>
              Add tag
            </button>
          </div>
        </mat-menu>
      </div>
    }
  `,
  styles: `
    :host {
      display: block;
      width: 100%;
    }

    :host:empty,
    :host:not(:has(.mini-player)) {
      display: none;
    }

    .mini-player {
      display: flex;
      align-items: center;
      gap: 0.1rem;
      width: 100%;
      padding: 0.45rem 0.4rem 0.45rem 0.25rem;
      border-radius: 12px;
      background: color-mix(in srgb, var(--tb-accent) 10%, var(--tb-card));
      border: 1px solid color-mix(in srgb, var(--tb-ink) 10%, transparent);
    }

    .play-btn {
      width: 2.2rem !important;
      height: 2.2rem !important;
      background: var(--tb-accent-strong) !important;
      color: #fff !important;
      box-shadow: none !important;
      flex-shrink: 0;
    }

    .play-btn mat-icon {
      font-size: 1.2rem;
      width: 1.2rem;
      height: 1.2rem;
    }

    .skip-btn,
    .tag-btn {
      color: var(--tb-muted);
      width: 2rem;
      height: 2rem;
      flex-shrink: 0;
      padding: 0;
    }

    .skip-btn mat-icon,
    .tag-btn mat-icon {
      font-size: 1.15rem;
      width: 1.15rem;
      height: 1.15rem;
    }

    .tag-btn {
      color: var(--tb-accent-strong);
    }

    .track {
      min-width: 0;
      flex: 1;
      padding: 0 0.2rem;
    }

    .name {
      font-size: 0.78rem;
      font-weight: 600;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      line-height: 1.2;
    }

    .times {
      font-size: 0.66rem;
      color: var(--tb-muted);
      font-variant-numeric: tabular-nums;
      margin-top: 0.08rem;
    }

    .sep {
      margin: 0 0.15rem;
      opacity: 0.55;
    }

    .tag-panel {
      display: grid;
      gap: 0.65rem;
      min-width: 15rem;
      max-width: 18rem;
      padding: 0.85rem 0.95rem 0.95rem;
    }

    .tag-panel-title {
      font-size: 0.78rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--tb-muted);
    }

    .tag-chips {
      max-height: 5.5rem;
      overflow: auto;
    }

    .tag-empty {
      margin: 0;
      font-size: 0.8rem;
      color: var(--tb-muted);
      line-height: 1.35;
    }

    .tag-field {
      width: 100%;
    }

    .add-tag-btn {
      justify-self: end;
    }
  `,
})
export class MusicMiniPlayerComponent {
  readonly player = inject(MusicPlayerService);
  readonly catalog = inject(CatalogService);
  private readonly edits = inject(RecordEditsService);

  readonly tagDraft = signal('');
  readonly menuTick = signal(0);

  readonly currentTags = computed(() => {
    this.edits.draft();
    this.edits.committed();
    this.menuTick();
    this.catalog.loadedDatasets();
    const record = this.player.currentRecord();
    if (!record) return [];
    return this.catalog.getRecordTagsInDataset(MUSIC_DATASET_ID, record);
  });

  readonly filteredSuggestions = computed(() => {
    this.menuTick();
    const music = this.catalog.loadedDatasets()[MUSIC_DATASET_ID];
    const all = music?.allTags ?? [];
    const owned = new Set(this.currentTags().map((t) => t.toLowerCase()));
    const q = this.tagDraft().trim().toLowerCase();
    return all
      .filter((tag) => !owned.has(tag.toLowerCase()))
      .filter((tag) => !q || tag.toLowerCase().includes(q))
      .slice(0, 12);
  });

  onTagMenuOpened(): void {
    this.tagDraft.set('');
    this.menuTick.update((n) => n + 1);
  }

  onTagSelected(event: MatAutocompleteSelectedEvent): void {
    this.tagDraft.set(String(event.option.value ?? ''));
    this.submitTag();
  }

  submitTag(): void {
    const value = this.tagDraft().trim();
    const record = this.player.currentRecord();
    if (!value || !record) return;
    this.catalog.quickAddTag(MUSIC_DATASET_ID, record, value);
    this.tagDraft.set('');
    this.menuTick.update((n) => n + 1);
  }
}
