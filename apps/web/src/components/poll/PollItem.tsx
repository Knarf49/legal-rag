// components/poll/PollItems.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PollOption } from "./PollOption";
import type { PollType } from "@/lib/poll";
import { v4 as uuidv4 } from "uuid";
import { useSession } from "next-auth/react";
import { toast } from "react-toastify";
import { useState } from "react";

type PollItemsProps = {
  poll: PollType;
  onVote?: () => void;
  showResult?: boolean;
  className?: string;
};

export function PollItems({
  poll: initialPoll,
  onVote,
  showResult = true,
  className,
}: PollItemsProps) {
  const [currentPoll, setCurrentPoll] = useState(initialPoll);
  const [isVoting, setIsVoting] = useState(false);
  const session = useSession();
  const userId = session.data?.user?.id;
  const isSessionLoading = session.status === "loading";

  const selectedId = currentPoll.userVote ?? null;

  const handleVote = async (optionId: string) => {
    if (!userId) {
      toast.error("You must be logged in to vote");
      return;
    }

    if (isVoting) return;

    setIsVoting(true);
    const mutationId = uuidv4();

    // Optimistic update
    const optimisticPoll: PollType = {
      ...currentPoll,
      userVote: optionId,
      options: currentPoll.options.map((opt) => {
        if (opt.id === optionId) {
          return { ...opt, voteCount: opt.voteCount + 1 };
        } else if (opt.id === selectedId) {
          return { ...opt, voteCount: Math.max(0, opt.voteCount - 1) };
        }
        return opt;
      }),
      totalVotes:
        selectedId === null
          ? currentPoll.totalVotes + 1
          : currentPoll.totalVotes,
    };

    setCurrentPoll(optimisticPoll);

    try {
      const response = await fetch(`/api/polls/${currentPoll.id}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ optionId }),
      });

      if (!response.ok) {
        throw new Error("Failed to vote");
      }

      // Refresh from server
      const pollResponse = await fetch(`/api/polls/${currentPoll.id}`);
      if (pollResponse.ok) {
        const { data } = await pollResponse.json();
        setCurrentPoll(data);
      }

      onVote?.();
    } catch (error) {
      console.error("Failed to vote:", error);
      toast.error(error instanceof Error ? error.message : "Failed to vote");
      // Revert optimistic update
      setCurrentPoll(initialPoll);
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-base">{currentPoll.question}</CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        {currentPoll.options.map((option) => {
          const percentage =
            currentPoll.totalVotes > 0
              ? Math.round((option.voteCount / currentPoll.totalVotes) * 100)
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
