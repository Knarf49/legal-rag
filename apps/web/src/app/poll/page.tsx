"use client";
import { PollItems } from "@/components/poll/PollItem";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { PollType } from "@/lib/poll";

export const dynamic = "force-dynamic";

export default function PollListPage() {
  const [polls, setPolls] = useState<PollType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPolls = async () => {
    try {
      const response = await fetch("/api/polls");
      if (!response.ok) throw new Error("Failed to fetch polls");
      const { data } = await response.json();
      setPolls(data);
    } catch (error) {
      console.error("Failed to fetch polls:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPolls();
  }, []);

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <Link href="/poll/create">
        <Button>Create Poll</Button>
      </Link>

      {polls.length === 0 ? (
        <div className="flex items-center justify-center min-h-100">
          <p className="text-muted-foreground">Not have any poll yet</p>
        </div>
      ) : (
        polls.map((poll) => (
          <PollItems key={poll.id} poll={poll} onVote={fetchPolls} />
        ))
      )}
    </div>
  );
}
