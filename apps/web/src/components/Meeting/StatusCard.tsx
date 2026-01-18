import { cn } from "@/lib/utils";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  CardTitle,
} from "../ui/card";
import { ArrowRightIcon } from "lucide-react";
import { Separator } from "../ui/separator";

type StatusCardProps = {
  status: "success" | "alert";
  title: string;
  message: string;
  time: number;
  recommendAct: string;
  className?: string;
};

export function StatusCard({
  status,
  title,
  message,
  time,
  recommendAct,
  className,
}: StatusCardProps) {
  const isSuccess = status === "success";

  return (
    <Card
      className={cn(
        "rounded-lg border border-l-6",
        className,
        isSuccess ? "border-l-secondary" : "border-l-destructive",
      )}
    >
      <CardHeader className="flex flex-row items-center gap-3">
        <div
          className={cn(
            "size-3 rounded-full",
            isSuccess ? "bg-secondary" : "bg-destructive",
          )}
        />
        <div className="flex justify-between w-full">
          <CardTitle className="text-base">{title}</CardTitle>
          <h2 className="text-primary/50">{time} min ago</h2>
        </div>
      </CardHeader>
      <CardContent className=" text-muted-foreground">{message}</CardContent>
      <Separator />
      <CardFooter className="justify-between">
        <div>
          <span className="text-primary/50 mr-2">Safe action:</span>{" "}
          {recommendAct}
        </div>
        <ArrowRightIcon size={18} className="text-primary/50" />
      </CardFooter>
    </Card>
  );
}
