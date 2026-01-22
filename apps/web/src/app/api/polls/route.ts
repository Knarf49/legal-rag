export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

import { NextRequest, NextResponse } from "next/server";
import { createPoll, getPollsWithSequence, withOutboxWrite } from "@/lib/poll";
import { auth } from "@/lib/auth/auth-node";
import prisma from "@/lib/prisma";
import * as Ably from "ably";

const ably = new Ably.Rest(process.env.NEXT_PUBLIC_ABLY_API_KEY || "");

export async function GET(_: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id ?? undefined;
    const [data, sequenceId] = await getPollsWithSequence(userId);
    return NextResponse.json({ sequenceId, data });
  } catch (error) {
    console.error("failed to get polls", error);
    return NextResponse.json(
      { message: "failed to get polls", error },
      { status: 500 },
    );
  }
}

//create new poll
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    const body: {
      mutationId: string;
      userId: string;
      question: string;
      options: string[];
    } = await request.json();

    await withOutboxWrite(
      createPoll,
      body.mutationId,
      userId,
      body.question,
      body.options,
    );

    // Immediately process outbox entry
    const latestEntry = await prisma.outbox.findFirst({
      where: {
        mutationId: body.mutationId,
        processed: false,
      },
      orderBy: { sequenceId: "desc" },
    });

    if (latestEntry) {
      const channel = ably.channels.get(latestEntry.channel);
      await channel.publish(latestEntry.name, latestEntry.data);

      await prisma.outbox.update({
        where: { sequenceId: latestEntry.sequenceId },
        data: { processed: true },
      });

      console.log(`✅ Published createPoll to ${latestEntry.channel}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("failed to create poll", error);
    return NextResponse.json(
      { message: "failed to create poll", error },
      { status: 500 },
    );
  }
}
