import {
  pgTable,
  text,
  timestamp,
  date,
  integer,
  boolean,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { user } from './auth-schema.js';

export const habits = pgTable(
  'habits',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    minimumAction: text('minimum_action').notNull(),
    emoji: text('emoji'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    isActive: boolean('is_active').default(true).notNull(),
  },
  (table) => [
    uniqueIndex('habits_user_id_idx').on(table.userId, table.id),
  ]
);

export const dailyCheckins = pgTable(
  'daily_checkins',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    checkinDate: date('checkin_date', { mode: 'date' }).notNull(),
    completedAt: timestamp('completed_at').defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('daily_checkins_user_date_idx').on(table.userId, table.checkinDate),
  ]
);

export const userProgress = pgTable('user_progress', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' })
    .unique(),
  currentStreak: integer('current_streak').default(0).notNull(),
  longestStreak: integer('longest_streak').default(0).notNull(),
  totalXp: integer('total_xp').default(0).notNull(),
  currentLevel: integer('current_level').default(1).notNull(),
  totalDaysCompleted: integer('total_days_completed').default(0).notNull(),
  lastCheckinDate: date('last_checkin_date', { mode: 'date' }),
});
