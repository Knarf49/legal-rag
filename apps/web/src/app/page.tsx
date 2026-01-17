"use client";

import { StreamProvider } from "@/providers/Stream";
import { ThreadProvider } from "@/providers/Thread";
import { Toaster } from "@/components/ui/sonner";
import React from "react";

export default function DashboardPage(): React.ReactNode {
  return (
    <React.Suspense fallback={<div>Loading (layout)...</div>}>
      <Toaster />
      <ThreadProvider>
        <StreamProvider>
          <div className="pt-18 container mx-auto">
            {/* dashboard */}
          </div>
        </StreamProvider>
      </ThreadProvider>
    </React.Suspense>
  );
}
