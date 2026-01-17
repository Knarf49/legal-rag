"use client";

import { useQueryState } from "nuqs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const AGENTS = [
  {
    id: "agent",
    name: "React Agent",
    description: "General purpose agent with web search",
  },
  {
    id: "memory_agent",
    name: "Memory Agent",
    description: "Agent with memory capabilities",
  },
  {
    id: "retrieval_agent",
    name: "Retrieval Agent",
    description: "Agent with document retrieval",
  },
  {
    id: "research_agent",
    name: "Research Agent",
    description: "Advanced research agent for legal queries",
  },
];

export function AgentSelector() {
  const [assistantId, setAssistantId] = useQueryState("assistantId", {
    defaultValue: "research_agent",
  });

  return (
    <div className="flex items-center gap-2">
      <Select
        value={assistantId || "research_agent"}
        onValueChange={setAssistantId}
      >
        <SelectTrigger id="agent-select" className="w-50 h-9">
          <SelectValue placeholder="Select an agent" />
        </SelectTrigger>
        <SelectContent>
          {AGENTS.map((agent) => (
            <SelectItem key={agent.id} value={agent.id}>
              <div className="flex flex-col">
                <span className="font-medium">{agent.name}</span>
                <span className="text-xs text-muted-foreground">
                  {agent.description}
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
