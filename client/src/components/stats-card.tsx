import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  className?: string;
}

export function StatsCard({ title, value, icon: Icon, trend, trendUp, className }: StatsCardProps) {
  return (
    <Card className={`p-6 hover:shadow-lg transition-all duration-300 border-l-4 ${className}`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
          <h3 className="text-3xl font-bold tracking-tight">{value}</h3>
          {trend && (
            <p className={`text-xs font-medium mt-2 ${trendUp ? 'text-green-600' : 'text-red-500'}`}>
              {trend}
            </p>
          )}
        </div>
        <div className="p-3 bg-secondary rounded-xl">
          <Icon className="w-6 h-6 text-primary" />
        </div>
      </div>
    </Card>
  );
}
