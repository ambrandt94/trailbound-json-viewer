import { JsonRecord } from '../models/catalog.models';

/** Resolve a playable audio URL from a music catalog record. */
export function resolveMusicAudioUrl(record: JsonRecord | null | undefined): string | null {
  if (!record) return null;

  const direct =
    asText(record['audioUrl']) || asText(record['src']) || asText(record['file']);
  if (direct) return direct;

  const audio = record['audio'];
  if (typeof audio === 'object' && audio !== null && !Array.isArray(audio)) {
    return asText((audio as JsonRecord)['url'] ?? (audio as JsonRecord)['src']);
  }
  if (typeof audio === 'string') return audio;
  return null;
}

function asText(value: unknown): string {
  return typeof value === 'string' ? value : '';
}
