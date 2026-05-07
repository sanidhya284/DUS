import { validateUrl, loadBlacklist } from '../../src/shared/utils/urlValidator';

describe('urlValidator', () => {
  describe('valid URLs', () => {
    const validUrls = [
      'https://www.google.com',
      'http://example.com',
      'https://sub.domain.io/path?q=1&r=2#anchor',
      'https://example.com/very/deep/path',
      'http://localhost:8080/test',
    ];

    it.each(validUrls)('accepts %s', (url) => {
      expect(validateUrl(url).valid).toBe(true);
    });
  });

  describe('invalid URLs', () => {
    it('rejects plain strings', () => {
      expect(validateUrl('not-a-url').valid).toBe(false);
    });

    it('rejects ftp:// protocol', () => {
      expect(validateUrl('ftp://example.com/file').valid).toBe(false);
    });

    it('rejects javascript: protocol', () => {
      expect(validateUrl('javascript:alert(1)').valid).toBe(false);
    });

    it('rejects empty string', () => {
      expect(validateUrl('').valid).toBe(false);
    });

    it('rejects URL exceeding 2048 chars', () => {
      const longUrl = 'https://example.com/' + 'a'.repeat(2050);
      const result = validateUrl(longUrl);
      expect(result.valid).toBe(false);
    });

    it('returns an error message on failure', () => {
      const result = validateUrl('not-a-url');
      expect(result.error).toBeDefined();
      expect(typeof result.error).toBe('string');
    });
  });

  describe('blacklist', () => {
    beforeAll(() => {
      loadBlacklist(['blocked-domain.com']);
    });

    it('rejects blacklisted domain', () => {
      const result = validateUrl('https://blocked-domain.com/path');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('blocked');
    });

    it('still allows non-blacklisted domains', () => {
      expect(validateUrl('https://safe-domain.com').valid).toBe(true);
    });
  });
});
