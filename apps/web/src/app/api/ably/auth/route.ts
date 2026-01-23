import { auth } from "@/lib/auth/auth-node";
import { NextRequest, NextResponse } from "next/server";
import * as Ably from "ably";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Use server-side ABLY_API_KEY (not NEXT_PUBLIC_*)
    const apiKey = process.env.ABLY_API_KEY;

    if (!apiKey) {
      console.error("Ably API key not found in environment variables");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 },
      );
    }

    const client = new Ably.Rest(apiKey);

    const tokenParams: Ably.TokenParams = {
      clientId: session.user.id,
      capability: {
        "poll:*": ["subscribe", "publish"],
        "poll:list": ["subscribe"],
      },
    };

    const tokenRequest = await client.auth.createTokenRequest(tokenParams);
    return NextResponse.json(tokenRequest);
  } catch (error) {
    console.error("Ably auth error:", error);
    return NextResponse.json(
      {
        error: "Failed to create token",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
