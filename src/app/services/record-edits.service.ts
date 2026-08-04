import { Injectable, computed, inject, signal } from '@angular/core';
import { DatasetDefinition, JsonRecord } from '../models/catalog.models';
import { MediaImageOverride } from '../models/media.models';
import { MediaAssetService } from './media-asset.service';

export interface RecordOverride {
  tags?: string[];
  /** When set, replaces the record's reference image list (catalog + uploads). */
  images?: MediaImageOverride[];
}

export type OverridesByRecord = Record<string, RecordOverride>;
export type OverridesByDataset = Record<string, OverridesByRecord>;

const STORAGE_KEY = 'tb-data-viewer-record-overrides';

/**
 * Draft + persisted record overrides (tags + reference images).
 * Draft changes are discardable until save; save writes metadata to localStorage.
 * Image bytes for `local:` ids live in MediaAssetService / IndexedDB.
 */
@Injectable({ providedIn: 'root' })
export class RecordEditsService {
  private readonly assets = inject(MediaAssetService);

  readonly committed = signal<OverridesByDataset>(this.readStorage());
  readonly draft = signal<OverridesByDataset>({});
  readonly editing = signal(false);

  readonly hasDirtyDraft = computed(() => {
    for (const [datasetId, records] of Object.entries(this.draft())) {
      for (const recordId of Object.keys(records)) {
        if (this.isDirty(datasetId, recordId)) return true;
      }
    }
    return false;
  });

  setEditing(enabled: boolean): void {
    this.editing.set(enabled);
  }

  toggleEditing(): void {
    this.editing.update((v) => !v);
  }

  effectiveTags(datasetId: string, recordId: string, baseTags: string[]): string[] {
    const draftTags = this.draft()[datasetId]?.[recordId]?.tags;
    if (draftTags) return [...draftTags];
    const committedTags = this.committed()[datasetId]?.[recordId]?.tags;
    if (committedTags) return [...committedTags];
    return [...baseTags];
  }

  /** Tags after last save (or base if never saved). */
  committedTags(datasetId: string, recordId: string, baseTags: string[]): string[] {
    const committedTags = this.committed()[datasetId]?.[recordId]?.tags;
    return committedTags ? [...committedTags] : [...baseTags];
  }

  effectiveImages(
    datasetId: string,
    recordId: string,
    baseImages: MediaImageOverride[],
  ): MediaImageOverride[] {
    const draftImages = this.draft()[datasetId]?.[recordId]?.images;
    if (draftImages) return cloneImages(draftImages);
    const committedImages = this.committed()[datasetId]?.[recordId]?.images;
    if (committedImages) return cloneImages(committedImages);
    return cloneImages(baseImages);
  }

  committedImages(
    datasetId: string,
    recordId: string,
    baseImages: MediaImageOverride[],
  ): MediaImageOverride[] {
    const committedImages = this.committed()[datasetId]?.[recordId]?.images;
    return committedImages ? cloneImages(committedImages) : cloneImages(baseImages);
  }

  isDirty(datasetId: string, recordId: string): boolean {
    const draftOverride = this.draft()[datasetId]?.[recordId];
    if (!draftOverride) return false;
    const committed = this.committed()[datasetId]?.[recordId];

    if (draftOverride.tags) {
      if (!committed?.tags || !sameTagList(draftOverride.tags, committed.tags)) return true;
    }
    if (draftOverride.images) {
      if (!committed?.images || !sameImageList(draftOverride.images, committed.images)) {
        return true;
      }
    }
    return false;
  }

  isRecordDirty(
    datasetId: string,
    recordId: string,
    baseTags: string[],
    baseImages: MediaImageOverride[] = [],
  ): boolean {
    const draftOverride = this.draft()[datasetId]?.[recordId];
    if (!draftOverride) return false;

    if (draftOverride.tags) {
      const baseline = this.committedTags(datasetId, recordId, baseTags);
      if (!sameTagList(draftOverride.tags, baseline)) return true;
    }
    if (draftOverride.images) {
      const baseline = this.committedImages(datasetId, recordId, baseImages);
      if (!sameImageList(draftOverride.images, baseline)) return true;
    }
    return false;
  }

