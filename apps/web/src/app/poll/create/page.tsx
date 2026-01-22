"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { createPoll } from "@/lib/models/mutations";
import { v4 as uuidv4 } from "uuid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
//TODO: ทำให้ UI update realtime
export default function CreatePollPage() {
  const session = useSession();
  const router = useRouter();
  const userId = session.data?.user?.id;

  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userId) {
      alert("Please login first");
      return;
    }

    const filteredOptions = options.filter((opt) => opt.trim() !== "");
    if (filteredOptions.length < 2) {
      alert("Please provide at least 2 options");
      return;
    }

    setIsSubmitting(true);
    try {
      const mutationId = uuidv4();
      await createPoll(mutationId, userId, question, filteredOptions);
      router.push("/poll");
    } catch (error) {
      console.error("Failed to create poll:", error);
      alert("Failed to create poll");
    } finally {
      setIsSubmitting(false);
    }
  };

  const addOption = () => setOptions([...options, ""]);
  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Create New Poll</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-2">Question</label>
          <Input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Enter your question"
            required
          />
        </div>

        <div>
          <label className="block mb-2">Options</label>
          {options.map((option, index) => (
            <Input
              key={index}
              value={option}
              onChange={(e) => updateOption(index, e.target.value)}
              placeholder={`Option ${index + 1}`}
              className="mb-2"
            />
          ))}
          <Button type="button" onClick={addOption} variant="outline">
            Add Option
          </Button>
        </div>

        <Button type="submit" disabled={isSubmitting || !userId}>
          {isSubmitting ? "Creating..." : "Create Poll"}
        </Button>
      </form>
    </div>
  );
}
