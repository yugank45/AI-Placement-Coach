import request from 'supertest';
import { createApp } from '../src/app';
import * as progressService from '../src/services/progressService';
import { authHeader, TEST_USER_ID, TEST_PROGRESS_ID } from './setup';

jest.mock('../src/services/progressService');

const app = createApp();
const mock = progressService as jest.Mocked<typeof progressService>;

const mockPoint = {
  id: TEST_PROGRESS_ID,
  userId: TEST_USER_ID,
  date: 'Oct',
  readiness: 78,
  interviews: 6,
  applications: 12,
  createdAt: new Date(),
};

describe('GET /api/progress', () => {
  it('returns a list of progress points', async () => {
    mock.listProgress.mockResolvedValue([mockPoint]);

    const res = await request(app)
      .get('/api/progress')
      .set('Authorization', authHeader(TEST_USER_ID));

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].readiness).toBe(78);
  });

  it('returns 401 without a token', async () => {
    const res = await request(app).get('/api/progress');
    expect(res.status).toBe(401);
  });
});

describe('POST /api/progress', () => {
  it('creates and returns a new progress point', async () => {
    mock.createProgress.mockResolvedValue(mockPoint);

    const res = await request(app)
      .post('/api/progress')
      .set('Authorization', authHeader(TEST_USER_ID))
      .send({ date: 'Oct', readiness: 78, interviews: 6, applications: 12 });

    expect(res.status).toBe(201);
    expect(res.body.readiness).toBe(78);
  });

  it('returns 422 when readiness is missing', async () => {
    const res = await request(app)
      .post('/api/progress')
      .set('Authorization', authHeader(TEST_USER_ID))
      .send({ date: 'Oct' });

    expect(res.status).toBe(422);
  });

  it('returns 422 when readiness is out of range', async () => {
    const res = await request(app)
      .post('/api/progress')
      .set('Authorization', authHeader(TEST_USER_ID))
      .send({ date: 'Oct', readiness: 120 });

    expect(res.status).toBe(422);
  });

  it('returns 422 when date is missing', async () => {
    const res = await request(app)
      .post('/api/progress')
      .set('Authorization', authHeader(TEST_USER_ID))
      .send({ readiness: 78 });

    expect(res.status).toBe(422);
  });
});

describe('DELETE /api/progress/:id', () => {
  it('returns 204 on success', async () => {
    mock.deleteProgress.mockResolvedValue(undefined);

    const res = await request(app)
      .delete(`/api/progress/${TEST_PROGRESS_ID}`)
      .set('Authorization', authHeader(TEST_USER_ID));

    expect(res.status).toBe(204);
  });

  it('returns 404 when point not found', async () => {
    const { AppError } = await import('../src/middleware/errorHandler');
    mock.deleteProgress.mockRejectedValue(new AppError(404, 'Progress point not found'));

    const res = await request(app)
      .delete('/api/progress/bad-id')
      .set('Authorization', authHeader(TEST_USER_ID));

    expect(res.status).toBe(404);
  });
});
