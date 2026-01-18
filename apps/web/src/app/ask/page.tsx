"use client";

import { StreamProvider } from "@/providers/Stream";
import { ThreadProvider } from "@/providers/Thread";
import { lazy, Suspense } from "react";

const Thread = lazy(() =>
  import("@/components/thread").then((m) => ({
    default: m.Thread,
  })),
);

export default function AskPage() {
  return (
    <ThreadProvider>
      <StreamProvider>
        <Suspense fallback={<div>Loading chat...</div>}>
          <Thread />
        </Suspense>
      </StreamProvider>
    </ThreadProvider>
  );
}
