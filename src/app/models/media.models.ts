import { JsonRecord } from './catalog.models';

export interface MediaImage {
  /** Display URL (site-relative path or blob: object URL). */
  url: string;
  /** Stable association id (`assets/…` or `local:<uuid>`). Defaults to url when omitted. */
  id?: string;
  caption?: string;
  alt?: string;
}

/** Metadata stored in browser overrides (bytes live in MediaAssetStore). */
export interface MediaImageOverride {
  id: string;
  caption?: string;
  alt?: string;
}

export function mediaImagesToOverrides(images: MediaImage[]): MediaImageOverride[] {
  return images.map((image) => ({
    id: image.id || image.url,
    caption: image.caption,
    alt: image.alt,
  }));
}

export interface RecordMedia {
  modelUrl: string | null;
  posterUrl: string | null;
  images: MediaImage[];
}

/** Shared placeholders when an entry opts into draft media. */
export const PLACEHOLDER_MODEL_URL = 'assets/placeholders/placeholder.glb';
export const PLACEHOLDER_IMAGES: MediaImage[] = [
  {
    url: 'assets/placeholders/ref-01.svg',
    caption: 'Reference A',
    alt: 'Placeholder reference image A',
  },
  {
    url: 'assets/placeholders/ref-02.svg',
    caption: 'Reference B',
    alt: 'Placeholder reference image B',
  },
  {
    url: 'assets/placeholders/ref-03.svg',
    caption: 'Reference C',
    alt: 'Placeholder reference image C',
  },
];

/**
 * Resolve model + reference images from a record.
 *
 * - No `media` / model / images fields → empty (hide media UI).
 * - `media: { "placeholder": true }` → shared placeholder assets.
 * - Explicit urls / image lists → used as authored.
 * - Pass `usePlaceholders: true` to fill gaps when urls are missing
 *   (off by default so “no asset” entries stay empty).
 */
export function extractRecordMedia(
  record: JsonRecord | null | undefined,
  options: { usePlaceholders?: boolean } = {},
): RecordMedia {
  const usePlaceholders = options.usePlaceholders === true;
  const empty: RecordMedia = { modelUrl: null, posterUrl: null, images: [] };

  if (!record) return empty;

  const mediaBag = record['media'];
  const hasMediaKey = Object.prototype.hasOwnProperty.call(record, 'media');
  const media =
    typeof mediaBag === 'object' && mediaBag !== null && !Array.isArray(mediaBag)
      ? (mediaBag as JsonRecord)
      : null;

  const wantsPlaceholder = media?.['placeholder'] === true;
  const rawImages = media?.['images'] ?? record['referenceImages'] ?? record['images'];
  const images = parseImages(rawImages);
  const authoredModel =
    asText(media?.['modelUrl']) || asText(record['modelUrl']);
  const authoredPoster =
    asText(media?.['posterUrl']) || asText(record['posterUrl']);

  const hasAuthoredMedia =
    !!authoredModel || !!authoredPoster || images.length > 0 || wantsPlaceholder;

  // Explicit null / empty media object with no assets → treat as no media.
  if (hasMediaKey && mediaBag === null) return empty;
  if (!hasAuthoredMedia && !usePlaceholders) return empty;

  if (wantsPlaceholder || (usePlaceholders && !hasAuthoredMedia)) {
    return {
      modelUrl: PLACEHOLDER_MODEL_URL,
      posterUrl: PLACEHOLDER_IMAGES[0]?.url ?? null,
      images: [...PLACEHOLDER_IMAGES],
    };
  }

  return {
    modelUrl: authoredModel || (usePlaceholders ? PLACEHOLDER_MODEL_URL : null),
    posterUrl:
      authoredPoster ||
      (usePlaceholders && !authoredModel ? PLACEHOLDER_IMAGES[0]?.url ?? null : null),
    images: images.length
      ? images
      : usePlaceholders
        ? [...PLACEHOLDER_IMAGES]
        : [],
  };
}

function parseImages(value: unknown): MediaImage[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item): MediaImage | null => {
      if (typeof item === 'string' && item.trim()) {
        return { url: item.trim(), alt: item.trim() };
      }
      if (typeof item === 'object' && item !== null && !Array.isArray(item)) {
        const obj = item as JsonRecord;
        const url = asText(obj['url'] ?? obj['src'] ?? obj['path']);
        if (!url) return null;
        return {
          url,
          caption: asText(obj['caption'] ?? obj['label']) || undefined,
          alt: asText(obj['alt']) || undefined,
        };
      }
      return null;
    })
    .filter((item): item is MediaImage => item !== null);
}

function asText(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}
