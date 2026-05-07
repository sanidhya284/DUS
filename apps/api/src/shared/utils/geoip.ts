import * as fs from 'fs';
import * as path from 'path';
import { env } from '../../config/env';

let reader: { get: (ip: string) => { country?: { iso_code?: string } } | null } | null = null;

export async function initGeoIp(): Promise<void> {
  const dbPath = path.resolve(env.GEOIP_DB_PATH);
  if (!fs.existsSync(dbPath)) {
    console.warn(`⚠️  GeoIP DB not found at ${dbPath} — country lookup disabled`);
    return;
  }

  try {
    // Dynamic import to avoid hard dependency if file missing
    const maxmind = await import('maxmind');
    reader = (await maxmind.open(dbPath)) as unknown as typeof reader;
    console.log('✅ GeoIP database loaded');
  } catch (err) {
    console.warn('⚠️  GeoIP init failed:', (err as Error).message);
  }
}

export function lookupCountry(ip: string): string {
  if (!reader) return 'Unknown';
  try {
    const result = reader.get(ip);
    return result?.country?.iso_code ?? 'Unknown';
  } catch {
    return 'Unknown';
  }
}
