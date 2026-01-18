import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type StatusItem = {
  label: string;
  value: number;
  variant: "clear" | "caution" | "review";
};

const STATUS_STYLES: Record<StatusItem["variant"], string> = {
  clear: "bg-green-50 text-green-700",
  caution: "bg-yellow-50 text-yellow-700",
  review: "bg-red-50 text-red-700",
};

export function MeetingStatusCard({
  title = "Meeting Status",
  items,
}: {
  title?: string;
  items: StatusItem[];
}) {
  return (
    <Card className="rounded-2xl">
      <CardHeader className="pb-1">
        <h1 className="text-lg text-muted-foreground">{title}</h1>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-3 gap-4">
          {items.map((item) => (
            <div
              key={item.label}
              className={cn(
                "flex flex-col items-center justify-center rounded-xl py-4",
                STATUS_STYLES[item.variant],
              )}
            >
              <div className="text-3xl font-semibold">{item.value}</div>
              <div className="text-sm text-muted-foreground">{item.label}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
