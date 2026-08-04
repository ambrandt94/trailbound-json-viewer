import { Injectable, computed, inject, signal } from '@angular/core';
import { JsonRecord } from '../models/catalog.models';
import { resolveMusicAudioUrl } from '../utils/music-audio';
import { CatalogService } from './catalog.service';

const MUSIC_DATASET_ID = 'music';

@Injectable({ providedIn: 'root' })
export class MusicPlayerService {
  private readonly catalog = inject(CatalogService);
  private readonly audio = new Audio();
  private readonly onTimeUpdate = () => this.syncTime();
  private readonly onLoadedMeta = () => this.syncDuration();
  private readonly onPlay = () => this.playing.set(true);
  private readonly onPause = () => this.playing.set(false);
  private readonly onEnded = () => {
    this.playing.set(false);
    this.currentTime.set(0);
    this.next();
  };

  readonly trackId = signal<string | null>(null);
  readonly trackTitle = signal('');
  readonly playing = signal(false);
  readonly currentTime = signal(0);
  readonly duration = signal(0);

  readonly hasTrack = computed(() => !!this.trackId());

  readonly currentRecord = computed(() => {
    const id = this.trackId();
    if (!id) return null;
    return this.findMusicRecord(id);
  });

  constructor() {
    this.audio.preload = 'metadata';
    this.audio.addEventListener('timeupdate', this.onTimeUpdate);
    this.audio.addEventListener('loadedmetadata', this.onLoadedMeta);
    this.audio.addEventListener('play', this.onPlay);
    this.audio.addEventListener('pause', this.onPause);
    this.audio.addEventListener('ended', this.onEnded);
  }

  isCurrent(recordId: string): boolean {
    return this.trackId() === recordId;
  }

  isPlayingRecord(recordId: string): boolean {
    return this.isCurrent(recordId) && this.playing();
  }

  /** Play a record, or toggle pause if it is already the current track. */
  playOrToggle(record: JsonRecord): void {
    const id = this.catalog.getRecordId(record, this.musicDefinition());
    if (!id) return;
    if (this.isCurrent(id)) {
      this.toggle();
      return;
    }
    void this.playRecord(record);
  }

  async playRecord(record: JsonRecord): Promise<void> {
    const src = resolveMusicAudioUrl(record);
    if (!src) return;

    const definition = this.musicDefinition();
    const id = this.catalog.getRecordId(record, definition);
    const title = this.catalog.getRecordTitle(record, definition);

    this.trackId.set(id || null);
    this.trackTitle.set(title || 'Untitled');
    this.currentTime.set(0);
    this.duration.set(0);

    if (this.audio.src !== this.toAbsoluteUrl(src)) {
      this.audio.src = src;
      this.audio.load();
    }

    try {
      await this.audio.play();
    } catch {
      this.playing.set(false);
    }
  }

  toggle(): void {
    if (!this.trackId()) return;
    if (this.audio.paused) {
      void this.audio.play().catch(() => this.playing.set(false));
    } else {
      this.audio.pause();
    }
  }

  pause(): void {
    this.audio.pause();
  }

  seek(seconds: number): void {
    if (!Number.isFinite(seconds)) return;
    this.audio.currentTime = Math.max(0, seconds);
    this.currentTime.set(this.audio.currentTime);
  }

  previous(): void {
    const queue = this.playableQueue();
    if (!queue.length) return;
    const index = this.currentIndex(queue);
    if (index < 0) {
      void this.playRecord(queue[0]);
      return;
    }
    // Restart if more than 3s into the track; otherwise go to previous.
    if (this.audio.currentTime > 3) {
      this.seek(0);
      if (this.audio.paused) void this.audio.play().catch(() => this.playing.set(false));
      return;
    }
    const prev = queue[(index - 1 + queue.length) % queue.length];
    void this.playRecord(prev);
  }

  next(): void {
    const queue = this.playableQueue();
    if (!queue.length) return;
    const index = this.currentIndex(queue);
    const next = queue[index < 0 ? 0 : (index + 1) % queue.length];
    if (!next) return;
    // Avoid restarting the same lone track on ended.
    if (queue.length === 1 && this.isCurrent(this.catalog.getRecordId(next, this.musicDefinition()))) {
      this.seek(0);
      this.playing.set(false);
      return;
    }
    void this.playRecord(next);
  }

  stopAndClear(): void {
    this.audio.pause();
    this.audio.removeAttribute('src');
    this.audio.load();
    this.trackId.set(null);
    this.trackTitle.set('');
    this.playing.set(false);
    this.currentTime.set(0);
    this.duration.set(0);
  }

  formatTime(seconds: number): string {
    if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  private playableQueue(): JsonRecord[] {
    const music = this.catalog.loadedDatasets()[MUSIC_DATASET_ID];
    if (!music) return [];

    const source =
      this.catalog.activeDatasetId() === MUSIC_DATASET_ID
        ? this.catalog.filteredRecords()
        : music.records;

    return source.filter((record) => !!resolveMusicAudioUrl(record));
  }

  private currentIndex(queue: JsonRecord[]): number {
    const id = this.trackId();
    if (!id) return -1;
    const definition = this.musicDefinition();
    return queue.findIndex((record) => this.catalog.getRecordId(record, definition) === id);
  }

  private findMusicRecord(id: string): JsonRecord | null {
    const music = this.catalog.loadedDatasets()[MUSIC_DATASET_ID];
    if (!music) return null;
    const definition = music.definition;
    return (
      music.records.find((record) => this.catalog.getRecordId(record, definition) === id) ?? null
    );
  }

  private musicDefinition() {
    return this.catalog.loadedDatasets()[MUSIC_DATASET_ID]?.definition;
  }

  private syncTime(): void {
    this.currentTime.set(this.audio.currentTime);
  }

  private syncDuration(): void {
    this.duration.set(Number.isFinite(this.audio.duration) ? this.audio.duration : 0);
  }

  private toAbsoluteUrl(src: string): string {
    try {
      return new URL(src, document.baseURI).href;
    } catch {
      return src;
    }
  }
}
