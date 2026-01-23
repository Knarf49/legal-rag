import { auth } from "@/lib/auth/auth-node";
import { vote } from "@/lib/poll";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const pollId = (await params).id;
    const body: {
      optionId: string;
    } = await request.json();

    const data = await vote(userId, pollId, body.optionId);

    return NextResponse.json({ data });
  } catch (error) {
    console.error("failed to vote poll", error);
    return NextResponse.json(
      { message: "failed to vote poll", error },
      { status: 500 },
    );
  }
}
