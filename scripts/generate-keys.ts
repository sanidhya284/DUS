import { generateKeyPairSync } from 'crypto';
import { writeFileSync, mkdirSync } from 'fs';
import { resolve } from 'path';

const keysDir = resolve(__dirname, '../keys');
mkdirSync(keysDir, { recursive: true });

const { privateKey, publicKey } = generateKeyPairSync('rsa', {
  modulusLength: 4096,
  publicKeyEncoding: { type: 'spki', format: 'pem' },
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
});

writeFileSync(resolve(keysDir, 'private.pem'), privateKey, { mode: 0o600 });
writeFileSync(resolve(keysDir, 'public.pem'), publicKey);

console.log('✅ RS256 key pair generated in /keys/');
console.log('   private.pem — keep secret, NEVER commit');
console.log('   public.pem  — safe to share across services');
