import {
  pgTable,
  uuid,
  varchar,
  integer,
  boolean,
  text,
  jsonb,
  timestamp,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ─── Users ────────────────────────────────────────────────────────────────────

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ─── Profiles ─────────────────────────────────────────────────────────────────

export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .unique()
    .notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  university: varchar('university', { length: 255 }),
  targetRole: varchar('target_role', { length: 255 }),
  readinessScore: integer('readiness_score').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ─── Skills ───────────────────────────────────────────────────────────────────

export const skills = pgTable('skills', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  /** 0–10 */
  currentLevel: integer('current_level').notNull(),
  /** 0–10 */
  requiredLevel: integer('required_level').notNull(),
  /** 'core' | 'framework' | 'soft' | 'tool' */
  category: varchar('category', { length: 50 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ─── Resume Analyses ──────────────────────────────────────────────────────────

export const resumeAnalyses = pgTable('resume_analyses', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .unique()
    .notNull(),
  /** 0–100 */
  atsScore: integer('ats_score').notNull(),
  /** string[] */
  extractedSkills: jsonb('extracted_skills').$type<string[]>().default([]).notNull(),
  /** { skill: string; reason: string }[] */
  gaps: jsonb('gaps')
    .$type<{ skill: string; reason: string }[]>()
    .default([])
    .notNull(),
  /** { title: string; url: string; duration: string }[] */
  recommendedCourses: jsonb('recommended_courses')
    .$type<{ title: string; url: string; duration: string }[]>()
    .default([])
    .notNull(),
  fileName: varchar('file_name', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ─── Interview Sessions ────────────────────────────────────────────────────────

export const interviewSessions = pgTable('interview_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  date: varchar('date', { length: 50 }).notNull(),
  role: varchar('role', { length: 255 }).notNull(),
  question: text('question').notNull(),
  /** 0–100 */
  score: integer('score'),
  feedback: text('feedback'),
  /** 'completed' | 'in_progress' */
  status: varchar('status', { length: 20 }).default('in_progress').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ─── Job Postings ─────────────────────────────────────────────────────────────

export const jobPostings = pgTable('job_postings', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  company: varchar('company', { length: 255 }).notNull(),
  role: varchar('role', { length: 255 }).notNull(),
  location: varchar('location', { length: 255 }),
  remote: boolean('remote').default(false).notNull(),
  /** 0–100 */
  fitScore: integer('fit_score').default(0).notNull(),
  /** 'saved' | 'applied' | 'interviewing' | 'offer' */
  status: varchar('status', { length: 20 }).default('saved').notNull(),
  salary: varchar('salary', { length: 100 }),
  logoUrl: varchar('logo_url', { length: 500 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ─── Progress Points ──────────────────────────────────────────────────────────

export const progressPoints = pgTable('progress_points', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  date: varchar('date', { length: 50 }).notNull(),
  /** 0–100 */
  readiness: integer('readiness').notNull(),
  interviews: integer('interviews').default(0).notNull(),
  applications: integer('applications').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ─── Relations ────────────────────────────────────────────────────────────────

export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(profiles, { fields: [users.id], references: [profiles.userId] }),
  skills: many(skills),
  resumeAnalysis: one(resumeAnalyses, { fields: [users.id], references: [resumeAnalyses.userId] }),
  interviewSessions: many(interviewSessions),
  jobPostings: many(jobPostings),
  progressPoints: many(progressPoints),
}));

export const profilesRelations = relations(profiles, ({ one }) => ({
  user: one(users, { fields: [profiles.userId], references: [users.id] }),
}));

export const skillsRelations = relations(skills, ({ one }) => ({
  user: one(users, { fields: [skills.userId], references: [users.id] }),
}));

export const resumeAnalysesRelations = relations(resumeAnalyses, ({ one }) => ({
  user: one(users, { fields: [resumeAnalyses.userId], references: [users.id] }),
}));

export const interviewSessionsRelations = relations(interviewSessions, ({ one }) => ({
  user: one(users, { fields: [interviewSessions.userId], references: [users.id] }),
}));

export const jobPostingsRelations = relations(jobPostings, ({ one }) => ({
  user: one(users, { fields: [jobPostings.userId], references: [users.id] }),
}));

export const progressPointsRelations = relations(progressPoints, ({ one }) => ({
  user: one(users, { fields: [progressPoints.userId], references: [users.id] }),
}));

// ─── Exported schema map (used by drizzle-kit) ────────────────────────────────

export const schema = {
  users,
  profiles,
  skills,
  resumeAnalyses,
  interviewSessions,
  jobPostings,
  progressPoints,
};
