import request from 'supertest';
import { createApp } from '../src/app';
import * as jobService from '../src/services/jobService';
import { authHeader, TEST_USER_ID, TEST_JOB_ID } from './setup';

jest.mock('../src/services/jobService');

const app = createApp();
const mock = jobService as jest.Mocked<typeof jobService>;

const mockJob = {
  id: TEST_JOB_ID,
  userId: TEST_USER_ID,
  company: 'Razorpay',
  role: 'Frontend Engineer - SDE 1',
  location: 'Bengaluru',
  remote: false,
  fitScore: 92,
  status: 'saved',
  salary: '18-24 LPA',
  logoUrl: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('GET /api/jobs', () => {
  it('returns a list of jobs', async () => {
    mock.listJobs.mockResolvedValue([mockJob]);

    const res = await request(app)
      .get('/api/jobs')
      .set('Authorization', authHeader(TEST_USER_ID));

    expect(res.status).toBe(200);
    expect(res.body[0].company).toBe('Razorpay');
  });

  it('filters by status when query param is provided', async () => {
    mock.listJobs.mockResolvedValue([mockJob]);

    const res = await request(app)
      .get('/api/jobs?status=saved')
      .set('Authorization', authHeader(TEST_USER_ID));

    expect(res.status).toBe(200);
    expect(mock.listJobs).toHaveBeenCalledWith(TEST_USER_ID, 'saved');
  });

  it('returns 422 when status filter is invalid', async () => {
    const res = await request(app)
      .get('/api/jobs?status=unknown')
      .set('Authorization', authHeader(TEST_USER_ID));

    expect(res.status).toBe(422);
  });

  it('returns 401 without a token', async () => {
    const res = await request(app).get('/api/jobs');
    expect(res.status).toBe(401);
  });
});

describe('GET /api/jobs/:id', () => {
  it('returns a single job', async () => {
    mock.getJob.mockResolvedValue(mockJob);

    const res = await request(app)
      .get(`/api/jobs/${TEST_JOB_ID}`)
      .set('Authorization', authHeader(TEST_USER_ID));

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(TEST_JOB_ID);
  });

  it('returns 404 when job not found', async () => {
    const { AppError } = await import('../src/middleware/errorHandler');
    mock.getJob.mockRejectedValue(new AppError(404, 'Job not found'));

    const res = await request(app)
      .get('/api/jobs/no-such-job')
      .set('Authorization', authHeader(TEST_USER_ID));

    expect(res.status).toBe(404);
  });
});

describe('POST /api/jobs', () => {
  it('creates and returns a new job', async () => {
    mock.createJob.mockResolvedValue(mockJob);

    const res = await request(app)
      .post('/api/jobs')
      .set('Authorization', authHeader(TEST_USER_ID))
      .send({
        company: 'Razorpay',
        role: 'Frontend Engineer - SDE 1',
        location: 'Bengaluru',
        fitScore: 92,
        status: 'saved',
        salary: '18-24 LPA',
      });

    expect(res.status).toBe(201);
    expect(res.body.fitScore).toBe(92);
  });

  it('returns 422 when company is missing', async () => {
    const res = await request(app)
      .post('/api/jobs')
      .set('Authorization', authHeader(TEST_USER_ID))
      .send({ role: 'Engineer' });

    expect(res.status).toBe(422);
  });

  it('returns 422 when fitScore is out of range', async () => {
    const res = await request(app)
      .post('/api/jobs')
      .set('Authorization', authHeader(TEST_USER_ID))
      .send({ company: 'ACME', role: 'Engineer', fitScore: 150 });

    expect(res.status).toBe(422);
  });
});

describe('PATCH /api/jobs/:id/status', () => {
  it('updates and returns only the status', async () => {
    const updated = { ...mockJob, status: 'applied' };
    mock.updateJobStatus.mockResolvedValue(updated);

    const res = await request(app)
      .patch(`/api/jobs/${TEST_JOB_ID}/status`)
      .set('Authorization', authHeader(TEST_USER_ID))
      .send({ status: 'applied' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('applied');
  });

  it('returns 422 when status is invalid', async () => {
    const res = await request(app)
      .patch(`/api/jobs/${TEST_JOB_ID}/status`)
      .set('Authorization', authHeader(TEST_USER_ID))
      .send({ status: 'rejected' }); // not a valid status

    expect(res.status).toBe(422);
  });
});

describe('DELETE /api/jobs/:id', () => {
  it('returns 204 on success', async () => {
    mock.deleteJob.mockResolvedValue(undefined);

    const res = await request(app)
      .delete(`/api/jobs/${TEST_JOB_ID}`)
      .set('Authorization', authHeader(TEST_USER_ID));

    expect(res.status).toBe(204);
  });
});
