import request from 'supertest';
import app from '../../src/app';

const USER = { email: `analytics-test-${Date.now()}@dus.io`, password: 'AnalyticsPass1' };
let accessToken: string;
let testShortCode: string;

beforeAll(async () => {
  await request(app).post('/api/auth/register').send(USER);
  const loginRes = await request(app).post('/api/auth/login').send(USER);
  accessToken = loginRes.body.data.accessToken;

  const shortenRes = await request(app)
    .post('/api/urls')
    .set('Authorization', `Bearer ${accessToken}`)
    .send({ originalUrl: 'https://example.com/analytics-test' });

  testShortCode = shortenRes.body.data.shortCode;
});

// ─── GET /api/analytics/:shortCode ───────────────────────────────────────────

describe('GET /api/analytics/:shortCode', () => {
  it('returns stats object for an owned URL', async () => {
    const res = await request(app)
      .get(`/api/analytics/${testShortCode}`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    // API returns { total, last7Days, last30Days }
    expect(res.body.data).toHaveProperty('total');
    expect(typeof res.body.data.total).toBe('number');
  });

  it('returns 401 without auth', async () => {
    const res = await request(app).get(`/api/analytics/${testShortCode}`);
    expect(res.status).toBe(401);
  });

  it('returns 404 for non-existent short code', async () => {
    const res = await request(app)
      .get('/api/analytics/nonexistent999')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(404);
  });
});

// ─── GET /api/analytics/:shortCode/geo ───────────────────────────────────────

describe('GET /api/analytics/:shortCode/geo', () => {
  it('returns 401 without auth', async () => {
    const res = await request(app).get(`/api/analytics/${testShortCode}/geo`);
    expect(res.status).toBe(401);
  });

  it('returns 200 or 404 (no clicks yet so no geo data may exist)', async () => {
    const res = await request(app)
      .get(`/api/analytics/${testShortCode}/geo`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect([200, 404]).toContain(res.status);
    if (res.status === 200) {
      expect(Array.isArray(res.body.data)).toBe(true);
    }
  });
});

// ─── GET /api/analytics/:shortCode/time ──────────────────────────────────────

describe('GET /api/analytics/:shortCode/time', () => {
  it('returns 401 without auth', async () => {
    const res = await request(app).get(`/api/analytics/${testShortCode}/time`);
    expect(res.status).toBe(401);
  });

  it('returns 200 or 404 (no clicks yet so no time-series data may exist)', async () => {
    const res = await request(app)
      .get(`/api/analytics/${testShortCode}/time`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect([200, 404]).toContain(res.status);
    if (res.status === 200) {
      expect(Array.isArray(res.body.data)).toBe(true);
    }
  });
});
