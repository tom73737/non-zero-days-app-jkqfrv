import type { FastifyRequest, FastifyReply } from 'fastify';
import { eq, and, gte, desc } from 'drizzle-orm';
import * as schema from '../db/schema.js';
import type { App } from '../index.js';
import { randomUUID } from 'node:crypto';

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

function getDateOnly(date: Date): Date {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

export function registerProgressRoutes(app: App) {
  const requireAuth = app.requireAuth();

  // GET /progress - Get user's current progress
  app.fastify.get(
    '/api/progress',
    {
      schema: {
        description: 'Get user current progress',
        tags: ['progress'],
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
              lastCheckinDate: { type: ['string', 'null'] },
              canCheckinToday: { type: 'boolean' },
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

      // Get or create progress
      let progress = await app.db
        .select()
        .from(schema.userProgress)
        .where(eq(schema.userProgress.userId, userId))
        .then((p) => p[0]);

      if (!progress) {
        // Create new progress record
        const progressId = randomUUID();
        const newProgress = {
          id: progressId,
          userId,
          currentStreak: 0,
          longestStreak: 0,
          totalXp: 0,
          currentLevel: 1,
          totalDaysCompleted: 0,
          lastCheckinDate: null,
        };
        await app.db.insert(schema.userProgress).values(newProgress);
        progress = newProgress;
      }

      const xpInfo = calculateXpInfo(progress.totalXp);

      // Check if already checked in today
      const checkedInToday =
        progress.lastCheckinDate && getDateOnly(new Date(progress.lastCheckinDate)).getTime() === today.getTime();

      return reply.send({
        currentStreak: progress.currentStreak,
        longestStreak: progress.longestStreak,
        level: xpInfo.level,
        totalXp: xpInfo.totalXp,
        progressToNextLevel: xpInfo.progressToNextLevel,
        totalDaysCompleted: progress.totalDaysCompleted,
        lastCheckinDate: progress.lastCheckinDate ? new Date(progress.lastCheckinDate).toISOString() : null,
        canCheckinToday: !checkedInToday,
      });
    }
  );

  // GET /progress/history - Get last 30 days of check-in history
  app.fastify.get(
    '/api/progress/history',
    {
      schema: {
        description: 'Get last 30 days of check-in history',
        tags: ['progress'],
        response: {
          200: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                checkinDate: { type: 'string' },
                completedAt: { type: 'string' },
              },
            },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const session = await requireAuth(request, reply);
      if (!session) return;

      const userId = session.user.id;
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      thirtyDaysAgo.setUTCHours(0, 0, 0, 0);

      const history = await app.db
        .select()
        .from(schema.dailyCheckins)
        .where(
          and(
            eq(schema.dailyCheckins.userId, userId),
            gte(schema.dailyCheckins.checkinDate, thirtyDaysAgo)
          )
        )
        .orderBy(desc(schema.dailyCheckins.checkinDate));

      return reply.send(
        history.map((checkin) => ({
          checkinDate: new Date(checkin.checkinDate).toISOString().split('T')[0],
          completedAt: checkin.completedAt.toISOString(),
        }))
      );
    }
  );
}
