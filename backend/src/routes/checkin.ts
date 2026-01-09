import type { FastifyRequest, FastifyReply } from 'fastify';
import { eq, and } from 'drizzle-orm';
import * as schema from '../db/schema.js';
import type { App } from '../index.js';
import { randomUUID } from 'node:crypto';

function getDateOnly(date: Date): Date {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

function calculateXpInfo(totalXp: number) {
  const level = Math.floor(totalXp / 50) + 1;
  const xpForCurrentLevel = (level - 1) * 50;
  const xpForNextLevel = level * 50;
  const xpInCurrentLevel = totalXp - xpForCurrentLevel;
  const xpNeededForNextLevel = xpForNextLevel - xpForCurrentLevel;
  const progressToNextLevel = Math.round((xpInCurrentLevel / xpNeededForNextLevel) * 100);

  return {
    level,
    totalXp,
    progressToNextLevel,
  };
}

export function registerCheckinRoutes(app: App) {
  const requireAuth = app.requireAuth();

  // POST /checkin - Complete daily check-in
  app.fastify.post(
    '/api/checkin',
    {
      schema: {
        description: 'Complete daily check-in',
        tags: ['checkin'],
        response: {
          200: {
            type: 'object',
            properties: {
              currentStreak: { type: 'integer' },
              longestStreak: { type: 'integer' },
              level: { type: 'integer' },
              totalXp: { type: 'integer' },
              progressToNextLevel: { type: 'integer' },
              totalDaysCompleted: { type: 'integer' },
              xpAwarded: { type: 'integer' },
            },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const session = await requireAuth(request, reply);
      if (!session) return;

      const userId = session.user.id;
      const today = getDateOnly(new Date());

      // Check if already checked in today
      const existingCheckin = await app.db
        .select()
        .from(schema.dailyCheckins)
        .where(
          and(
            eq(schema.dailyCheckins.userId, userId),
            eq(schema.dailyCheckins.checkinDate, today)
          )
        )
        .then((c) => c[0]);

      if (existingCheckin) {
        return reply.status(400).send({
          error: 'Already checked in today',
        });
      }

      // Get or create user progress
      let progress = await app.db
        .select()
        .from(schema.userProgress)
        .where(eq(schema.userProgress.userId, userId))
        .then((p) => p[0]);

      if (!progress) {
        // Create new progress record
        const progressId = randomUUID();
        progress = {
          id: progressId,
          userId,
          currentStreak: 0,
          longestStreak: 0,
          totalXp: 0,
          currentLevel: 1,
          totalDaysCompleted: 0,
          lastCheckinDate: null,
        };
        await app.db.insert(schema.userProgress).values(progress);
      }

      // Calculate new streak
      let newStreak = 1;
      if (progress.lastCheckinDate) {
        const lastCheckin = getDateOnly(new Date(progress.lastCheckinDate));
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday.setUTCHours(0, 0, 0, 0);

        if (lastCheckin.getTime() === yesterday.getTime()) {
          // Yesterday was checked in
          newStreak = progress.currentStreak + 1;
        } else {
          // Gap detected, reset to 1
          newStreak = 1;
        }
      }

      // Award 10 XP per check-in
      const xpAwarded = 10;
      const newTotalXp = progress.totalXp + xpAwarded;
      const newLevel = Math.floor(newTotalXp / 50) + 1;

      // Update longest streak if applicable
      const newLongestStreak = Math.max(progress.longestStreak, newStreak);

      // Insert check-in record
      const checkinId = randomUUID();
      await app.db.insert(schema.dailyCheckins).values({
        id: checkinId,
        userId,
        checkinDate: today,
        completedAt: new Date(),
      });

      // Update progress
      const [updatedProgress] = await app.db
        .update(schema.userProgress)
        .set({
          currentStreak: newStreak,
          longestStreak: newLongestStreak,
          totalXp: newTotalXp,
          currentLevel: newLevel,
          totalDaysCompleted: progress.totalDaysCompleted + 1,
          lastCheckinDate: today,
        })
        .where(eq(schema.userProgress.userId, userId))
        .returning();

      const xpInfo = calculateXpInfo(updatedProgress.totalXp);

      return reply.send({
        currentStreak: updatedProgress.currentStreak,
        longestStreak: updatedProgress.longestStreak,
        level: xpInfo.level,
        totalXp: xpInfo.totalXp,
        progressToNextLevel: xpInfo.progressToNextLevel,
        totalDaysCompleted: updatedProgress.totalDaysCompleted,
        xpAwarded,
      });
    }
  );
}
