import { z } from 'zod';

const ALLOWED_PROTOCOLS = ['http:', 'https:'];
const MAX_URL_LENGTH = 2048;

// Domains that are permanently blacklisted
const BLACKLISTED_DOMAINS = new Set([
  'malware-example.com',
  'phishing-example.net',
  // Add more from DB at startup via loadBlacklist()
]);

const urlSchema = z
  .string()
  .max(MAX_URL_LENGTH, `URL must not exceed ${MAX_URL_LENGTH} characters`)
  .refine((val) => {
    try {
      const url = new URL(val);
      return ALLOWED_PROTOCOLS.includes(url.protocol);
    } catch {
      return false;
    }
  }, 'Must be a valid http:// or https:// URL');

export interface UrlValidationResult {
  valid: boolean;
  error?: string;
}

export function validateUrl(rawUrl: string): UrlValidationResult {
  const result = urlSchema.safeParse(rawUrl);
  if (!result.success) {
    return { valid: false, error: result.error.errors[0].message };
  }

  try {
    const url = new URL(rawUrl);
    if (BLACKLISTED_DOMAINS.has(url.hostname)) {
      return { valid: false, error: 'This URL has been blocked' };
    }
  } catch {
    return { valid: false, error: 'Invalid URL format' };
  }

  return { valid: true };
}

/** Load blacklist entries from DB or config at startup */
export function loadBlacklist(domains: string[]): void {
  for (const domain of domains) {
    BLACKLISTED_DOMAINS.add(domain.toLowerCase());
  }
}
