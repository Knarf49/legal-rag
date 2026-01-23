import { auth } from "@/lib/auth/auth-node";
import { NextRequest, NextResponse } from "next/server";
import * as Ably from "ably";

export async function GET(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const client = new Ably.Rest(process.env.NEXT_PUBLIC_ABLY_API_KEY || "");

  const tokenParams: Ably.TokenParams = {
    clientId: session.user.id,
    // Set capabilities for specific channels
    capability: {
      "poll:*": ["subscribe", "publish"],
      "poll:list": ["subscribe"],
    },
  };

  try {
    const tokenRequest = await client.auth.createTokenRequest(tokenParams);
    return NextResponse.json(tokenRequest);
  } catch (error) {
    console.error("Ably auth error:", error);
    return NextResponse.json(
      { error: "Failed to create token" },
      { status: 500 },
    );
  }
}
