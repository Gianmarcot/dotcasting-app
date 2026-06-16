import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { LucideIcon } from "lucide-react";

interface Props {
  title: string;
  value: number;
  icon: LucideIcon;
  link: string;
  isLoading?: boolean;
}

export const ActionableStatCard = ({ title, value, icon: Icon, link, isLoading }: Props) => {
  const navigate = useNavigate();
  const needsAttention = value > 0;

  return (
    <Card
      onClick={() => navigate(link)}
      className={`cursor-pointer transition-shadow hover:shadow-md border-0 shadow-sm rounded-3xl ${
        needsAttention
          ? "bg-olive text-olive-foreground"
          : "bg-white text-foreground"
      }`}
    >
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div className="min-w-0">
            <p
              className={`text-sm ${
                needsAttention ? "text-olive-foreground/80" : "text-muted-foreground"
              }`}
            >
              {title}
            </p>
            {isLoading ? (
              <Skeleton className="h-9 w-16 mt-1" />
            ) : (
              <p className="text-3xl font-semibold mt-1">
                {value.toLocaleString("it-IT")}
              </p>
            )}
          </div>
          <Icon
            className={`h-8 w-8 ${
              needsAttention ? "opacity-80" : "text-muted-foreground/60"
            }`}
          />
        </div>
      </CardContent>
    </Card>
  );
};
