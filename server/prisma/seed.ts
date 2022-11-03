import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.create({
    data: {
      name: "John Doe",
      email: "johndoe@rocketseat.com",
      avatarUrl: "http://github.com/yankaique.png",
    },
  });

  const pool = await prisma.pool.create({
    data: {
      code: "BOL0001",
      title: "Example John Doe Pool",
      ownerId: user.id,
      participants: {
        create: {
          userId: user.id,
        },
      },
    },
  });

  await prisma.game.create({
    data: {
      date: "2022-11-03T12:05:23.801Z",
      firstTeamCountryCode: "BE",
      secondTeamCountryCode: "BR",
    },
  });

  await prisma.game.create({
    data: {
      date: "2022-11-04T12:05:23.801Z",
      firstTeamCountryCode: "BR",
      secondTeamCountryCode: "AR",
      guesses: {
        create: {
          firstTeamPoints: 2,
          secondTeamPoints: 1,

          participants: {
            connect: {
              userId_poolId: {
                userId: user.id,
                poolId: pool.id,
              },
            },
          },
        },
      },
    },
  });
}

main();
