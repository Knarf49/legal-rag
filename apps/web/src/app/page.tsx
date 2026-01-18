"use client";
import { MeetingStatusCard } from "@/components/Meeting/MeetingStatus";
import MenuCard from "@/components/Meeting/MenuCard";
import { StatusCard } from "@/components/Meeting/StatusCard";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { ChevronRight, Shield } from "lucide-react";

export default function DashboardPage() {
  return (
    <div>
      <Toaster />
      <div className="py-18 container mx-auto px-4 space-y-6">
        <MenuCard
          type="board meeting"
          title="Q4 Board Review"
          time="2:30"
          value={40}
          variant="lg"
        />

        <Button className="w-full justify-between py-6">
          <div className="flex gap-x-2">
            <Shield />
            <span>View Legal Check</span>
          </div>
          <ChevronRight />
        </Button>

        {/* Meeting status */}
        <MeetingStatusCard
          items={[
            { label: "Clear", value: 4, variant: "clear" },
            { label: "Caution", value: 2, variant: "caution" },
            { label: "Review", value: 1, variant: "review" },
          ]}
        />

        <section>
          <div className="flex justify-between pb-4">
            <h1>Latest Alert</h1>
            <h2 className="text-primary/50">View all</h2>
          </div>

          <StatusCard
            status="success"
            recommendAct="Request Director A to recuse before proceeding"
            title="Conflic of Interest Detected"
            time={2}
            message="Director A has a material interest in his transaction"
          />
        </section>

        <h2 className="text-primary/50 text-center py-8">
          This tool provides legal risk awareness, not legal advise. Always
          consult qualified legal counsel for decisions.
        </h2>
      </div>
    </div>
  );
}
