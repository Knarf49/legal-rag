import { ConfirmedEvent, OptimisticEvent } from "@ably-labs/models";
import cloneDeep from "lodash/cloneDeep";
import type { PollType } from "@/lib/poll";

export async function createPoll(
  mutationId: string,
  userId: string,
  question: string,
  options: string[],
) {
  const response = await fetch("/api/polls", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mutationId, userId, question, options }),
  });
  if (!response.ok)
    throw new Error(
      `POST /api/polls: ${response.status} ${JSON.stringify(await response.json())}`,
    );
  return response.json();
}

/**
 * Vote on a poll
 */
export async function vote(
  mutationId: string,
  userId: string,
  pollId: string,
  optionId: string,
) {
  const response = await fetch(`/api/polls/${pollId}/vote`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mutationId, userId, optionId }),
  });
  if (!response.ok)
    throw new Error(
      `POST /api/polls/:id/vote: ${response.status} ${JSON.stringify(await response.json())}`,
    );
  return response.json();
}

/**
 * Edit a poll
 */
export async function editPoll(
  mutationId: string,
  id: string,
  question?: string,
  options?: { id?: string; text: string }[],
) {
  const response = await fetch(`/api/polls/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mutationId, question, options }),
  });
  if (!response.ok)
    throw new Error(
      `PUT /api/polls/:id: ${response.status} ${JSON.stringify(await response.json())}`,
    );
  return response.json();
}

/**
 * Delete a poll
 */
export async function deletePoll(mutationId: string, id: string) {
  const response = await fetch(`/api/polls/${id}`, {
    method: "DELETE",
    headers: { "x-mutation-id": mutationId },
  });
  if (!response.ok)
    throw new Error(
      `DELETE /api/polls/:id: ${response.status} ${JSON.stringify(await response.json())}`,
    );
  return response.json();
}

/**
 * Delete a poll option
 */
export async function deletePollOption(
  mutationId: string,
  pollId: string,
  optionId: string,
) {
  const response = await fetch(`/api/polls/${pollId}/options/${optionId}`, {
    method: "DELETE",
    headers: { "x-mutation-id": mutationId },
  });
  if (!response.ok)
    throw new Error(
      `DELETE /api/polls/:id/options/:optionId: ${response.status} ${JSON.stringify(await response.json())}`,
    );
  return response.json();
}

/**
 * Merge function to handle optimistic and confirmed events for polls
 */
export function mergePoll(
  existingState: PollType,
  event: OptimisticEvent | ConfirmedEvent,
): PollType {
  // Optimistic and confirmed events use the same merge function logic.
  // The models function keeps track of the state before events are applied
  // to make sure the rollback of unconfirmed events works, we need to clone
  // the state here. Our state contains an array of objects so we don't use
  // the regular object spread operator.
  const state = cloneDeep(existingState);

  switch (event.name) {
    case "createPoll":
      // This event is typically handled at the list level, not individual poll level
      console.log("Poll created:", event.data);
      break;

    case "vote": {
      const voteData = event.data! as {
        vote: { userId: string; optionId: string };
        poll: PollType;
      };
      // Update the entire poll state with the new vote counts
      return voteData.poll;
    }

    case "editPoll": {
      const editedPoll = event.data! as PollType;
      state.question = editedPoll.question;
      state.options = editedPoll.options;
      break;
    }

    case "deletePoll":
      // This event is typically handled at the list level
      console.log("Poll deleted:", event.data);
      break;

    case "deletePollOption": {
      const deletedOptionData = event.data! as {
        option: { id: string };
        poll: PollType;
      };
      // Update with the new poll state after option deletion
      return deletedOptionData.poll;
    }

    default:
      console.error("unknown poll event", event);
  }

  return state;
}

/**
 * Merge function to handle poll list events (for list of polls)
 * Optimized with shallow copy for better performance
 */
export function mergePollList(
  existingState: PollType[],
  event: OptimisticEvent | ConfirmedEvent,
): PollType[] {
  switch (event.name) {
    case "createPoll": {
      const newPoll = event.data! as PollType;
      return [newPoll, ...existingState];
    }

    case "deletePoll": {
      const deletedPoll = event.data! as { id: string };
      return existingState.filter((p) => p.id !== deletedPoll.id);
    }

    case "vote":
    case "editPoll":
    case "deletePollOption": {
      let updatedPoll: PollType;
      if ("poll" in (event.data as any)) {
        updatedPoll = (event.data as { poll: PollType }).poll;
      } else {
        updatedPoll = event.data as PollType;
      }

      return existingState.map((poll) =>
        poll.id === updatedPoll.id ? updatedPoll : poll,
      );
    }

    default:
      console.error("unknown poll list event", event);
      return existingState;
  }
}
