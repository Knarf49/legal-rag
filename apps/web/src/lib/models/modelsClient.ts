// File: lib/models/modelsClient.ts

import ModelsClient from "@ably-labs/models";
import { Realtime } from "ably";

let client: ModelsClient;

export const modelsClient = () => {
  const ably = new Realtime({
    authUrl: "/api/ably/auth",
    authMethod: "GET",
  });
  if (!client) client = new ModelsClient({ ably });
  return client;
};
