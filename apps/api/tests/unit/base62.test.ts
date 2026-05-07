import { encodeBase62, decodeBase62 } from '../../src/shared/utils/base62';

describe('Base62', () => {
  describe('encodeBase62', () => {
    it('encodes 0 as "0"', () => {
      expect(encodeBase62(0)).toBe('0');
    });

    it('encodes 1 as "1"', () => {
      expect(encodeBase62(1)).toBe('1');
    });

    it('encodes 61 as "Z" (last single-char code)', () => {
      expect(encodeBase62(61)).toBe('Z');
    });

    it('encodes 62 as "10" (two-char rollover)', () => {
      expect(encodeBase62(62)).toBe('10');
    });

    it('encodes large numbers', () => {
      const code = encodeBase62(125_000_000);
      expect(typeof code).toBe('string');
      expect(code.length).toBeGreaterThan(0);
    });

    it('accepts bigint input', () => {
      expect(encodeBase62(62n)).toBe('10');
    });

    it('produces codes within alphabet characters only', () => {
      const ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
      for (let i = 0; i < 1000; i++) {
        const code = encodeBase62(i);
        for (const char of code) {
          expect(ALPHABET).toContain(char);
        }
      }
    });
  });

  describe('decodeBase62', () => {
    it('decodes "0" back to 0n', () => {
      expect(decodeBase62('0')).toBe(0n);
    });

    it('decodes "10" back to 62n', () => {
      expect(decodeBase62('10')).toBe(62n);
    });

    it('throws on invalid character', () => {
      expect(() => decodeBase62('!invalid')).toThrow('Invalid Base62 character');
    });
  });

  describe('round-trip', () => {
    const testCases = [0, 1, 61, 62, 100, 1000, 56_800_235_583];

    it.each(testCases)('encode then decode is identity for %i', (n) => {
      const encoded = encodeBase62(n);
      const decoded = decodeBase62(encoded);
      expect(decoded).toBe(BigInt(n));
    });
  });
});
