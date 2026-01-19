"use client";

import { Suspense } from "react";
import { Thread } from "@/components/thread";
import { StreamProvider } from "@/providers/Stream";
import { ThreadProvider } from "@/providers/Thread";

function AskPageContent() {
  return (
    <ThreadProvider>
      <StreamProvider>
        <div className="py-18">
          <Thread />
        </div>
      </StreamProvider>
    </ThreadProvider>
  );
}

export default function AskPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AskPageContent />
    </Suspense>
  );
}