  ensureDraft(
    datasetId: string,
    recordId: string,
    baseTags: string[],
    baseImages?: MediaImageOverride[],
  ): void {
    const existing = this.draft()[datasetId]?.[recordId];
    const patch: RecordOverride = { ...(existing ?? {}) };
    let needsWrite = !existing;

    if (!existing?.tags) {
      patch.tags = this.effectiveTags(datasetId, recordId, baseTags);
      needsWrite = true;
    }
    if (baseImages !== undefined && !existing?.images) {
      patch.images = this.effectiveImages(datasetId, recordId, baseImages);
      needsWrite = true;
    }

    if (needsWrite) {
      this.patchDraft(datasetId, recordId, patch);
    }
  }

  addTag(datasetId: string, recordId: string, baseTags: string[], tag: string): void {
    const normalized = normalizeTag(tag);
    if (!normalized) return;
    this.ensureDraft(datasetId, recordId, baseTags);
    const current = this.draft()[datasetId]?.[recordId]?.tags ?? [];
    if (current.some((t) => t.toLowerCase() === normalized.toLowerCase())) return;
    this.patchDraft(datasetId, recordId, { tags: [...current, normalized] });
  }

  removeTag(datasetId: string, recordId: string, baseTags: string[], tag: string): void {
    this.ensureDraft(datasetId, recordId, baseTags);
    const current = this.draft()[datasetId]?.[recordId]?.tags ?? [];
    this.patchDraft(datasetId, recordId, {
      tags: current.filter((t) => t !== tag),
    });
  }

  addImages(
    datasetId: string,
    recordId: string,
    baseTags: string[],
    baseImages: MediaImageOverride[],
    imageIds: string[],
    captions?: (string | undefined)[],
  ): void {
    if (!imageIds.length) return;
    this.ensureDraft(datasetId, recordId, baseTags, baseImages);
    const current = this.draft()[datasetId]?.[recordId]?.images ?? [];
    const next = [
      ...current,
      ...imageIds.map((id, index) => ({
        id,
        caption: captions?.[index] || undefined,
      })),
    ];
    this.patchDraft(datasetId, recordId, { images: next });
  }

  removeImage(
    datasetId: string,
    recordId: string,
    baseTags: string[],
    baseImages: MediaImageOverride[],
    imageId: string,
  ): void {
    this.ensureDraft(datasetId, recordId, baseTags, baseImages);
    const current = this.draft()[datasetId]?.[recordId]?.images ?? [];
    const next = current.filter((image) => image.id !== imageId);
    this.patchDraft(datasetId, recordId, { images: next });

    // Drop unreferenced draft-only local blobs immediately.
    if (this.assets.isLocalId(imageId) && !this.isImageReferenced(datasetId, recordId, imageId)) {
      void this.assets.delete(imageId);
    }
  }

  setImageCaption(
    datasetId: string,
    recordId: string,
    baseTags: string[],
    baseImages: MediaImageOverride[],
    imageId: string,
    caption: string,
  ): void {
    this.ensureDraft(datasetId, recordId, baseTags, baseImages);
    const current = this.draft()[datasetId]?.[recordId]?.images ?? [];
    const next = current.map((image) =>
      image.id === imageId
        ? { ...image, caption: caption.trim() || undefined }
        : image,
    );
    this.patchDraft(datasetId, recordId, { images: next });
  }

  /** Persist draft for one record (or all dirty in dataset if recordId omitted). */
  save(datasetId: string, recordId?: string): RecordOverride | null {
    if (recordId) {
      const draftOverride = this.draft()[datasetId]?.[recordId];
      if (!draftOverride) return null;

      const previous = this.committed()[datasetId]?.[recordId];
      this.committed.update((map) => ({
        ...map,
        [datasetId]: {
          ...(map[datasetId] ?? {}),
          [recordId]: { ...draftOverride },
        },
      }));
      this.clearDraftRecord(datasetId, recordId);
      this.writeStorage(this.committed());
      // Drop locals that were committed before but are gone after save.
      void this.deleteOrphanLocals(draftOverride.images, previous?.images);
      return draftOverride;
    }

    const drafts = this.draft()[datasetId] ?? {};
    const previousDataset = this.committed()[datasetId] ?? {};
    this.committed.update((map) => ({
      ...map,
      [datasetId]: {
        ...(map[datasetId] ?? {}),
        ...structuredClone(drafts),
      },
    }));
    this.draft.update((map) => {
      const next = { ...map };
      delete next[datasetId];
      return next;
    });
    this.writeStorage(this.committed());

    for (const [id, draftOverride] of Object.entries(drafts)) {
      void this.deleteOrphanLocals(draftOverride.images, previousDataset[id]?.images);
    }
    return null;
  }

