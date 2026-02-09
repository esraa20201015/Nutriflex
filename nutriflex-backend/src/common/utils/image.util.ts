/**
 * Normalize image input to a data URL for storage.
 * Accepts either raw base64 string or full data URL (e.g. data:image/jpeg;base64,...).
 */
export function toDataUrl(base64OrDataUrl: string, defaultMime = 'image/jpeg'): string {
  if (!base64OrDataUrl || typeof base64OrDataUrl !== 'string') return base64OrDataUrl;
  const s = base64OrDataUrl.trim();
  if (s.startsWith('data:')) return s;
  return `data:${defaultMime};base64,${s}`;
}
