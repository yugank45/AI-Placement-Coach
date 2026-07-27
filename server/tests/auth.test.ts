import request from 'supertest';
import { createApp } from '../src/app';
import * as authService from '../src/services/authService';
import { authHeader, TEST_USER_ID, TEST_SECRET } from './setup';

jest.mock('../src/services/authService');

process.env.JWT_SECRET = TEST_SECRET;

const app = createApp();

const mockAuthService = authService as jest.Mocked<typeof authService>;

describe('POST /api/auth/register', () => {
  it('returns 201 with token on valid input', async () => {
    mockAuthService.registerUser.mockResolvedValue({
      token: 'signed.jwt.token',
      user: { id: TEST_USER_ID, email: 'arjun@iit.ac.in', createdAt: new Date() },
    });

    const res = await request(app).post('/api/auth/register').send({
      email: 'arjun@iit.ac.in',
      password: 'securePass123',
      name: 'Arjun Mehta',
    });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user.email).toBe('arjun@iit.ac.in');
  });

  it('returns 422 when email is invalid', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'not-an-email', password: 'securePass123', name: 'Test' });

    expect(res.status).toBe(422);
    expect(res.body).toHaveProperty('errors');
  });

  it('returns 422 when password is too short', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@test.com', password: 'short', name: 'Test' });

    expect(res.status).toBe(422);
  });

  it('returns 422 when name is missing', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@test.com', password: 'securePass123' });

    expect(res.status).toBe(422);
  });

  it('returns 409 when email is already in use', async () => {
    const { AppError } = await import('../src/middleware/errorHandler');
    mockAuthService.registerUser.mockRejectedValue(new AppError(409, 'Email already in use'));

    const res = await request(app).post('/api/auth/register').send({
      email: 'taken@iit.ac.in',
      password: 'securePass123',
      name: 'Duplicate User',
    });

    expect(res.status).toBe(409);
    expect(res.body.error).toMatch(/already in use/i);
  });
});

describe('POST /api/auth/login', () => {
  it('returns 200 with token on valid credentials', async () => {
    mockAuthService.loginUser.mockResolvedValue({
      token: 'signed.jwt.token',
      user: { id: TEST_USER_ID, email: 'arjun@iit.ac.in', createdAt: new Date() },
    });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'arjun@iit.ac.in', password: 'securePass123' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
  });

  it('returns 401 on wrong credentials', async () => {
    const { AppError } = await import('../src/middleware/errorHandler');
    mockAuthService.loginUser.mockRejectedValue(new AppError(401, 'Invalid email or password'));

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'arjun@iit.ac.in', password: 'wrongPassword' });

    expect(res.status).toBe(401);
  });

  it('returns 422 when email is missing', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ password: 'securePass123' });

    expect(res.status).toBe(422);
  });
});

describe('GET /api/auth/me', () => {
  it('returns 200 with user data when authenticated', async () => {
    mockAuthService.getMe.mockResolvedValue({
      id: TEST_USER_ID,
      email: 'arjun@iit.ac.in',
      createdAt: new Date(),
    });

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', authHeader(TEST_USER_ID));

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(TEST_USER_ID);
  });

  it('returns 401 when no token is provided', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  it('returns 401 when token is invalid', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer invalid.token.here');
    expect(res.status).toBe(401);
  });
});
