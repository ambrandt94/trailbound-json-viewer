import { Injectable, inject } from '@angular/core';
import {
  extractRecordMedia,
  mediaImagesToOverrides,
  MediaImage,
  MediaImageOverride,
  RecordMedia,
} from '../models/media.models';
import { JsonRecord } from '../models/catalog.models';
import { CatalogService } from './catalog.service';
import { MediaAssetService } from './media-asset.service';
import { RecordEditsService } from './record-edits.service';

/**
 * Resolve catalog media + browser image overrides into display-ready RecordMedia.
 */
@Injectable({ providedIn: 'root' })
export class RecordMediaService {
  private readonly edits = inject(RecordEditsService);
  private readonly assets = inject(MediaAssetService);
  private readonly catalog = inject(CatalogService);

  resolve(record: JsonRecord | null | undefined): RecordMedia {
    // Depend on override + URL-cache signals for template refresh.
    this.edits.draft();
    this.edits.committed();
    this.assets.readyTick();

    const base = extractRecordMedia(record);
    if (!record) return base;

    const datasetId = this.catalog.activeDatasetId();
    const recordId = this.catalog.getRecordId(record);
    if (!datasetId || !recordId) return base;

    const baseOverrides = mediaImagesToOverrides(base.images);
    const overrides = this.edits.effectiveImages(datasetId, recordId, baseOverrides);
    this.assets.warm(overrides.map((image) => image.id));

    return {
      modelUrl: base.modelUrl,
      posterUrl: base.posterUrl,
      images: this.toDisplayImages(overrides),
    };
  }

  baseImageOverrides(record: JsonRecord): MediaImageOverride[] {
    return mediaImagesToOverrides(extractRecordMedia(record).images);
  }

  private toDisplayImages(overrides: MediaImageOverride[]): MediaImage[] {
    const images: MediaImage[] = [];
    for (const image of overrides) {
      const url = this.assets.getCachedUrl(image.id);
      if (!url) continue;
      images.push({
        id: image.id,
        url,
        caption: image.caption,
        alt: image.alt,
      });
    }
    return images;
  }
}