  discard(datasetId: string, recordId?: string): void {
    if (recordId) {
      const draftOverride = this.draft()[datasetId]?.[recordId];
      const committed = this.committed()[datasetId]?.[recordId];
      this.clearDraftRecord(datasetId, recordId);
      if (draftOverride?.images) {
        // Drop draft-only locals that never made it into committed.
        void this.deleteOrphanLocals(committed?.images, draftOverride.images);
      }
      return;
    }

    const drafts = this.draft()[datasetId] ?? {};
    const committedDataset = this.committed()[datasetId] ?? {};
    this.draft.update((map) => {
      const next = { ...map };
      delete next[datasetId];
      return next;
    });
    for (const [id, draftOverride] of Object.entries(drafts)) {
      if (draftOverride.images) {
        void this.deleteOrphanLocals(committedDataset[id]?.images, draftOverride.images);
      }
    }
  }

  /** Apply committed tag overrides onto freshly loaded records. */
  applyCommittedToRecords(
    datasetId: string,
    records: JsonRecord[],
    definition: DatasetDefinition,
  ): void {
    const overrides = this.committed()[datasetId];
    if (!overrides) return;
    const idField = definition.idField ?? 'id';
    const tagField = definition.tagField ?? 'tags';
    for (const record of records) {
      const id = String(record[idField] ?? '');
      const tags = overrides[id]?.tags;
      if (tags) {
        record[tagField] = [...tags];
      }
      // Image overrides stay in override storage; RecordMediaService resolves display URLs.
      if (overrides[id]?.images) {
        this.assets.warm(overrides[id]!.images!.map((image) => image.id));
      }
    }
  }

  private isImageReferenced(datasetId: string, recordId: string, imageId: string): boolean {
    const draftImages = this.draft()[datasetId]?.[recordId]?.images;
    if (draftImages?.some((image) => image.id === imageId)) return true;
    const committedImages = this.committed()[datasetId]?.[recordId]?.images;
    if (committedImages?.some((image) => image.id === imageId)) return true;
    return false;
  }

  /** Delete local blobs that appear in `fromImages` but not in `keepImages`. */
  private async deleteOrphanLocals(
    keepImages: MediaImageOverride[] | undefined,
    fromImages: MediaImageOverride[] | undefined,
  ): Promise<void> {
    if (!fromImages?.length) return;
    const keep = new Set((keepImages ?? []).map((image) => image.id));
    const orphans = fromImages
      .map((image) => image.id)
      .filter((id) => this.assets.isLocalId(id) && !keep.has(id));
    await this.assets.deleteMany(orphans);
  }

  private patchDraft(datasetId: string, recordId: string, patch: RecordOverride): void {
    this.draft.update((map) => ({
      ...map,
      [datasetId]: {
        ...(map[datasetId] ?? {}),
        [recordId]: {
          ...(map[datasetId]?.[recordId] ?? {}),
          ...patch,
        },
      },
    }));
  }

  private clearDraftRecord(datasetId: string, recordId: string): void {
    this.draft.update((map) => {
      const dataset = { ...(map[datasetId] ?? {}) };
      delete dataset[recordId];
      const next = { ...map };
      if (Object.keys(dataset).length) next[datasetId] = dataset;
      else delete next[datasetId];
      return next;
    });
  }

  private readStorage(): OverridesByDataset {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return {};
      const parsed = JSON.parse(raw) as OverridesByDataset;
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
      return {};
    }
  }

  private writeStorage(map: OverridesByDataset): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  }
}

function normalizeTag(tag: string): string {
  return tag.trim().replace(/\s+/g, '-').toLowerCase();
}

function sameTagList(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((tag, i) => tag === b[i]);
}

function sameImageList(a: MediaImageOverride[], b: MediaImageOverride[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((image, i) => {
    const other = b[i];
    return (
      image.id === other.id &&
      (image.caption ?? '') === (other.caption ?? '') &&
      (image.alt ?? '') === (other.alt ?? '')
    );
  });
}

function cloneImages(images: MediaImageOverride[]): MediaImageOverride[] {
  return images.map((image) => ({ ...image }));
}
