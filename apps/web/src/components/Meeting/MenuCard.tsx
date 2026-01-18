import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { toUpper } from "lodash";
import { Clock, TriangleAlert, Users } from "lucide-react";
import { Separator } from "../ui/separator";
import { Progress } from "../ui/progress";

type MeetingCardProps = {
  type: string;
  variant?: "sm" | "lg";
  title: string;
  detail?: string;
  time?: string;
  value?: number;
  className?: string;
};

export default function MenuCard({
  type,
  variant = "lg",
  title,
  detail,
  time,
  value,
  className,
}: MeetingCardProps) {
  const isLg = variant === "lg";
  return (
    <Card className={cn("rounded-lg", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h2 className="text-primary/50 font-semibold">{toUpper(type)}</h2>
          <Badge variant="secondary" className="rounded-full space-x-1">
            <TriangleAlert size={18} />
            <span>Medium Risk</span>
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <h1 className="text-2xl font-semibold">{title}</h1>
        {detail && <h2 className="my-4 text-primary/50">{detail}</h2>}
        {time && (
          <div className="flex text-primary/50 gap-x-4 my-4">
            <div className="flex gap-x-2">
              <Clock />
              {time} PM
            </div>
            <div className="flex gap-x-2">
              <Users />8 attendances
            </div>
          </div>
        )}
      </CardContent>
      {isLg && <Separator />}

      {isLg && (
        <CardFooter className="block">
          <div className="flex justify-between text-primary/50">
            <h2>Current Item</h2>
            <h2>3 of 7</h2>
          </div>
          <div className="flex items-center font-semibold my-4">
            <div className="bg-secondary size-3 mr-2 rounded-full" />
            <h2>Approval of Related Party Transaction</h2>
          </div>
          <Progress value={value || 0} />
        </CardFooter>
      )}
    </Card>
  );
}
