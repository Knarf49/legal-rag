"use client";
import { PollItems } from "@/components/poll/PollItem";
import { Button } from "@/components/ui/button";
import { usePollList } from "@/lib/models/hook";
import Link from "next/link";
import Ably from "ably";
import { AblyProvider } from "ably/react";
import { useMemo } from "react";

//   mutationId: string,userId: string,question: string,options: string[],
function PollList() {
  const [polls, _] = usePollList();

  if (!polls) return <div>Loading...</div>;

  if (polls.length === 0) {
    return (
      <>
        <div className="flex items-center justify-center min-h-100">
          <p className="text-muted-foreground">Not have any poll yet</p>
        </div>
      </>
    );
  }

  return (
    <div>
      <Link href="/poll/create">
        <Button>Create Poll</Button>
      </Link>
      {polls.map((poll) => (
        <PollItems key={poll.id} poll={poll} />
      ))}
    </div>
  );
}

export default function PollListPage() {
  const client = useMemo(
    () =>
      new Ably.Realtime({
        key: process.env.NEXT_PUBLIC_ABLY_API_KEY,
      }),
    [],
  );

  return (
    <AblyProvider client={client}>
      <PollList />
    </AblyProvider>
  );
}
