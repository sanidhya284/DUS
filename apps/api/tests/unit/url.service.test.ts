import { Types } from 'mongoose';
import * as urlService from '../../src/modules/url/url.service';
import { UrlRepository } from '../../src/modules/url/url.repository';
import { AppError } from '../../src/shared/errors/AppError';

jest.mock('../../src/modules/url/url.repository');
jest.mock('../../src/config/queue', () => ({
  enqueueClickEvent: jest.fn(),
  getClickQueue: jest.fn(() => null),
  initQueue: jest.fn(),
}));
jest.mock('../../src/shared/utils/geoip', () => ({
  lookupCountry: jest.fn(() => 'Unknown'),
  initGeoIp: jest.fn(),
}));
jest.mock('../../src/config/redis', () => ({
  getRedisClient: jest.fn(() => null),
  isRedisAvailable: jest.fn(() => false),
  connectRedis: jest.fn(),
}));

const mockRepo = UrlRepository as jest.MockedClass<typeof UrlRepository>;

const MOCK_USER_ID = new Types.ObjectId();
const MOCK_URL = {
  _id: new Types.ObjectId(),
  shortCode: 'abc123',
  originalUrl: 'https://example.com',
  customAlias: false,
  userId: MOCK_USER_ID,
  clickCount: 5,
  isActive: true,
  createdAt: new Date(),
  expiresAt: undefined,
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('url.service — shortenUrl', () => {
  it('returns existing short code when same user shortens same URL (dedup)', async () => {
    mockRepo.prototype.findByOriginalUrlAndUser.mockResolvedValue(MOCK_URL as any);

    const result = await urlService.shortenUrl({
      originalUrl: 'https://example.com',
      userId: MOCK_USER_ID,
    });

    expect(result.shortCode).toBe('abc123');
    expect(mockRepo.prototype.create).not.toHaveBeenCalled();
  });

  it('creates a new short URL when no duplicate exists', async () => {
    mockRepo.prototype.findByOriginalUrlAndUser.mockResolvedValue(null);
    mockRepo.prototype.findByShortCode.mockResolvedValue(null);
    mockRepo.prototype.create.mockResolvedValue({ ...MOCK_URL, shortCode: '1' } as any);

    const result = await urlService.shortenUrl({
      originalUrl: 'https://new-url.com',
      userId: MOCK_USER_ID,
    });

    expect(mockRepo.prototype.create).toHaveBeenCalledTimes(1);
    expect(mockRepo.prototype.create).toHaveBeenCalledWith(
      expect.objectContaining({ originalUrl: 'https://new-url.com' })
    );
  });

  it('uses custom alias when provided', async () => {
    mockRepo.prototype.findByOriginalUrlAndUser.mockResolvedValue(null);
    mockRepo.prototype.findByShortCode.mockResolvedValue(null); // alias not taken
    mockRepo.prototype.create.mockResolvedValue({ ...MOCK_URL, shortCode: 'mylink', customAlias: true } as any);

    const result = await urlService.shortenUrl({
      originalUrl: 'https://example.com/page',
      alias: 'mylink',
      userId: MOCK_USER_ID,
    });

    expect(result.customAlias).toBe(true);
    expect(result.shortCode).toBe('mylink');
  });

  it('throws ALIAS_TAKEN when custom alias already exists', async () => {
    mockRepo.prototype.findByOriginalUrlAndUser.mockResolvedValue(null);
    mockRepo.prototype.findByShortCode.mockResolvedValue(MOCK_URL as any); // alias taken

    await expect(
      urlService.shortenUrl({ originalUrl: 'https://example.com', alias: 'abc123', userId: MOCK_USER_ID })
    ).rejects.toThrow(AppError);

    await expect(
      urlService.shortenUrl({ originalUrl: 'https://example.com', alias: 'abc123', userId: MOCK_USER_ID })
    ).rejects.toMatchObject({ code: 'ALIAS_TAKEN' });
  });

  it('throws INVALID_URL for non-URL input', async () => {
    await expect(
      urlService.shortenUrl({ originalUrl: 'not-a-url' })
    ).rejects.toMatchObject({ code: 'INVALID_URL' });
  });
});

describe('url.service — resolveRedirect', () => {
  const META = { ip: '127.0.0.1', userAgent: 'test-agent', referrer: '' };

  it('returns originalUrl for a valid active short code', async () => {
    mockRepo.prototype.findByShortCode.mockResolvedValue(MOCK_URL as any);

    const result = await urlService.resolveRedirect('abc123', META);
    expect(result.originalUrl).toBe('https://example.com');
  });

  it('throws NOT_FOUND for unknown short code', async () => {
    mockRepo.prototype.findByShortCode.mockResolvedValue(null);

    await expect(urlService.resolveRedirect('unknown', META)).rejects.toMatchObject({
      statusCode: 404,
    });
  });

  it('throws GONE for an expired URL', async () => {
    const expired = {
      ...MOCK_URL,
      expiresAt: new Date(Date.now() - 1000), // in the past
    };
    mockRepo.prototype.findByShortCode.mockResolvedValue(expired as any);

    await expect(urlService.resolveRedirect('abc123', META)).rejects.toMatchObject({
      statusCode: 410,
    });
  });

  it('does not throw for URL with future expiry', async () => {
    const future = {
      ...MOCK_URL,
      expiresAt: new Date(Date.now() + 86400000), // tomorrow
    };
    mockRepo.prototype.findByShortCode.mockResolvedValue(future as any);

    const result = await urlService.resolveRedirect('abc123', META);
    expect(result.originalUrl).toBe('https://example.com');
  });
});

describe('url.service — deleteUrl', () => {
  it('soft-deletes a URL owned by user', async () => {
    mockRepo.prototype.softDelete.mockResolvedValue(true);

    await expect(urlService.deleteUrl('abc123', MOCK_USER_ID)).resolves.not.toThrow();
    expect(mockRepo.prototype.softDelete).toHaveBeenCalledWith('abc123', MOCK_USER_ID);
  });

  it('throws NOT_FOUND when URL not owned by user', async () => {
    mockRepo.prototype.softDelete.mockResolvedValue(false);

    await expect(urlService.deleteUrl('abc123', MOCK_USER_ID)).rejects.toMatchObject({
      statusCode: 404,
    });
  });
});
