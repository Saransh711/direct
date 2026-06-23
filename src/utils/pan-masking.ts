/**
 * Masks PAN number for secure logging and display
 * Example: ABCDE1234F -> ABCXXXX34F
 */
export function maskPan(pan: string): string {
  if (!pan || pan.length < 8) {
    return '***MASKED***';
  }

  const first = pan.slice(0, 3);
  const last = pan.slice(-2);
  return `${first}XXXX${last}`;
}

/**
 * Check if PAN is already masked
 */
export function isMaskedPan(pan: string): boolean {
  return pan.includes('XXXX') || pan === '***MASKED***';
}

/**
 * Remove all PAN references from an object (recursive)
 */
export function sanitizeObjectPan(obj: unknown, panKey: string = 'pan'): unknown {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeObjectPan(item, panKey));
  }

  if (typeof obj === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (key.toLowerCase() === panKey.toLowerCase() && typeof value === 'string') {
        result[key] = maskPan(value);
      } else {
        result[key] = sanitizeObjectPan(value, panKey);
      }
    }
    return result;
  }

  return obj;
}
