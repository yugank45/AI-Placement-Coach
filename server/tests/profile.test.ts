import request from 'supertest';
import { createApp } from '../src/app';
import * as profileService from '../src/services/profileService';
import { authHeader, TEST_USER_ID } from './setup';

jest.mock('../src/services/profileService');

const app = createApp();
const mockProfileService = profileService as jest.Mocked<typeof profileService>;

const mockProfile = {
  id: 'prof-001',
  userId: TEST_USER_ID,
  name: 'Arjun Mehta',
  university: 'Indian Institute of Technology',
  targetRole: 'Frontend Engineer',
  readinessScore: 78,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('GET /api/profile', () => {
  it('returns the user profile when authenticated', async () => {
    mockProfileService.getProfile.mockResolvedValue(mockProfile);

    const res = await request(app)
      .get('/api/profile')
      .set('Authorization', authHeader(TEST_USER_ID));

    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Arjun Mehta');
    expect(res.body.readinessScore).toBe(78);
  });

  it('returns 401 without token', async () => {
    const res = await request(app).get('/api/profile');
    expect(res.status).toBe(401);
  });

  it('returns 404 when profile does not exist', async () => {
    const { AppError } = await import('../src/middleware/errorHandler');
    mockProfileService.getProfile.mockRejectedValue(new AppError(404, 'Profile not found'));

    const res = await request(app)
      .get('/api/profile')
      .set('Authorization', authHeader(TEST_USER_ID));

    expect(res.status).toBe(404);
  });
});

describe('PUT /api/profile', () => {
  it('updates and returns the profile', async () => {
    const updated = { ...mockProfile, targetRole: 'Fullstack Engineer', readinessScore: 85 };
    mockProfileService.updateProfile.mockResolvedValue(updated);

    const res = await request(app)
      .put('/api/profile')
      .set('Authorization', authHeader(TEST_USER_ID))
      .send({ targetRole: 'Fullstack Engineer', readinessScore: 85 });

    expect(res.status).toBe(200);
    expect(res.body.targetRole).toBe('Fullstack Engineer');
    expect(res.body.readinessScore).toBe(85);
  });

  it('returns 422 when readinessScore is out of range', async () => {
    const res = await request(app)
      .put('/api/profile')
      .set('Authorization', authHeader(TEST_USER_ID))
      .send({ readinessScore: 150 });

    expect(res.status).toBe(422);
  });

  it('returns 422 when name is blank', async () => {
    const res = await request(app)
      .put('/api/profile')
      .set('Authorization', authHeader(TEST_USER_ID))
      .send({ name: '   ' });

    expect(res.status).toBe(422);
  });
});
