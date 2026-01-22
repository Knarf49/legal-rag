// components/poll/PollItems.tsx
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PollOption } from "./PollOption";
import type { PollType } from "@/lib/poll";
import { vote } from "@/lib/models/mutations";
import { v4 as uuidv4 } from "uuid";
import { useSession } from "next-auth/react";
//TODO: แก้ให้ poll update แบบ realtime
type PollItemsProps = {
  poll: PollType;
  onVote?: (optionId: string) => void;
  showResult?: boolean;
  className?: string;
};

export function PollItems({
  poll,
  onVote,
  showResult = true,
  className,
}: PollItemsProps) {
  const [selectedId, setSelectedId] = useState<string | null>(
    poll.userVote ?? null,
  );
  const [isVoting, setIsVoting] = useState(false);

  const session = useSession();
  const userId = session.data?.user?.id;
  const isSessionLoading = session.status === "loading";

  const handleVote = async (optionId: string) => {
    if (!userId) {
      console.warn("User must be logged in to vote");
      return;
    }

    const previousSelection = selectedId;
    setSelectedId(optionId);
    setIsVoting(true);

    try {
      const mutationId = uuidv4();
      await vote(mutationId, userId, poll.id, optionId);
      onVote?.(optionId);
    } catch (error) {
      console.error("Failed to vote:", error);
      setSelectedId(previousSelection);
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-base">{poll.question}</CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        {poll.options.map((option) => {
          const percentage =
            poll.totalVotes > 0
              ? Math.round((option.voteCount / poll.totalVotes) * 100)
              : 0;

          return (
            <PollOption
              key={option.id}
              id={option.id}
              label={option.text}
              votes={option.voteCount}
              percentage={percentage}
              selected={selectedId === option.id}
              disabled={isVoting || !userId || isSessionLoading}
              showResult={showResult}
              onSelect={handleVote}
            />
          );
        })}
      </CardContent>
    </Card>
  );
}
