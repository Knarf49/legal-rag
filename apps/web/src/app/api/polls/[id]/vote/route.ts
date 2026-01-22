import { auth } from "@/lib/auth/auth-node";
import { vote, withOutboxWrite } from "@/lib/poll";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import * as Ably from "ably";

const ably = new Ably.Rest(process.env.NEXT_PUBLIC_ABLY_API_KEY || "");

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    const pollId = (await params).id;
    const body: {
      mutationId: string;
      userId: string;
      optionId: string;
    } = await request.json();

    const data = await withOutboxWrite(
      vote,
      body.mutationId,
      userId,
      pollId,
      body.optionId,
    );

    const latestEntry = await prisma.outbox.findFirst({
      where: {
        mutationId: body.mutationId,
        processed: false,
      },
      orderBy: { sequenceId: "desc" },
    });

    if (latestEntry) {
      // Publish to individual poll channel
      const pollChannel = ably.channels.get(latestEntry.channel);
      await pollChannel.publish(latestEntry.name, latestEntry.data);

      // Also publish to poll list channel for realtime updates
      const listChannel = ably.channels.get("poll:list");
      await listChannel.publish(latestEntry.name, latestEntry.data);

      await prisma.outbox.update({
        where: { sequenceId: latestEntry.sequenceId },
        data: { processed: true },
      });

      console.log(`✅ Published vote to ${latestEntry.channel} and poll:list`);
    }
    return NextResponse.json({ data });
  } catch (error) {
    console.error("failed to vote poll", error);
    return NextResponse.json(
      { message: "failed to vote poll", error },
      { status: 500 },
    );
  }
}
