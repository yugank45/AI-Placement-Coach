import request from 'supertest';
import { createApp } from '../src/app';
import * as skillService from '../src/services/skillService';
import { authHeader, TEST_USER_ID, TEST_SKILL_ID } from './setup';

jest.mock('../src/services/skillService');

const app = createApp();
const mockSkillService = skillService as jest.Mocked<typeof skillService>;

const mockSkill = {
  id: TEST_SKILL_ID,
  userId: TEST_USER_ID,
  name: 'TypeScript',
  currentLevel: 5,
  requiredLevel: 8,
  category: 'core',
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('GET /api/skills', () => {
  it('returns a list of skills', async () => {
    mockSkillService.listSkills.mockResolvedValue([mockSkill]);

    const res = await request(app)
      .get('/api/skills')
      .set('Authorization', authHeader(TEST_USER_ID));

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0].name).toBe('TypeScript');
  });

  it('returns 401 without token', async () => {
    const res = await request(app).get('/api/skills');
    expect(res.status).toBe(401);
  });
});

describe('GET /api/skills/:id', () => {
  it('returns a single skill by ID', async () => {
    mockSkillService.getSkill.mockResolvedValue(mockSkill);

    const res = await request(app)
      .get(`/api/skills/${TEST_SKILL_ID}`)
      .set('Authorization', authHeader(TEST_USER_ID));

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(TEST_SKILL_ID);
  });

  it('returns 404 when skill not found', async () => {
    const { AppError } = await import('../src/middleware/errorHandler');
    mockSkillService.getSkill.mockRejectedValue(new AppError(404, 'Skill not found'));

    const res = await request(app)
      .get('/api/skills/non-existent-id')
      .set('Authorization', authHeader(TEST_USER_ID));

    expect(res.status).toBe(404);
  });
});

describe('POST /api/skills', () => {
  it('creates and returns a new skill', async () => {
    mockSkillService.createSkill.mockResolvedValue(mockSkill);

    const res = await request(app)
      .post('/api/skills')
      .set('Authorization', authHeader(TEST_USER_ID))
      .send({
        name: 'TypeScript',
        currentLevel: 5,
        requiredLevel: 8,
        category: 'core',
      });

    expect(res.status).toBe(201);
    expect(res.body.name).toBe('TypeScript');
  });

  it('returns 422 when name is missing', async () => {
    const res = await request(app)
      .post('/api/skills')
      .set('Authorization', authHeader(TEST_USER_ID))
      .send({ currentLevel: 5, requiredLevel: 8, category: 'core' });

    expect(res.status).toBe(422);
  });

  it('returns 422 when category is invalid', async () => {
    const res = await request(app)
      .post('/api/skills')
      .set('Authorization', authHeader(TEST_USER_ID))
      .send({ name: 'TypeScript', currentLevel: 5, requiredLevel: 8, category: 'invalid' });

    expect(res.status).toBe(422);
  });

  it('returns 422 when level is out of range', async () => {
    const res = await request(app)
      .post('/api/skills')
      .set('Authorization', authHeader(TEST_USER_ID))
      .send({ name: 'TypeScript', currentLevel: 15, requiredLevel: 8, category: 'core' });

    expect(res.status).toBe(422);
  });
});

describe('PUT /api/skills/:id', () => {
  it('updates and returns the skill', async () => {
    const updated = { ...mockSkill, currentLevel: 7 };
    mockSkillService.updateSkill.mockResolvedValue(updated);

    const res = await request(app)
      .put(`/api/skills/${TEST_SKILL_ID}`)
      .set('Authorization', authHeader(TEST_USER_ID))
      .send({ currentLevel: 7 });

    expect(res.status).toBe(200);
    expect(res.body.currentLevel).toBe(7);
  });

  it('returns 404 when skill not found', async () => {
    const { AppError } = await import('../src/middleware/errorHandler');
    mockSkillService.updateSkill.mockRejectedValue(new AppError(404, 'Skill not found'));

    const res = await request(app)
      .put('/api/skills/non-existent')
      .set('Authorization', authHeader(TEST_USER_ID))
      .send({ currentLevel: 7 });

    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/skills/:id', () => {
  it('returns 204 on successful deletion', async () => {
    mockSkillService.deleteSkill.mockResolvedValue(undefined);

    const res = await request(app)
      .delete(`/api/skills/${TEST_SKILL_ID}`)
      .set('Authorization', authHeader(TEST_USER_ID));

    expect(res.status).toBe(204);
  });

  it('returns 404 when skill not found', async () => {
    const { AppError } = await import('../src/middleware/errorHandler');
    mockSkillService.deleteSkill.mockRejectedValue(new AppError(404, 'Skill not found'));

    const res = await request(app)
      .delete('/api/skills/non-existent')
      .set('Authorization', authHeader(TEST_USER_ID));

    expect(res.status).toBe(404);
  });
});
