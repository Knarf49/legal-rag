"use client";

import { useEffect, useState } from "react";
import { Model, SyncReturnType } from "@ably-labs/models";
import { modelsClient } from "./modelsClient";
import { mergePoll, mergePollList } from "@/lib/models/mutations";
import type { PollType } from "@/lib/poll";

export type PollModelType = Model<(id: string) => SyncReturnType<PollType>>;
export type PollListModelType = Model<() => SyncReturnType<PollType[]>>;

/**
 * Fetch a single poll with sequence ID
 */
export async function getPoll(id: string) {
  const response = await fetch(`/api/polls/${id}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  if (!response.ok)
    throw new Error(
      `GET /api/polls/:id: ${response.status} ${JSON.stringify(await response.json())}`,
    );
  const { sequenceId, data } = (await response.json()) as {
    sequenceId: number;
    data: PollType;
  };
  return { sequenceId, data };
}

/**
 * Fetch all polls with sequence ID
 */
export async function getPollList() {
  const response = await fetch("/api/polls", {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  if (!response.ok)
    throw new Error(
      `GET /api/polls: ${response.status} ${JSON.stringify(await response.json())}`,
    );
  const { data, sequenceId } = (await response.json()) as {
    data: PollType[];
    sequenceId: number;
  };
  return { sequenceId, data };
}

/**
 * Custom hook to manage a single poll with real-time updates
 */
export const usePoll = (
  id: string | null,
): [PollType | undefined, PollModelType | undefined] => {
  const [pollData, setPollData] = useState<PollType>();
  const [model, setModel] = useState<PollModelType>();

  // Initialize model with channel and sync function
  useEffect(() => {
    if (!id) return;
    const model: PollModelType = modelsClient().models.get({
      channelName: `poll:${id}`,
      sync: async () => getPoll(id),
      merge: mergePoll,
    });
    setModel(model);
  }, [id]);

  // Synchronize model when id changes
  useEffect(() => {
    if (!id || !model) return;
    const syncPoll = async () => await model.sync(id);
    syncPoll();
  }, [id, model]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!model) return;
    const subscribe = (err: Error | null, data?: PollType | undefined) => {
      if (err) return console.error(err);
      setPollData(data);
    };
    model.subscribe(subscribe);

    return () => model.unsubscribe(subscribe);
  }, [model]);

  return [pollData, model];
};

/**
 * Custom hook to manage a list of polls with real-time updates
 */
export const usePollList = (): [
  PollType[] | undefined,
  PollListModelType | undefined,
] => {
  const [pollsData, setPollsData] = useState<PollType[]>();
  const [model, setModel] = useState<PollListModelType>();

  // Initialize model with channel and sync function
  useEffect(() => {
    const model: PollListModelType = modelsClient().models.get({
      channelName: "poll:list",
      sync: async () => getPollList(),
      merge: mergePollList,
    });
    setModel(model);
  }, []);

  // Synchronize model on mount
  useEffect(() => {
    if (!model) return;
    const syncPolls = async () => await model.sync();
    syncPolls();
  }, [model]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!model) return;
    const subscribe = (err: Error | null, data?: PollType[] | undefined) => {
      if (err) return console.error(err);
      setPollsData(data);
    };
    model.subscribe(subscribe);

    return () => model.unsubscribe(subscribe);
  }, [model]);

  return [pollsData, model];
};
