import prisma from "@/lib/prisma";
import * as runtime from "@prisma/client/runtime/client.js";
import {
  Prisma,
  PrismaClient,
} from "../../../../prisma/src/generated/prisma/client";

export type PollOptionType = {
  id: string;
  text: string;
  voteCount: number;
};

export type PollType = {
  id: string;
  question: string;
  options: PollOptionType[];
  totalVotes: number;
  userVote?: string; // optionId that user voted for
  createdAt: Date;
};

export type TxClient = Omit<PrismaClient, runtime.ITXClientDenyList>;

/**
 * Get all polls with vote counts
 */
export async function getPolls(userId?: string): Promise<PollType[]> {
  const polls = await prisma.poll.findMany({
    include: {
      options: {
        include: {
          _count: {
            select: { votes: true },
          },
        },
      },
      votes: userId
        ? {
            where: { userId },
            select: { optionId: true },
          }
        : false,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return polls.map((poll) => ({
    id: poll.id,
    question: poll.question,
    options: poll.options.map((option) => ({
      id: option.id,
      text: option.text,
      voteCount: option._count.votes,
    })),
    totalVotes: poll.options.reduce(
      (sum, option) => sum + option._count.votes,
      0,
    ),
    userVote:
      userId && Array.isArray(poll.votes) && poll.votes.length > 0
        ? poll.votes[0].optionId
        : undefined,
    createdAt: poll.createdAt,
  }));
}

/**
 * Get all polls with sequence ID for models sync
 */
export async function getPollsWithSequence(
  userId?: string,
): Promise<[PollType[], number]> {
  // No need for transaction for read operations
  // Execute queries independently for better performance
  const [polls, sequenceResult] = await Promise.all([
    prisma.poll.findMany({
      include: {
        options: {
          include: {
            _count: {
              select: { votes: true },
            },
          },
        },
        votes: userId
          ? {
              where: { userId },
              select: { optionId: true },
            }
          : false,
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
    prisma.$queryRaw<
      { nextval: number }[]
    >`SELECT nextval('app."Outbox_sequence_id_seq"')::integer`,
  ]);

  const pollsData = polls.map((poll) => ({
    id: poll.id,
    question: poll.question,
    options: poll.options.map((option) => ({
      id: option.id,
      text: option.text,
      voteCount: option._count.votes,
    })),
    totalVotes: poll.options.reduce(
      (sum, option) => sum + option._count.votes,
      0,
    ),
    userVote:
      userId && Array.isArray(poll.votes) && poll.votes.length > 0
        ? poll.votes[0].optionId
        : undefined,
    createdAt: poll.createdAt,
  }));

  const [{ nextval }] = sequenceResult;

  return [pollsData, nextval];
}

/**
 * Get a single poll with vote counts and next sequence ID
 */
export async function getPoll(
  id: string,
  userId?: string,
): Promise<[PollType, number]> {
  return await prisma.$transaction(async (tx) => {
    const poll = await getPollTx(tx, id, userId);
    type r = { nextval: number };
    const [{ nextval }] = await tx.$queryRaw<
      r[]
    >`SELECT nextval('outbox_sequence_id_seq')::integer`;
    return [poll, nextval];
  });
}

async function getPollTx(
  tx: TxClient,
  id: string,
  userId?: string,
): Promise<PollType> {
  const poll = await tx.poll.findUniqueOrThrow({
    where: { id },
    include: {
      options: {
        include: {
          _count: {
            select: { votes: true },
          },
        },
      },
      votes: userId
        ? {
            where: { userId },
            select: { optionId: true },
          }
        : false,
    },
  });

  return {
    id: poll.id,
    question: poll.question,
    options: poll.options.map((option) => ({
      id: option.id,
      text: option.text,
      voteCount: option._count.votes,
    })),
    totalVotes: poll.options.reduce(
      (sum, option) => sum + option._count.votes,
      0,
    ),
    userVote:
      userId && Array.isArray(poll.votes) && poll.votes.length > 0
        ? poll.votes[0].optionId
        : undefined,
    createdAt: poll.createdAt,
  };
}

/**
 * Create a new poll with options
 */
export async function createPoll(
  tx: TxClient,
  mutationId: string,
  userId: string,
  question: string,
  options: string[],
): Promise<Prisma.OutboxCreateInput> {
  if (options.length < 2) {
    throw new Error("Poll must have at least 2 options");
  }

  const poll = await tx.poll.create({
    data: {
      question,
      options: {
        create: options.map((text) => ({ text })),
      },
    },
    include: {
      options: true,
    },
  });

  return {
    mutationId: mutationId,
    channel: "poll:list",
    name: "createPoll",
    data: poll,
    headers: {},
  };
}

/**
 * Vote on a poll (upsert to handle vote changes)
 */
export async function vote(
  tx: TxClient,
  mutationId: string,
  userId: string,
  pollId: string,
  optionId: string,
): Promise<Prisma.OutboxCreateInput> {
  // Verify the option belongs to the poll
  //   const option = await tx.pollOption.findFirstOrThrow({
  //     where: {
  //       id: optionId,
  //       pollId: pollId,
  //     },
  //   });

  // Upsert the vote (update if exists, create if not)
  const vote = await tx.vote.upsert({
    where: {
      userId_pollId: {
        userId,
        pollId,
      },
    },
    update: {
      optionId,
    },
    create: {
      userId,
      pollId,
      optionId,
    },
  });

  // Get updated poll data with vote counts
  const poll = await getPollTx(tx, pollId, userId);

  return {
    mutationId: mutationId,
    channel: `poll:${pollId}`,
    name: "vote",
    data: { vote, poll },
    headers: {},
  };
}

/**
 * Delete a poll (cascades to options and votes)
 */
export async function deletePoll(
  tx: TxClient,
  mutationId: string,
  id: string,
): Promise<Prisma.OutboxCreateInput> {
  const poll = await tx.poll.delete({
    where: { id },
  });

  return {
    mutationId: mutationId,
    channel: "poll:list",
    name: "deletePoll",
    data: poll,
    headers: {},
  };
}

/**
 * Edit poll question and/or options
 */
export async function editPoll(
  tx: TxClient,
  mutationId: string,
  id: string,
  question?: string,
  options?: { id?: string; text: string }[],
): Promise<Prisma.OutboxCreateInput> {
  // Verify poll exists
  await tx.poll.findUniqueOrThrow({ where: { id } });

  // Update question if provided
  if (question) {
    await tx.poll.update({
      where: { id },
      data: { question },
    });
  }

  // Handle options if provided
  if (options && options.length > 0) {
    for (const option of options) {
      if (option.id) {
        // Update existing option
        await tx.pollOption.update({
          where: { id: option.id },
          data: { text: option.text },
        });
      } else {
        // Create new option
        await tx.pollOption.create({
          data: {
            pollId: id,
            text: option.text,
          },
        });
      }
    }
  }

  // Get updated poll data
  const poll = await tx.poll.findUniqueOrThrow({
    where: { id },
    include: {
      options: {
        include: {
          _count: {
            select: { votes: true },
          },
        },
      },
    },
  });

  return {
    mutationId: mutationId,
    channel: `poll:${id}`,
    name: "editPoll",
    data: poll,
    headers: {},
  };
}

/**
 * Delete a poll option (only if it has no votes)
 */
export async function deletePollOption(
  tx: TxClient,
  mutationId: string,
  pollId: string,
  optionId: string,
): Promise<Prisma.OutboxCreateInput> {
  // Check if option has votes
  const voteCount = await tx.vote.count({
    where: { optionId },
  });

  if (voteCount > 0) {
    throw new Error("Cannot delete option that has votes");
  }

  // Check if poll will have at least 2 options after deletion
  const optionCount = await tx.pollOption.count({
    where: { pollId },
  });

  if (optionCount <= 2) {
    throw new Error("Poll must have at least 2 options");
  }

  const option = await tx.pollOption.delete({
    where: { id: optionId },
  });

  // Get updated poll data
  const poll = await getPollTx(tx, pollId);

  return {
    mutationId: mutationId,
    channel: `poll:${pollId}`,
    name: "deletePollOption",
    data: { option, poll },
    headers: {},
  };
}

/**
 * Wrapper to execute poll operations with outbox pattern
 */
export async function withOutboxWrite(
  op: (tx: TxClient, ...args: any[]) => Promise<Prisma.OutboxCreateInput>,
  ...args: any[]
) {
  return await prisma.$transaction(
    async (tx) => {
      const { mutationId, channel, name, data, headers } = await op(
        tx,
        ...args,
      );
      await tx.outbox.create({
        data: { mutationId, channel, name, data, headers },
      });
    },
    {
      timeout: 15000, // 15 seconds
      maxWait: 10000, // 10 seconds to wait for transaction to start
    },
  );
}
