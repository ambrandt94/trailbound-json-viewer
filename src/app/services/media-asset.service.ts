import { Injectable, signal } from '@angular/core';
import { IndexedDbMediaAssetStore, MediaAssetStore } from './media-asset-store';

export const LOCAL_MEDIA_PREFIX = 'local:';
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export type ImageUploadRejectReason = 'type' | 'size';

export interface ImageUploadResult {
  accepted: string[];
  rejected: { name: string; reason: ImageUploadRejectReason }[];
}

/**
 * Upload helpers + object-URL cache over a MediaAssetStore.
 * Swap the store implementation later for S3 without changing callers.
 */
@Injectable({ providedIn: 'root' })
export class MediaAssetService {
  private readonly store: MediaAssetStore = new IndexedDbMediaAssetStore();
  private readonly objectUrls = new Map<string, string>();

  /** Bumps when cached object URLs change so views can refresh. */
  readonly readyTick = signal(0);

  isLocalId(id: string): boolean {
    return id.startsWith(LOCAL_MEDIA_PREFIX);
  }

  createLocalId(): string {
    return `${LOCAL_MEDIA_PREFIX}${crypto.randomUUID()}`;
  }

  getCachedUrl(id: string): string | null {
    if (!this.isLocalId(id)) return id;
    return this.objectUrls.get(id) ?? null;
  }

  /** Ensure local asset ids have object URLs (async warm). */
  warm(ids: string[]): void {
    for (const id of ids) {
      if (this.isLocalId(id) && !this.objectUrls.has(id)) {
        void this.resolveUrl(id);
      }
    }
  }

  async resolveUrl(id: string): Promise<string | null> {
    if (!this.isLocalId(id)) return id;
    const cached = this.objectUrls.get(id);
    if (cached) return cached;

    const blob = await this.store.get(id);
    if (!blob) return null;

    const url = URL.createObjectURL(blob);
    this.objectUrls.set(id, url);
    this.readyTick.update((n) => n + 1);
    return url;
  }

  async putBlob(blob: Blob, id = this.createLocalId()): Promise<string> {
    await this.store.put(id, blob);
    const existing = this.objectUrls.get(id);
    if (existing) URL.revokeObjectURL(existing);
    const url = URL.createObjectURL(blob);
    this.objectUrls.set(id, url);
    this.readyTick.update((n) => n + 1);
    return id;
  }

  async uploadImages(files: FileList | File[]): Promise<ImageUploadResult> {
    const list = Array.from(files);
    const accepted: string[] = [];
    const rejected: ImageUploadResult['rejected'] = [];

    for (const file of list) {
      if (!file.type.startsWith('image/')) {
        rejected.push({ name: file.name, reason: 'type' });
        continue;
      }
      if (file.size > MAX_IMAGE_BYTES) {
        rejected.push({ name: file.name, reason: 'size' });
        continue;
      }
      const id = await this.putBlob(file);
      accepted.push(id);
    }

    return { accepted, rejected };
  }

  async delete(id: string): Promise<void> {
    if (!this.isLocalId(id)) return;
    const url = this.objectUrls.get(id);
    if (url) {
      URL.revokeObjectURL(url);
      this.objectUrls.delete(id);
    }
    await this.store.delete(id);
    this.readyTick.update((n) => n + 1);
  }

  async deleteMany(ids: string[]): Promise<void> {
    await Promise.all(ids.filter((id) => this.isLocalId(id)).map((id) => this.delete(id)));
  }
}
