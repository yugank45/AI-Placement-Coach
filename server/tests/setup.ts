/**
 * Global test helpers.
 *
 * All service modules are auto-mocked by Jest in the individual test files
 * using `jest.mock('../src/services/...')`.  This file provides shared
 * token and fixture factories used across the test suite.
 */

import jwt from 'jsonwebtoken';

// Use a fixed secret so tests never depend on the process env
export const TEST_SECRET = 'test-jwt-secret-at-least-32-chars!!';

/**
 * Creates a signed JWT for the given userId, using the test secret.
 */
export function makeToken(userId: string): string {
  return jwt.sign({ userId }, TEST_SECRET, { expiresIn: '1h' });
}

/** Bearer string ready to be passed as an Authorization header value. */
export function authHeader(userId: string): string {
  return `Bearer ${makeToken(userId)}`;
}

/** Stable UUIDs for use across tests */
export const TEST_USER_ID = 'aaaaaaaa-0000-0000-0000-000000000001';
export const TEST_SKILL_ID = 'bbbbbbbb-0000-0000-0000-000000000002';
export const TEST_SESSION_ID = 'cccccccc-0000-0000-0000-000000000003';
export const TEST_JOB_ID = 'dddddddd-0000-0000-0000-000000000004';
export const TEST_PROGRESS_ID = 'eeeeeeee-0000-0000-0000-000000000005';

// Make the test secret available to the auth middleware
process.env.JWT_SECRET = TEST_SECRET;
process.env.NODE_ENV = 'test';
