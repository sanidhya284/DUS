import { createHash } from 'crypto';

/**
 * Hash an IP address with SHA-256 for GDPR-compliant storage.
 * One-way — cannot be reversed to recover original IP.
 */
export function hashIp(ip: string): string {
  return createHash('sha256').update(ip).digest('hex');
}
