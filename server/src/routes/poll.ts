import { FastifyInstance } from "fastify";
import { z } from "zod";
import ShortUniqueId from "short-unique-id";
import { prisma } from "./lib/prisma";
import { authenticate } from "../plugins/authenticate";

export async function pollRoutes(fastify: FastifyInstance) {
  fastify.get("/pools/count", async () => {
    const count = await prisma.pool.count();

    return { count };
  });

  fastify.post("/pools", async (request, reply) => {
    const createPollBody = z.object({
      title: z.string(),
    });

    const { title } = createPollBody.parse(request.body);
    const generateId = new ShortUniqueId({ length: 4 });
    const code = String(generateId()).toUpperCase();

    try {
      await request.jwtVerify();

      await prisma.pool.create({
        data: {
          code,
          title: title,
          ownerId: request.user.sub,

          participants: {
            create: {
              userId: request.user.sub,
            },
          },
        },
      });
    } catch {
      await prisma.pool.create({
        data: {
          code,
          title: title,
        },
      });
    }

    return reply.status(201).send({
      code,
    });
  });

  fastify.post(
    "/pools/join",
    {
      onRequest: [authenticate],
    },
    async (request, reply) => {
      const joinPollBody = z.object({
        code: z.string(),
      });

      const { code } = joinPollBody.parse(request.body);

      const poll = await prisma.pool.findUnique({
        where: {
          code,
        },
        include: {
          participants: {
            where: {
              userId: request.user.sub,
            },
          },
        },
      });

      if (!poll) {
        return reply.status(400).send({
          message: "Poll not found",
        });
      }

      if (poll.participants.length > 0) {
        return reply.status(400).send({
          message: "You already joined this pull",
        });
      }

      if (!poll.ownerId) {
        await prisma.pool.update({
          where: {
            id: poll.id,
          },
          data: {
            ownerId: request.user.sub,
          },
        });
      }

      await prisma.participant.create({
        data: {
          poolId: poll.id,
          userId: request.user.sub,
        },
      });

      return reply.status(201).send();
    }
  );

  fastify.get(
    "/pools",
    {
      onRequest: [authenticate],
    },
    async (request, reply) => {
      const polls = await prisma.pool.findMany({
        where: {
          participants: {
            some: {
              userId: request.user.sub,
            },
          },
        },
        include: {
          participants: {
            select: {
              id: true,

              user: {
                select: {
                  avatarUrl: true,
                },
              },
            },
            take: 4,
          },
          _count: {
            select: {
              participants: true,
            },
          },
          owner: {
            select: {
              name: true,
              id: true,
            },
          },
        },
      });

      return reply.status(201).send({
        polls,
      });
    }
  );

  fastify.get(
    "/pools/:id",
    {
      onRequest: [authenticate],
    },
    async (request) => {
      const getPollParams = z.object({
        id: z.string(),
      });

      const { id } = getPollParams.parse(request.params);

      const poll = await prisma.pool.findUnique({
        where: {
          id,
        },
        include: {
          participants: {
            select: {
              id: true,

              user: {
                select: {
                  avatarUrl: true,
                },
              },
            },
            take: 4,
          },
          _count: {
            select: {
              participants: true,
            },
          },
          owner: {
            select: {
              name: true,
              id: true,
            },
          },
        },
      });

      return { poll };
    }
  );
}
