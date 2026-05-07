import request from 'supertest';
import app from '../../src/app';

// ─── POST /api/auth/register ──────────────────────────────────────────────────

describe('POST /api/auth/register', () => {
  const USER = { email: 'register-test@dus.io', password: 'AuthPass1' };

  it('creates a new user and returns 201', async () => {
    const res = await request(app).post('/api/auth/register').send(USER);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe(USER.email);
    expect(res.body.data.plan).toBe('free');
    expect(res.body.data).not.toHaveProperty('passwordHash');
  });

  it('rejects duplicate email with 409', async () => {
    await request(app).post('/api/auth/register').send(USER);
    const res = await request(app).post('/api/auth/register').send(USER);

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('EMAIL_EXISTS');
  });

  it('rejects weak password with 400', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'weak@dus.io', password: 'short' });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('rejects invalid email format with 400', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'not-an-email', password: 'StrongPass1' });

    expect(res.status).toBe(400);
  });

  it('rejects missing body fields', async () => {
    const res = await request(app).post('/api/auth/register').send({});
    expect(res.status).toBe(400);
  });
});

// ─── POST /api/auth/login ─────────────────────────────────────────────────────

describe('POST /api/auth/login', () => {
  const USER = { email: 'login-test@dus.io', password: 'LoginPass1' };

  // Register once for this suite
  beforeAll(async () => {
    await request(app).post('/api/auth/register').send(USER);
  });

  it('returns access and refresh tokens on valid credentials', async () => {
    const res = await request(app).post('/api/auth/login').send(USER);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('accessToken');
    expect(res.body.data).toHaveProperty('refreshToken');
  });

  it('returns 401 for wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: USER.email, password: 'WrongPass1' });

    expect(res.status).toBe(401);
    expect(res.body.error.message).toBe('Invalid credentials');
  });

  it('returns 401 for non-existent user — same message (prevents enumeration)', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@dus.io', password: 'SomePass1' });

    expect(res.status).toBe(401);
    expect(res.body.error.message).toBe('Invalid credentials');
  });
});

// ─── POST /api/auth/refresh ───────────────────────────────────────────────────

describe('POST /api/auth/refresh', () => {
  const USER = { email: 'refresh-test@dus.io', password: 'RefreshPass1' };
  let refreshToken: string;

  beforeAll(async () => {
    const regRes = await request(app).post('/api/auth/register').send(USER);
    // Accept 201 (new) or 409 (already exists from another test)
    if (regRes.status !== 201 && regRes.status !== 409) {
      throw new Error(`Register failed: ${JSON.stringify(regRes.body)}`);
    }
    const loginRes = await request(app).post('/api/auth/login').send(USER);
    if (!loginRes.body.data?.refreshToken) {
      throw new Error(`Login failed: ${JSON.stringify(loginRes.body)}`);
    }
    refreshToken = loginRes.body.data.refreshToken;
  });

  it('issues new tokens with a valid refresh token', async () => {
    const res = await request(app)
      .post('/api/auth/refresh')
      .send({ refreshToken });

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('accessToken');
  });

  it('rejects invalid refresh token with 401', async () => {
    const res = await request(app)
      .post('/api/auth/refresh')
      .send({ refreshToken: 'invalid.token.here' });

    expect(res.status).toBe(401);
  });
});

// ─── DELETE /api/auth/logout ──────────────────────────────────────────────────

describe('DELETE /api/auth/logout', () => {
  it('returns 200 (stateless — client discards token)', async () => {
    const res = await request(app).delete('/api/auth/logout');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
