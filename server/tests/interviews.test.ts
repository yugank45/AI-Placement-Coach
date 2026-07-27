import request from 'supertest';
import { createApp } from '../src/app';
import * as interviewService from '../src/services/interviewService';
import { authHeader, TEST_USER_ID, TEST_SESSION_ID } from './setup';

jest.mock('../src/services/interviewService');

const app = createApp();
const mock = interviewService as jest.Mocked<typeof interviewService>;

const mockSession = {
  id: TEST_SESSION_ID,
  userId: TEST_USER_ID,
  date: '2024-10-10',
  role: 'Frontend Engineer',
  question: 'Explain the virtual DOM.',
  score: 85,
  feedback: 'Good explanation.',
  status: 'completed',
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('GET /api/interviews', () => {
  it('returns a list of interview sessions', async () => {
    mock.listInterviews.mockResolvedValue([mockSession]);

    const res = await request(app)
      .get('/api/interviews')
      .set('Authorization', authHeader(TEST_USER_ID));

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].role).toBe('Frontend Engineer');
  });

  it('returns 401 without a token', async () => {
    const res = await request(app).get('/api/interviews');
    expect(res.status).toBe(401);
  });
});

describe('GET /api/interviews/:id', () => {
  it('returns a single interview session', async () => {
    mock.getInterview.mockResolvedValue(mockSession);

    const res = await request(app)
      .get(`/api/interviews/${TEST_SESSION_ID}`)
      .set('Authorization', authHeader(TEST_USER_ID));

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(TEST_SESSION_ID);
  });

  it('returns 404 when session not found', async () => {
    const { AppError } = await import('../src/middleware/errorHandler');
    mock.getInterview.mockRejectedValue(new AppError(404, 'Interview session not found'));

    const res = await request(app)
      .get('/api/interviews/bad-id')
      .set('Authorization', authHeader(TEST_USER_ID));

    expect(res.status).toBe(404);
  });
});

describe('POST /api/interviews', () => {
  it('creates and returns a new interview session', async () => {
    mock.createInterview.mockResolvedValue(mockSession);

    const res = await request(app)
      .post('/api/interviews')
      .set('Authorization', authHeader(TEST_USER_ID))
      .send({
        date: '2024-10-10',
        role: 'Frontend Engineer',
        question: 'Explain the virtual DOM.',
        score: 85,
        feedback: 'Good explanation.',
        status: 'completed',
      });

    expect(res.status).toBe(201);
    expect(res.body.score).toBe(85);
  });

  it('returns 422 when required fields are missing', async () => {
    const res = await request(app)
      .post('/api/interviews')
      .set('Authorization', authHeader(TEST_USER_ID))
      .send({ score: 85 });

    expect(res.status).toBe(422);
  });

  it('returns 422 when score is out of range', async () => {
    const res = await request(app)
      .post('/api/interviews')
      .set('Authorization', authHeader(TEST_USER_ID))
      .send({
        date: '2024-10-10',
        role: 'Engineer',
        question: 'Question?',
        score: 150,
      });

    expect(res.status).toBe(422);
  });

  it('returns 422 when status is invalid', async () => {
    const res = await request(app)
      .post('/api/interviews')
      .set('Authorization', authHeader(TEST_USER_ID))
      .send({
        date: '2024-10-10',
        role: 'Engineer',
        question: 'Question?',
        status: 'unknown_status',
      });

    expect(res.status).toBe(422);
  });
});

describe('PUT /api/interviews/:id', () => {
  it('updates and returns the session', async () => {
    const updated = { ...mockSession, score: 90 };
    mock.updateInterview.mockResolvedValue(updated);

    const res = await request(app)
      .put(`/api/interviews/${TEST_SESSION_ID}`)
      .set('Authorization', authHeader(TEST_USER_ID))
      .send({ score: 90 });

    expect(res.status).toBe(200);
    expect(res.body.score).toBe(90);
  });
});

describe('DELETE /api/interviews/:id', () => {
  it('returns 204 on success', async () => {
    mock.deleteInterview.mockResolvedValue(undefined);

    const res = await request(app)
      .delete(`/api/interviews/${TEST_SESSION_ID}`)
      .set('Authorization', authHeader(TEST_USER_ID));

    expect(res.status).toBe(204);
  });

  it('returns 404 when session not found', async () => {
    const { AppError } = await import('../src/middleware/errorHandler');
    mock.deleteInterview.mockRejectedValue(new AppError(404, 'Interview session not found'));

    const res = await request(app)
      .delete('/api/interviews/bad-id')
      .set('Authorization', authHeader(TEST_USER_ID));

    expect(res.status).toBe(404);
  });
});
