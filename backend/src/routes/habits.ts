import type { FastifyRequest, FastifyReply } from 'fastify';
import { eq, and, count } from 'drizzle-orm';
import * as schema from '../db/schema.js';
import type { App } from '../index.js';
import { randomUUID } from 'node:crypto';

export function registerHabitsRoutes(app: App) {
  const requireAuth = app.requireAuth();

  // POST /habits - Create new habit
  app.fastify.post<{ Body: { name: string; minimumAction: string; emoji?: string } }>(
    '/api/habits',
    {
      schema: {
        description: 'Create a new habit',
        tags: ['habits'],
        body: {
          type: 'object',
          required: ['name', 'minimumAction'],
          properties: {
            name: { type: 'string' },
            minimumAction: { type: 'string' },
            emoji: { type: 'string' },
          },
        },
        response: {
          201: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              minimumAction: { type: 'string' },
              emoji: { type: ['string', 'null'] },
              isActive: { type: 'boolean' },
              createdAt: { type: 'string' },
            },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const session = await requireAuth(request, reply);
      if (!session) return;

      const body = request.body as { name: string; minimumAction: string; emoji?: string };
      const { name, minimumAction, emoji } = body;
      const userId = session.user.id;

      // Check if user already has 3 active habits
      const [activeCount] = await app.db
        .select({ count: count() })
        .from(schema.habits)
        .where(and(eq(schema.habits.userId, userId), eq(schema.habits.isActive, true)));

      if (activeCount.count >= 3) {
        return reply.status(400).send({
          error: 'Maximum of 3 active habits allowed',
        });
      }

      const habitId = randomUUID();
      const [habit] = await app.db
        .insert(schema.habits)
        .values({
          id: habitId,
          userId,
          name,
          minimumAction,
          emoji: emoji || null,
          isActive: true,
        })
        .returning();

      return reply.status(201).send(habit);
    }
  );

  // GET /habits - Get user's active habits
  app.fastify.get(
    '/api/habits',
    {
      schema: {
        description: 'Get user active habits',
        tags: ['habits'],
        response: {
          200: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                name: { type: 'string' },
                minimumAction: { type: 'string' },
                emoji: { type: ['string', 'null'] },
                isActive: { type: 'boolean' },
                createdAt: { type: 'string' },
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

      const habits = await app.db
        .select()
        .from(schema.habits)
        .where(and(eq(schema.habits.userId, userId), eq(schema.habits.isActive, true)));

      return reply.send(habits);
    }
  );

  // PATCH /habits/:id - Update habit
  app.fastify.patch<{
    Params: { id: string };
    Body: { name?: string; minimumAction?: string; emoji?: string | null };
  }>(
    '/api/habits/:id',
    {
      schema: {
        description: 'Update a habit',
        tags: ['habits'],
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'string' },
          },
        },
        body: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            minimumAction: { type: 'string' },
            emoji: { type: ['string', 'null'] },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              minimumAction: { type: 'string' },
              emoji: { type: ['string', 'null'] },
              isActive: { type: 'boolean' },
              createdAt: { type: 'string' },
            },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const session = await requireAuth(request, reply);
      if (!session) return;

      const params = request.params as { id: string };
      const { id } = params;
      const body = request.body as { name?: string; minimumAction?: string; emoji?: string | null };
      const { name, minimumAction, emoji } = body;
      const userId = session.user.id;

      // Verify habit belongs to user
      const habit = await app.db
        .select()
        .from(schema.habits)
        .where(and(eq(schema.habits.id, id), eq(schema.habits.userId, userId)))
        .then((h) => h[0]);

      if (!habit) {
        return reply.status(404).send({ error: 'Habit not found' });
      }

      const updates: any = {};
      if (name !== undefined) updates.name = name;
      if (minimumAction !== undefined) updates.minimumAction = minimumAction;
      if (emoji !== undefined) updates.emoji = emoji;

      const [updated] = await app.db
        .update(schema.habits)
        .set(updates)
        .where(eq(schema.habits.id, id))
        .returning();

      return reply.send(updated);
    }
  );

  // DELETE /habits/:id - Soft delete habit
  app.fastify.delete<{ Params: { id: string } }>(
    '/api/habits/:id',
    {
      schema: {
        description: 'Soft delete a habit',
        tags: ['habits'],
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'string' },
          },
        },
        response: {
          204: { type: 'null' },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const session = await requireAuth(request, reply);
      if (!session) return;

      const params = request.params as { id: string };
      const { id } = params;
      const userId = session.user.id;

      // Verify habit belongs to user
      const habit = await app.db
        .select()
        .from(schema.habits)
        .where(and(eq(schema.habits.id, id), eq(schema.habits.userId, userId)))
        .then((h) => h[0]);

      if (!habit) {
        return reply.status(404).send({ error: 'Habit not found' });
      }

      await app.db
        .update(schema.habits)
        .set({ isActive: false })
        .where(eq(schema.habits.id, id));

      return reply.status(204).send();
    }
  );
}
