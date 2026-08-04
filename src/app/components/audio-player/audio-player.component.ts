import {
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-audio-player',
  standalone: true,
  imports: [MatIconModule, MatButtonModule, MatTooltipModule],
  template: `
    @if (src) {
      <div class="player" [class.playing]="playing">
        <button
          mat-mini-fab
          type="button"
          class="play-btn"
          (click)="toggle()"
          [matTooltip]="playing ? 'Pause' : 'Play'"
          [attr.aria-label]="playing ? 'Pause' : 'Play'"
        >
          <mat-icon>{{ playing ? 'pause' : 'play_arrow' }}</mat-icon>
        </button>

        <div class="meta">
          @if (title) {
            <div class="track-title">{{ title }}</div>
          }
          <div class="times">
            <span>{{ formatTime(current) }}</span>
            <span class="sep">/</span>
            <span>{{ formatTime(duration) }}</span>
          </div>
        </div>

        <input
          class="scrub"
          type="range"
          min="0"
          [max]="duration || 0"
          step="0.1"
          [value]="current"
          (input)="onScrub($event)"
          [disabled]="!duration"
          aria-label="Seek"
        />

        <button
          mat-icon-button
          type="button"
          class="mute-btn"
          (click)="toggleMute()"
          [matTooltip]="muted ? 'Unmute' : 'Mute'"
          [attr.aria-label]="muted ? 'Unmute' : 'Mute'"
        >
          <mat-icon>{{ muted || volume === 0 ? 'volume_off' : 'volume_up' }}</mat-icon>
        </button>

        <audio
          #audio
          [src]="src"
          preload="metadata"
          (timeupdate)="onTimeUpdate()"
          (loadedmetadata)="onMeta()"
          (ended)="onEnded()"
          (play)="playing = true"
          (pause)="playing = false"
        ></audio>
      </div>
    } @else {
      <div class="empty-player">
        <mat-icon>music_off</mat-icon>
        <span>No audio asset</span>
      </div>
    }
  `,
  styles: `
    :host { display: block; }

    .player {
      display: grid;
      grid-template-columns: auto minmax(0, 1fr) auto;
      grid-template-areas:
        'play meta mute'
        'scrub scrub scrub';
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

    .mute-btn { grid-area: mute; color: var(--tb-muted); }

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
        grid-template-columns: auto minmax(7rem, 12rem) minmax(0, 1fr) auto;
        grid-template-areas: 'play meta scrub mute';
      }
    }
  `,
})
export class AudioPlayerComponent implements OnChanges, OnDestroy {
  @Input() src: string | null = null;
  @Input() title = '';

  @ViewChild('audio') audioRef?: ElementRef<HTMLAudioElement>;

  playing = false;
  current = 0;
  duration = 0;
  muted = false;
  volume = 1;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['src'] && !changes['src'].firstChange) {
      this.playing = false;
      this.current = 0;
      this.duration = 0;
      const el = this.audioRef?.nativeElement;
      if (el) {
        el.pause();
        el.load();
      }
    }
  }

  ngOnDestroy(): void {
    this.audioRef?.nativeElement.pause();
  }

  toggle(): void {
    const el = this.audioRef?.nativeElement;
    if (!el) return;
    if (el.paused) void el.play();
    else el.pause();
  }

  toggleMute(): void {
    const el = this.audioRef?.nativeElement;
    if (!el) return;
    el.muted = !el.muted;
    this.muted = el.muted;
  }

  onScrub(event: Event): void {
    const el = this.audioRef?.nativeElement;
    if (!el) return;
    const value = Number((event.target as HTMLInputElement).value);
    el.currentTime = value;
    this.current = value;
  }

  onTimeUpdate(): void {
    const el = this.audioRef?.nativeElement;
    if (!el) return;
    this.current = el.currentTime;
  }

  onMeta(): void {
    const el = this.audioRef?.nativeElement;
    if (!el) return;
    this.duration = Number.isFinite(el.duration) ? el.duration : 0;
  }

  onEnded(): void {
    this.playing = false;
    this.current = 0;
  }

  formatTime(seconds: number): string {
    if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  }
}
